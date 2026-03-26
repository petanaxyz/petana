import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import {
  calculateCurrentHp,
  getAgentStatus,
  applyTaskBoost,
  calculateLevel,
  getXpForTask,
  hasEvolved,
} from '../services/hp.service';
import { logQuestOnChain } from '../services/solana.service';
import { broadcast } from '../ws/handler';
import type { TaskType } from '../types';

const prisma = new PrismaClient();

const AgentSchema = z.object({
  name:        z.string().min(1).max(50),
  type:        z.enum(['trading', 'dev', 'social', 'defi', 'onchain']),
  petType:     z.enum(['dog', 'cat', 'bird', 'fish', 'hamster']),
  description: z.string().max(200).optional(),
  ownerWallet: z.string().min(32).max(44),
});

const TaskSchema = z.object({
  type:    z.enum(['trade', 'commit', 'post', 'swap', 'battle']),
  payload: z.record(z.unknown()),
});

export async function agentRoutes(server: FastifyInstance): Promise<void> {

  // GET /agents/:walletAddress — all agents for a wallet
  server.get<{ Params: { walletAddress: string } }>(
    '/agents/:walletAddress',
    async (req, reply) => {
      const { walletAddress } = req.params;
      const agents = await prisma.agent.findMany({
        where: { ownerWallet: walletAddress },
        orderBy: { createdAt: 'desc' },
      });

      // Return with real-time HP
      const agentsWithHp = agents.map(a => ({
        ...a,
        hp:     calculateCurrentHp(a),
        status: getAgentStatus(calculateCurrentHp(a)),
        xpToNextLevel: (() => {
          const level = calculateLevel(a.xp);
          if (level >= 10) return 0;
          const thresholds = [0,100,250,500,850,1300,1900,2700,3700,5000];
          return thresholds[level] - a.xp;
        })()
      }));

      return reply.send(agentsWithHp);
    }
  );

  // GET /agents/:id/detail — single agent
  server.get<{ Params: { id: string } }>(
    '/agents/:id/detail',
    async (req, reply) => {
      const agent = await prisma.agent.findUnique({ where: { id: req.params.id } });
      if (!agent) return reply.code(404).send({ error: 'Agent not found' });

      const currentHp = calculateCurrentHp(agent);
      return reply.send({
        ...agent,
        hp:     currentHp,
        status: getAgentStatus(currentHp),
      });
    }
  );

  // POST /agents — register a new agent
  server.post('/agents', async (req, reply) => {
    const result = AgentSchema.safeParse(req.body);
    if (!result.success) return reply.code(400).send({ error: result.error.issues });

    const agent = await prisma.agent.create({ data: result.data });
    return reply.code(201).send(agent);
  });

  // POST /agents/:id/task — submit completed task
  server.post<{ Params: { id: string } }>(
    '/agents/:id/task',
    async (req, reply) => {
      const result = TaskSchema.safeParse(req.body);
      if (!result.success) return reply.code(400).send({ error: result.error.issues });

      const agent = await prisma.agent.findUnique({ where: { id: req.params.id } });
      if (!agent) return reply.code(404).send({ error: 'Agent not found' });

      const { type, payload } = result.data;
      const currentHp = calculateCurrentHp(agent);
      const newHp     = applyTaskBoost(currentHp, type as TaskType);
      const xpGain    = getXpForTask(type as TaskType);
      const newXp     = agent.xp + xpGain;
      const oldLevel  = calculateLevel(agent.xp);
      const newLevel  = calculateLevel(newXp);
      const newStatus = getAgentStatus(newHp);
      const evolved   = hasEvolved(oldLevel, newLevel) && !agent.evolved;

      // Update agent
      const updated = await prisma.agent.update({
        where: { id: agent.id },
        data: {
          hp:        newHp,
          xp:        newXp,
          level:     newLevel,
          status:    newStatus,
          evolved:   evolved ? true : agent.evolved,
          lastTaskAt: new Date(),
        },
      });

      // Log quest (try on-chain, fallback to DB only)
      let txHash: string | undefined;
      try {
        txHash = await logQuestOnChain({
          agentId:   agent.id,
          agentName: agent.name,
          type,
          payload: payload as Record<string, unknown>,
          xpGained:  xpGain,
          hpChange:  newHp - currentHp,
        });
      } catch (err) {
        console.warn('On-chain log failed, saving DB only:', err);
      }

      const quest = await prisma.quest.create({
        data: {
          agentId:  agent.id,
          type,
          payload,
          xpGained: xpGain,
          hpChange: newHp - currentHp,
          txHash,
        },
      });

      // Broadcast real-time events
      broadcast(agent.ownerWallet, { type: 'hp_update', agentId: agent.id, hp: newHp });
      broadcast(agent.ownerWallet, { type: 'xp_update', agentId: agent.id, xp: newXp });
      broadcast(agent.ownerWallet, { type: 'quest_complete', agentId: agent.id, questId: quest.id });

      if (newLevel > oldLevel) {
        broadcast(agent.ownerWallet, { type: 'level_up', agentId: agent.id, level: newLevel });
      }
      if (evolved) {
        broadcast(agent.ownerWallet, { type: 'evolved', agentId: agent.id, evolved: true });
      }

      return reply.send({ agent: updated, quest, xpGained: xpGain, hpBefore: currentHp, hpAfter: newHp });
    }
  );

  // GET /agents/:id/quests — quest log
  server.get<{ Params: { id: string }; Querystring: { limit?: string } }>(
    '/agents/:id/quests',
    async (req, reply) => {
      const limit = Math.min(parseInt(req.query.limit || '50'), 100);
      const quests = await prisma.quest.findMany({
        where: { agentId: req.params.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return reply.send(quests);
    }
  );

  // GET /leaderboard
  server.get('/leaderboard', async (_req, reply) => {
    const agents = await prisma.agent.findMany({
      orderBy: { xp: 'desc' },
      take: 50,
      select: { id: true, name: true, petType: true, type: true, xp: true, level: true, hp: true, evolved: true, ownerWallet: true }
    });
    return reply.send(agents);
  });
}

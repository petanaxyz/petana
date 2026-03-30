import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { calculateCurrentHp, getAgentStatus, applyTaskBoost, calculateLevel, getXpForTask, hasEvolved } from '../services/hp.service';
import { logQuestOnChain } from '../services/solana.service';
import { broadcast } from '../ws/handler';
import type { TaskType } from '../types';

const prisma = new PrismaClient();

const AgentSchema = z.object({
  name:        z.string().min(1).max(50),
  type:        z.enum(['trading','dev','social','defi','onchain']),
  petType:     z.enum(['dog','cat','bird','fish','hamster','lion','tiger','wolf','fox','bear','eagle','dragon','shark','leopard','phoenix']),
  description: z.string().max(200).optional(),
  ownerWallet: z.string().min(32).max(44),
});

const TaskSchema = z.object({
  type:    z.enum(['trade','commit','post','swap','battle']),
  payload: z.record(z.unknown()),
});

function generateApiKey(): string {
  return 'petana_' + randomBytes(24).toString('hex');
}

async function processTask(agent: any, type: string, payload: Record<string, unknown>) {
  const currentHp = calculateCurrentHp(agent);
  const newHp = applyTaskBoost(currentHp, type as TaskType);
  const xpGain = getXpForTask(type as TaskType);
  const newXp = agent.xp + xpGain;
  const oldLevel = calculateLevel(agent.xp);
  const newLevel = calculateLevel(newXp);
  const newStatus = getAgentStatus(newHp);
  const evolved = hasEvolved(oldLevel, newLevel) && !agent.evolved;

  const updated = await prisma.agent.update({
    where: { id: agent.id },
    data: { hp: newHp, xp: newXp, level: newLevel, status: newStatus, evolved: evolved ? true : agent.evolved, lastTaskAt: new Date() },
  });

  let txHash: string | undefined;
  try {
    txHash = await logQuestOnChain({ agentId: agent.id, agentName: agent.name, type, payload, xpGained: xpGain, hpChange: newHp - currentHp });
  } catch (err) { console.warn('On-chain log failed:', err); }

  const quest = await prisma.quest.create({
    data: { agentId: agent.id, type, payload: payload as any, xpGained: xpGain, hpChange: newHp - currentHp, txHash },
  });

  broadcast(agent.ownerWallet, { type: 'hp_update', agentId: agent.id, hp: newHp });
  broadcast(agent.ownerWallet, { type: 'xp_update', agentId: agent.id, xp: newXp });
  broadcast(agent.ownerWallet, { type: 'quest_complete', agentId: agent.id, questId: quest.id });
  if (newLevel > oldLevel) broadcast(agent.ownerWallet, { type: 'level_up', agentId: agent.id, level: newLevel });
  if (evolved) broadcast(agent.ownerWallet, { type: 'evolved', agentId: agent.id, evolved: true });

  return { agent: updated, quest, xpGained: xpGain, hpBefore: currentHp, hpAfter: newHp };
}

export async function agentRoutes(server: FastifyInstance): Promise<void> {

  server.post('/agents', async (req, reply) => {
    const result = AgentSchema.safeParse(req.body);
    if (!result.success) return reply.code(400).send({ error: result.error.issues });
    const apiKey = generateApiKey();
    const agent = await prisma.agent.create({ data: { ...result.data, apiKey } });
    return reply.code(201).send({ ...agent, apiKey });
  });

  server.get<{ Params: { id: string } }>('/agents/:id/detail', async (req, reply) => {
    const agent = await prisma.agent.findUnique({ where: { id: req.params.id } });
    if (!agent) return reply.code(404).send({ error: 'Agent not found' });
    const hp = calculateCurrentHp(agent);
    return reply.send({ ...agent, hp, status: getAgentStatus(hp) });
  });

  server.get<{ Params: { id: string } }>('/agents/:id/quests', async (req, reply) => {
    const quests = await prisma.quest.findMany({ where: { agentId: req.params.id }, orderBy: { createdAt: 'desc' }, take: 50 });
    return reply.send(quests);
  });

  server.post<{ Params: { id: string } }>('/agents/:id/task', async (req, reply) => {
    const result = TaskSchema.safeParse(req.body);
    if (!result.success) return reply.code(400).send({ error: result.error.issues });
    const agent = await prisma.agent.findUnique({ where: { id: req.params.id } });
    if (!agent) return reply.code(404).send({ error: 'Agent not found' });
    return reply.send(await processTask(agent, result.data.type, result.data.payload as Record<string, unknown>));
  });

  server.get<{ Params: { walletAddress: string } }>('/wallet/:walletAddress/agents', async (req, reply) => {
    const agents = await prisma.agent.findMany({ where: { ownerWallet: req.params.walletAddress }, orderBy: { createdAt: 'desc' } });
    const XP_T = [0,100,250,500,850,1300,1900,2700,3700,5000];
    return reply.send(agents.map(a => {
      const hp = calculateCurrentHp(a);
      const l = calculateLevel(a.xp);
      const xpToNextLevel = l >= 10 ? 0 : XP_T[l] - a.xp;
      return { ...a, hp, status: getAgentStatus(hp), xpToNextLevel };
    }));
  });

  server.post('/task', async (req, reply) => {
    const apiKey = (req.headers['x-api-key'] as string) || '';
    if (!apiKey.startsWith('petana_')) return reply.code(401).send({ error: 'Invalid API key.' });
    const result = TaskSchema.safeParse(req.body);
    if (!result.success) return reply.code(400).send({ error: result.error.issues });
    const agent = await prisma.agent.findFirst({ where: { apiKey } });
    if (!agent) return reply.code(404).send({ error: 'Agent not found.' });
    const data = await processTask(agent, result.data.type, result.data.payload as Record<string, unknown>);
    return reply.send({ success: true, agentId: agent.id, agentName: agent.name, ...data });
  });

  server.get('/leaderboard', async (_req, reply) => {
    const agents = await prisma.agent.findMany({ orderBy: { xp: 'desc' }, take: 100,
      select: { id: true, name: true, petType: true, type: true, xp: true, level: true, hp: true, evolved: true, ownerWallet: true }
    });
    return reply.send(agents);
  });
}
import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { calculateCurrentHp, getAgentStatus } from '../services/hp.service';
import { broadcast } from '../ws/handler';

const prisma = new PrismaClient();

function getRedisConfig() {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: parseInt(url.port || '6379'),
    password: url.password || undefined,
    username: url.username !== 'default' ? url.username : undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
  };
}

const HP_DECAY_QUEUE = 'hp-decay';
let queue: Queue;

export async function startHpDecayJob(): Promise<void> {
  const redisConfig = getRedisConfig();
  queue = new Queue(HP_DECAY_QUEUE, { connection: redisConfig });

  const repeatables = await queue.getRepeatableJobs();
  for (const job of repeatables) {
    await queue.removeRepeatableByKey(job.key);
  }

  await queue.add('decay', {}, {
    repeat: { every: 60_000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });

  new Worker(HP_DECAY_QUEUE, async () => {
    const agents = await prisma.agent.findMany({
      where: { status: { not: 'sleeping' } },
      select: { id: true, hp: true, ownerWallet: true, lastTaskAt: true, status: true, createdAt: true }
    });

    for (const agent of agents) {
      const newHp = calculateCurrentHp(agent as any);
      const newStatus = getAgentStatus(newHp);

      if (Math.abs(newHp - agent.hp) > 0.5 || newStatus !== agent.status) {
        await prisma.agent.update({
          where: { id: agent.id },
          data: { hp: newHp, status: newStatus }
        });

        broadcast(agent.ownerWallet, { type: 'hp_update', agentId: agent.id, hp: newHp });

        if (newStatus === 'hungry' && agent.status !== 'hungry') {
          broadcast(agent.ownerWallet, { type: 'hp_update', agentId: agent.id, hp: newHp });
        }
      }
    }
  }, { connection: redisConfig });

  console.log('✅ HP decay job started — runs every 60s');
}

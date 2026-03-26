import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { calculateCurrentHp, getAgentStatus } from '../services/hp.service';
import { broadcast } from '../ws/handler';

const prisma = new PrismaClient();
const redisConfig = { host: '127.0.0.1', port: 6379 };

const HP_DECAY_QUEUE = 'hp-decay';

let queue: Queue;

export async function startHpDecayJob(): Promise<void> {
  queue = new Queue(HP_DECAY_QUEUE, { connection: redisConfig });

  // Remove any existing repeatable jobs, then add fresh one
  const repeatables = await queue.getRepeatableJobs();
  for (const job of repeatables) {
    await queue.removeRepeatableByKey(job.key);
  }

  // Run every 60 seconds
  await queue.add('decay', {}, {
    repeat: { every: 60_000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });

  new Worker(HP_DECAY_QUEUE, async () => {
    const agents = await prisma.agent.findMany({
      where: { status: { not: 'sleeping' } },
      select: { id: true, hp: true, ownerWallet: true, lastTaskAt: true, status: true }
    });

    for (const agent of agents) {
      const newHp     = calculateCurrentHp(agent as any);
      const newStatus = getAgentStatus(newHp);

      // Only update if there's a meaningful change (> 0.5 HP)
      if (Math.abs(newHp - agent.hp) > 0.5 || newStatus !== agent.status) {
        await prisma.agent.update({
          where: { id: agent.id },
          data: { hp: newHp, status: newStatus }
        });

        broadcast(agent.ownerWallet, {
          type: 'hp_update',
          agentId: agent.id,
          hp: newHp,
        });

        // Warn if pet is hungry
        if (newStatus === 'hungry' && agent.status !== 'hungry') {
          broadcast(agent.ownerWallet, {
            type: 'hp_update',
            agentId: agent.id,
            hp: newHp,
          });
        }
      }
    }
  }, { connection: redisConfig });

  console.log('✅ HP decay job started — runs every 60s');
}

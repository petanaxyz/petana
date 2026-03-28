import type { Agent } from '@prisma/client';
import type { TaskType } from '../types';

export const HP_CONFIG = {
  MAX_HP: 100,
  MIN_HP: 0,
  DECAY_RATE_PER_HOUR: 2,
  MAX_DECAY: 50,
  TASK_BOOST: {
    trade:  5,
    commit: 4,
    post:   3,
    swap:   4,
    battle: 8,
  } as Record<TaskType, number>,
  STATUS_THRESHOLDS: {
    working:  80,
    idle:     50,
    hungry:   20,
    sleeping:  0,
  }
};

export const XP_CONFIG = {
  PER_TASK: {
    trade:  10,
    commit:  8,
    post:    5,
    swap:   10,
    battle: 25,
  } as Record<TaskType, number>,
  LEVEL_THRESHOLDS: [0, 100, 250, 500, 850, 1300, 1900, 2700, 3700, 5000],
  MAX_LEVEL: 10
};

export function calculateHpDecay(lastTaskAt: Date | null, createdAt: Date): number {
  const referenceTime = lastTaskAt ?? createdAt;
  const hoursIdle = (Date.now() - referenceTime.getTime()) / 3_600_000;
  return Math.min(hoursIdle * HP_CONFIG.DECAY_RATE_PER_HOUR, HP_CONFIG.MAX_DECAY);
}

export function calculateCurrentHp(agent: Agent): number {
  const decay = calculateHpDecay(agent.lastTaskAt, agent.createdAt);
  return Math.max(HP_CONFIG.MIN_HP, agent.hp - decay);
}

export function applyTaskBoost(currentHp: number, taskType: TaskType): number {
  const boost = HP_CONFIG.TASK_BOOST[taskType] ?? 2;
  return Math.min(HP_CONFIG.MAX_HP, currentHp + boost);
}

export function getAgentStatus(hp: number): string {
  const { working, idle, hungry } = HP_CONFIG.STATUS_THRESHOLDS;
  if (hp >= working) return 'working';
  if (hp >= idle)    return 'idle';
  if (hp >= hungry)  return 'hungry';
  return 'sleeping';
}

export function calculateLevel(xp: number): number {
  const thresholds = XP_CONFIG.LEVEL_THRESHOLDS;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return Math.min(i + 1, XP_CONFIG.MAX_LEVEL);
  }
  return 1;
}

export function xpToNextLevel(xp: number): number {
  const level = calculateLevel(xp);
  if (level >= XP_CONFIG.MAX_LEVEL) return 0;
  return XP_CONFIG.LEVEL_THRESHOLDS[level] - xp;
}

export function hasEvolved(prevLevel: number, newLevel: number): boolean {
  return prevLevel < XP_CONFIG.MAX_LEVEL && newLevel >= XP_CONFIG.MAX_LEVEL;
}

export function getXpForTask(taskType: TaskType): number {
  return XP_CONFIG.PER_TASK[taskType] ?? 5;
}

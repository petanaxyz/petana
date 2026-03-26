import type { Agent } from '@prisma/client';
import type { TaskType } from '../types';

export const HP_CONFIG = {
  MAX_HP: 100,
  MIN_HP: 0,
  DECAY_RATE_PER_HOUR: 2,   // HP lost per hour when idle
  MAX_DECAY: 50,             // Max HP loss from idling (never goes below 50 via decay alone)

  TASK_BOOST: {
    trade:  5,
    commit: 4,
    post:   3,
    swap:   4,
    battle: 8,
  } as Record<TaskType, number>,

  STATUS_THRESHOLDS: {
    working:  80,  // HP >= 80 = working
    idle:     50,  // HP 50-79 = idle
    hungry:   20,  // HP 20-49 = hungry
    sleeping:  0,  // HP < 20  = sleeping
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

  LEVEL_THRESHOLDS: [
    0,    // Level 1
    100,  // Level 2
    250,  // Level 3
    500,  // Level 4
    850,  // Level 5
    1300, // Level 6
    1900, // Level 7
    2700, // Level 8
    3700, // Level 9
    5000, // Level 10 → EVOLUTION
  ],

  MAX_LEVEL: 10
};

// ── HP functions ──────────────────────────────────────────

export function calculateHpDecay(lastTaskAt: Date | null): number {
  if (!lastTaskAt) return 50; // no task ever = start at 50 HP
  const hoursIdle = (Date.now() - lastTaskAt.getTime()) / 3_600_000;
  return Math.min(hoursIdle * HP_CONFIG.DECAY_RATE_PER_HOUR, HP_CONFIG.MAX_DECAY);
}

export function calculateCurrentHp(agent: Agent): number {
  const decay = calculateHpDecay(agent.lastTaskAt);
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

// ── XP functions ──────────────────────────────────────────

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

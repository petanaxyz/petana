import { motion } from 'framer-motion';
import { HpBar } from './HpBar';
import { StatusBadge } from './StatusBadge';
import type { Agent, PetType } from '../types';

const PET_EMOJI: Record<PetType, string> = {
  dog:     '🐶',
  cat:     '🐱',
  bird:    '🐦',
  fish:    '🐟',
  hamster: '🐹',
};

const CARD_BG: Record<string, string> = {
  working:  'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white',
  idle:     'border-purple-100 bg-white',
  hungry:   'border-orange-200 bg-gradient-to-br from-orange-50 to-white',
  sleeping: 'border-red-200 bg-gradient-to-br from-red-50 to-white',
};

interface PetCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function PetCard({ agent, onClick }: PetCardProps) {
  const cardStyle = CARD_BG[agent.status] || CARD_BG.idle;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(153,69,255,0.15)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-colors ${cardStyle}`}
    >
      {/* Status badge */}
      <div className="absolute top-3 right-3">
        <StatusBadge status={agent.status} />
      </div>

      {/* Evolved crown */}
      {agent.evolved && (
        <div className="absolute top-3 left-3 text-sm">👑</div>
      )}

      {/* Pet emoji */}
      <motion.span
        className="text-4xl block mb-2"
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {PET_EMOJI[agent.petType]}
      </motion.span>

      {/* Name + role */}
      <p className="font-bold text-base text-slate-900 leading-tight">{agent.name}</p>
      <p className="text-[11px] text-slate-400 font-medium mb-3">
        {agent.type} · Lvl {agent.level}
      </p>

      {/* HP bar */}
      <HpBar current={agent.hp} max={agent.maxHp} showLabel />

      {/* XP bar */}
      <div className="mt-2">
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-400"
            animate={{ width: agent.xpToNextLevel ? `${100 - (agent.xpToNextLevel / 100) * 100}%` : '100%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
          XP {agent.xp.toLocaleString()}
          {agent.xpToNextLevel ? ` · ${agent.xpToNextLevel} to next level` : ' · MAX LEVEL'}
        </p>
      </div>
    </motion.div>
  );
}

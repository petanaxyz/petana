import { motion } from 'framer-motion';

interface HpBarProps {
  current: number;
  max?: number;
  showLabel?: boolean;
  height?: number;
}

function getHpColor(pct: number): string {
  if (pct >= 80) return 'from-emerald-400 to-teal-400';
  if (pct >= 50) return 'from-violet-500 to-purple-400';
  if (pct >= 20) return 'from-orange-400 to-amber-400';
  return 'from-red-500 to-rose-400';
}

export function HpBar({ current, max = 100, showLabel = false, height = 5 }: HpBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const colorClass = getHpColor(pct);

  return (
    <div className="w-full">
      <div
        className="w-full bg-gray-100 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-400 mt-1 font-medium">
          HP {Math.round(current)}/{max}
        </p>
      )}
    </div>
  );
}

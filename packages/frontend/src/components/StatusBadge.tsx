import type { AgentStatus } from '../types';

const STATUS_CONFIG: Record<AgentStatus, { label: string; className: string }> = {
  working:  { label: 'Working',  className: 'bg-emerald-100 text-emerald-700' },
  idle:     { label: 'Idle',     className: 'bg-gray-100 text-gray-500' },
  hungry:   { label: 'Hungry!',  className: 'bg-orange-100 text-orange-600' },
  sleeping: { label: 'Sleeping', className: 'bg-red-100 text-red-500' },
};

export function StatusBadge({ status }: { status: AgentStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  return (
    <span className={`text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-full uppercase ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

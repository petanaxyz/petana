import { useQuery } from '@tanstack/react-query';
import type { Quest } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const QUEST_ICON: Record<string, string> = {
  trade:  '🔄',
  commit: '💻',
  post:   '🐦',
  swap:   '💧',
  battle: '⚔️',
};

const QUEST_COLOR: Record<string, string> = {
  trade:  'text-emerald-600',
  commit: 'text-violet-600',
  post:   'text-blue-500',
  swap:   'text-pink-500',
  battle: 'text-orange-500',
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60)  return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface ActivityFeedProps {
  agentId: string;
  agentName: string;
}

export function ActivityFeed({ agentId, agentName }: ActivityFeedProps) {
  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: ['quests', agentId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/agents/${agentId}/quests?limit=20`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 15_000,
  });

  return (
    <div className="bg-white border-2 border-purple-100 rounded-2xl p-4 flex-1 overflow-hidden">
      <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-3">
        🔴 Live Activity
      </p>

      {quests.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">No activity yet — submit a task!</p>
      ) : (
        <div className="space-y-0 divide-y divide-slate-50">
          {quests.map((q) => (
            <div key={q.id} className="flex items-start gap-3 py-2">
              <span className="text-lg flex-shrink-0">{QUEST_ICON[q.type] || '📌'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${QUEST_COLOR[q.type]}`}>{agentName}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {q.type} · +{q.xpGained} XP
                  {q.txHash && (
                    <a
                      href={`https://solscan.io/tx/${q.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1 text-violet-400 hover:text-violet-600"
                    >
                      ↗ on-chain
                    </a>
                  )}
                </p>
              </div>
              <span className="text-[10px] text-slate-300 whitespace-nowrap font-mono">
                {timeAgo(q.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

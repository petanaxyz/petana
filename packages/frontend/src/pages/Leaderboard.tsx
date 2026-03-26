import { useQuery } from '@tanstack/react-query';
import type { Agent, PetType } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PET_EMOJI: Record<PetType, string> = {
  dog: '🐶', cat: '🐱', bird: '🐦', fish: '🐟', hamster: '🐹',
};

const RANK_BADGE = ['🥇', '🥈', '🥉'];

export function Leaderboard() {
  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/leaderboard`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="pt-20 px-6 pb-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">🏆 Leaderboard</h1>
        <p className="text-sm text-slate-400">Top agents by XP · Updates every 30s</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading leaderboard...</div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              className="flex items-center gap-4 bg-white border-2 border-purple-100 rounded-2xl px-5 py-4"
            >
              <span className="text-xl w-8 text-center flex-shrink-0">
                {RANK_BADGE[i] || `#${i + 1}`}
              </span>
              <span className="text-3xl">{PET_EMOJI[agent.petType as PetType]}</span>
              <div className="flex-1">
                <p className="font-bold text-slate-900">
                  {agent.name}
                  {agent.evolved && <span className="ml-1">👑</span>}
                </p>
                <p className="text-xs text-slate-400">{agent.type} · Level {agent.level}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-violet-600">{agent.xp.toLocaleString()} XP</p>
                <p className="text-xs text-slate-400">HP {Math.round(agent.hp)}/100</p>
              </div>
            </div>
          ))}
          {agents.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-2">🌱</div>
              <p>No agents yet. Be the first to adopt!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DEMO_LEADERS = [
  { rank: 1, name: 'Rex', petType: 'dog', type: 'trading', xp: 5420, level: 10, hp: 92, evolved: true, owner: '7xK...3mP' },
  { rank: 2, name: 'Whisker', petType: 'cat', type: 'dev', xp: 4890, level: 10, hp: 88, evolved: true, owner: '9aB...2nQ' },
  { rank: 3, name: 'Scout', petType: 'hamster', type: 'onchain', xp: 3720, level: 9, hp: 95, evolved: false, owner: '3cD...8rS' },
  { rank: 4, name: 'Pip', petType: 'bird', type: 'social', xp: 2940, level: 8, hp: 76, evolved: false, owner: '5eF...4tU' },
  { rank: 5, name: 'Coral', petType: 'fish', type: 'defi', xp: 2310, level: 7, hp: 45, evolved: false, owner: '1gH...6vW' },
  { rank: 6, name: 'Blaze', petType: 'dog', type: 'trading', xp: 1980, level: 6, hp: 83, evolved: false, owner: '8iJ...9xY' },
  { rank: 7, name: 'Luna', petType: 'cat', type: 'dev', xp: 1650, level: 6, hp: 91, evolved: false, owner: '2kL...1zA' },
  { rank: 8, name: 'Finny', petType: 'fish', type: 'defi', xp: 1320, level: 5, hp: 67, evolved: false, owner: '6mN...3bB' },
  { rank: 9, name: 'Chip', petType: 'hamster', type: 'onchain', xp: 990, level: 4, hp: 54, evolved: false, owner: '4oP...5cC' },
  { rank: 10, name: 'Tweety', petType: 'bird', type: 'social', xp: 660, level: 3, hp: 38, evolved: false, owner: '0qR...7dD' },
];

const PET_EMOJI: Record<string, string> = { dog: '🐶', cat: '🐱', bird: '🐦', fish: '🐟', hamster: '🐹' };
const RANK_BADGE = ['🥇', '🥈', '🥉'];

export function Leaderboard() {
  const [leaders, setLeaders] = useState(DEMO_LEADERS);

  useEffect(() => {
    const interval = setInterval(() => {
      setLeaders(prev => prev.map(a => ({
        ...a,
        xp: a.xp + Math.floor(Math.random() * 15),
        hp: Math.max(10, Math.min(100, a.hp + (Math.random() - 0.4) * 5)),
      })).sort((a, b) => b.xp - a.xp).map((a, i) => ({ ...a, rank: i + 1 })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-28 px-4 pb-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">🏆 Leaderboard</h1>
        <p className="text-sm text-slate-400">Top agents by XP · Updates every 3s</p>
      </div>

      <div className="space-y-3">
        {leaders.map((agent, i) => (
          <motion.div key={agent.name} layout
            className={`flex items-center gap-4 bg-white border-2 rounded-2xl px-5 py-4 transition-all
              ${agent.rank === 1 ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-white' :
                agent.rank === 2 ? 'border-slate-200 bg-gradient-to-r from-slate-50 to-white' :
                agent.rank === 3 ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-white' :
                'border-purple-100'}`}>
            <span className="text-xl w-8 text-center flex-shrink-0">
              {RANK_BADGE[i] || `#${agent.rank}`}
            </span>
            <span className="text-3xl">{PET_EMOJI[agent.petType]}</span>
            <div className="flex-1">
              <p className="font-bold text-slate-900">
                {agent.name}
                {agent.evolved && <span className="ml-1">👑</span>}
                <span className="ml-2 text-xs text-slate-400 font-normal">{agent.owner}</span>
              </p>
              <p className="text-xs text-slate-400">{agent.type} · Level {agent.level}</p>
              <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-pink-400"
                  animate={{ width: `${Math.min(100, (agent.xp / 6000) * 100)}%` }}
                  transition={{ duration: 0.8 }} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-extrabold text-violet-600">{agent.xp.toLocaleString()} XP</p>
              <p className="text-xs text-slate-400">HP {Math.round(agent.hp)}/100</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

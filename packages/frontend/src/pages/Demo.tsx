import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '../types';

const INITIAL_AGENTS: Agent[] = [
  { id: '1', name: 'Rex', type: 'trading', petType: 'dog', description: 'SOL/USDC arbitrage bot', ownerWallet: 'demo', hp: 82, maxHp: 100, xp: 1240, level: 12, status: 'working', evolved: false, lastTaskAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '2', name: 'Whisker', type: 'dev', petType: 'cat', description: 'GitHub automation agent', ownerWallet: 'demo', hp: 95, maxHp: 100, xp: 890, level: 9, status: 'working', evolved: false, lastTaskAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '3', name: 'Pip', type: 'social', petType: 'bird', description: 'Twitter engagement bot', ownerWallet: 'demo', hp: 60, maxHp: 100, xp: 540, level: 7, status: 'idle', evolved: false, lastTaskAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '4', name: 'Coral', type: 'defi', petType: 'fish', description: 'DeFi yield optimizer', ownerWallet: 'demo', hp: 28, maxHp: 100, xp: 320, level: 5, status: 'hungry', evolved: false, lastTaskAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '5', name: 'Scout', type: 'onchain', petType: 'hamster', description: 'On-chain protocol monitor', ownerWallet: 'demo', hp: 74, maxHp: 100, xp: 1100, level: 11, status: 'working', evolved: false, lastTaskAt: new Date().toISOString(), createdAt: new Date().toISOString() },
];

const PET_EMOJI: Record<string, string> = { dog: '🐶', cat: '🐱', bird: '🐦', fish: '🐟', hamster: '🐹' };

const LIVE_EVENTS = [
  { ico: '🐶', who: 'Rex', color: 'text-emerald-600', what: 'SOL/USDC swap · +$24.5' },
  { ico: '🐱', who: 'Whisker', color: 'text-violet-600', what: 'PR #142 merged · auth refactor' },
  { ico: '⚔️', who: 'Battle!', color: 'text-pink-500', what: 'Rex vs Coral · Rex wins +50 XP' },
  { ico: '🐦', who: 'Pip', color: 'text-blue-500', what: '3 threads posted · 480 likes' },
  { ico: '🐹', who: 'Scout', color: 'text-amber-500', what: 'On-chain tx logged · +10 XP' },
  { ico: '🐶', who: 'Rex', color: 'text-emerald-600', what: 'Level up! Now Level 13 🎉' },
  { ico: '🐟', who: 'Coral', color: 'text-pink-400', what: 'DeFi swap · $8.2k volume' },
  { ico: '🐱', who: 'Whisker', color: 'text-violet-600', what: 'Bug fixed · +4 HP restored' },
];

function getStatus(hp: number) {
  if (hp >= 80) return 'working';
  if (hp >= 50) return 'idle';
  if (hp >= 20) return 'hungry';
  return 'sleeping';
}

function getHpColor(hp: number) {
  if (hp >= 80) return 'from-emerald-400 to-teal-400';
  if (hp >= 50) return 'from-violet-500 to-purple-400';
  if (hp >= 20) return 'from-orange-400 to-amber-400';
  return 'from-red-500 to-rose-400';
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    working: 'bg-emerald-100 text-emerald-700',
    idle: 'bg-gray-100 text-gray-500',
    hungry: 'bg-orange-100 text-orange-600',
    sleeping: 'bg-red-100 text-red-500',
  };
  return (
    <span className={`text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-full uppercase ${cfg[status] || cfg.idle}`}>
      {status}
    </span>
  );
}

export function Demo() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [events, setEvents] = useState(LIVE_EVENTS.slice(0, 5));
  const [notifications, setNotifications] = useState<{ id: number; text: string; color: string }[]>([]);
  const [battleResult, setBattleResult] = useState<string | null>(null);
  const [isBattling, setIsBattling] = useState(false);
  const [notifId, setNotifId] = useState(0);

  const addNotif = (text: string, color = 'bg-violet-600') => {
    const id = notifId + 1;
    setNotifId(id);
    setNotifications(prev => [...prev, { id, text, color }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  // Auto simulate HP changes + events
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        const change = (Math.random() - 0.3) * 6;
        const newHp = Math.max(5, Math.min(100, agent.hp + change));
        const newXp = agent.xp + Math.floor(Math.random() * 8);
        const newLevel = Math.min(10, Math.floor(newXp / 100) + 1);
        if (newLevel > agent.level) addNotif(`🎉 ${agent.name} leveled up! Level ${newLevel}`, 'bg-amber-500');
        if (agent.status !== 'hungry' && newHp < 20) addNotif(`⚠️ ${agent.name} is hungry! Feed them a task`, 'bg-orange-500');
        return { ...agent, hp: newHp, xp: newXp, level: newLevel, status: getStatus(newHp) };
      }));

      // Rotate live events
      setEvents(prev => {
        const next = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
        return [{ ...next }, ...prev.slice(0, 4)];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [notifId]);

  // Battle demo
  const doBattle = () => {
    if (isBattling) return;
    setIsBattling(true);
    setBattleResult(null);
    setTimeout(() => {
      const winner = Math.random() > 0.4 ? 'Rex' : 'Coral';
      const result = winner === 'Rex'
        ? '🐶 Rex WINS! +50 XP · +8 HP · Coral loses 15 HP'
        : '🐟 Coral WINS! Upset victory! +50 XP · Rex loses 20 HP';
      setBattleResult(result);
      setIsBattling(false);
      addNotif(`⚔️ Battle over! ${winner} wins!`, 'bg-pink-500');
      setAgents(prev => prev.map(a => {
        if (a.name === 'Rex') return { ...a, hp: Math.max(5, a.hp + (winner === 'Rex' ? 8 : -20)), xp: a.xp + (winner === 'Rex' ? 50 : 0) };
        if (a.name === 'Coral') return { ...a, hp: Math.max(5, a.hp + (winner === 'Coral' ? 8 : -15)), xp: a.xp + (winner === 'Coral' ? 50 : 0) };
        return a;
      }));
    }, 2000);
  };

  return (
    <div className="pt-20 px-4 pb-10 max-w-6xl mx-auto">

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div key={n.id}
              initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
              className={`${n.color} text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg`}>
              {n.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Demo banner */}
      <div className="mb-6 bg-violet-50 border-2 border-violet-200 rounded-2xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎮</span>
          <span className="font-bold text-violet-700 text-sm">Demo Mode — live simulation</span>
          <span className="text-xs text-violet-400 font-medium">Updates every 2.5s</span>
        </div>
        <a href="/app" className="text-sm font-bold text-violet-600 hover:text-violet-800">Connect Wallet →</a>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Pets</h1>
          <p className="text-sm text-slate-400">{agents.length} agents · Live on Solana</p>
        </div>
        <button onClick={doBattle}
          className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-full text-white transition-all ${isBattling ? 'bg-pink-300 cursor-wait' : 'bg-pink-500 hover:bg-pink-600'}`}>
          {isBattling ? '⚔️ Fighting...' : '⚔️ Battle Rex vs Coral'}
        </button>
      </div>

      {/* Battle result */}
      <AnimatePresence>
        {battleResult && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 bg-pink-50 border-2 border-pink-200 rounded-2xl px-5 py-3 text-pink-700 font-bold text-sm">
            {battleResult}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {agents.map(agent => (
          <motion.div key={agent.id} layout
            className={`relative border-2 rounded-2xl p-4 bg-white cursor-pointer
              ${agent.status === 'working' ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white' :
                agent.status === 'hungry' ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white' :
                agent.status === 'sleeping' ? 'border-red-200 bg-gradient-to-br from-red-50 to-white' :
                'border-purple-100'}`}
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(153,69,255,0.15)' }}>
            <div className="absolute top-3 right-3"><StatusBadge status={agent.status} /></div>
            <motion.span className="text-4xl block mb-2"
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              {PET_EMOJI[agent.petType]}
            </motion.span>
            <p className="font-bold text-base text-slate-900">{agent.name}</p>
            <p className="text-[11px] text-slate-400 font-medium mb-3">{agent.type} · Lvl {agent.level}</p>
            {/* HP bar */}
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
              <motion.div className={`h-full rounded-full bg-gradient-to-r ${getHpColor(agent.hp)}`}
                animate={{ width: `${agent.hp}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }} />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mb-2">HP {Math.round(agent.hp)}/100</p>
            {/* XP bar */}
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-pink-400"
                animate={{ width: `${(agent.xp % 100)}%` }}
                transition={{ duration: 0.8 }} />
            </div>
            <p className="text-[10px] text-slate-300 font-mono mt-1">{agent.xp.toLocaleString()} XP</p>
          </motion.div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="bg-white border-2 border-purple-100 rounded-2xl p-5">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">⛓️ On-Chain Stats</p>
          <div className="space-y-4">
            <div><p className="text-xs text-slate-400 font-bold mb-1">TOTAL PnL</p>
              <p className="text-2xl font-extrabold text-emerald-500">+$1,247</p></div>
            <div><p className="text-xs text-slate-400 font-bold mb-1">$FEED STAKED</p>
              <p className="text-2xl font-extrabold text-violet-600">42,000</p></div>
            <div><p className="text-xs text-slate-400 font-bold mb-1">TOTAL XP</p>
              <p className="text-2xl font-extrabold text-amber-500">{agents.reduce((s, a) => s + a.xp, 0).toLocaleString()}</p></div>
            <div><p className="text-xs text-slate-400 font-bold mb-1">BATTLES WON</p>
              <p className="text-2xl font-extrabold text-pink-500">31/38</p></div>
          </div>
        </div>

        {/* Live feed */}
        <div className="md:col-span-2 bg-white border-2 border-purple-100 rounded-2xl p-5">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">🔴 Live Activity</p>
          <AnimatePresence mode="popLayout">
            {events.map((item, i) => (
              <motion.div key={`${item.who}-${item.what}-${i}`}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className="text-lg flex-shrink-0">{item.ico}</span>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-bold ${item.color}`}>{item.who}</span>
                  <p className="text-xs text-slate-400 truncate">{item.what}</p>
                </div>
                <span className="text-xs text-slate-300 font-mono whitespace-nowrap">just now</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL  = import.meta.env.VITE_WS_URL  || 'ws://localhost:3001';

const PET_EMOJI: Record<string, string> = { dog:'🐶', cat:'🐱', bird:'🐦', fish:'🐟', hamster:'🐹', lion:'🦁', tiger:'🐯', wolf:'🐺', fox:'🦊', bear:'🐻', eagle:'🦅', dragon:'🐉', shark:'🦈', leopard:'🐆', phoenix:'🦋' };
const ROOM_CONFIG: Record<string, { label: string; bg: string; border: string; textColor: string }> = {
  trading:  { label: 'Trading Room',  bg: '#F0FDF4', border: '#BBF7D0', textColor: '#065F46' },
  dev:      { label: 'Dev Room',      bg: '#F5F3FF', border: '#DDD6FE', textColor: '#4C1D95' },
  social:   { label: 'Social Room',   bg: '#EFF6FF', border: '#BFDBFE', textColor: '#1E40AF' },
  defi:     { label: 'DeFi Room',     bg: '#FFF0F6', border: '#FBCFE8', textColor: '#831843' },
  onchain:  { label: 'On-Chain Room', bg: '#FFFBEB', border: '#FDE68A', textColor: '#78350F' },
};
const TASK_ICON: Record<string, string> = { trade:'🔄', commit:'💻', post:'🐦', swap:'💧', battle:'⚔️' };
const DEBATE_TOPICS: Record<string, string[]> = {
  trading: ['SOL vs ETH for trading?', 'DCA vs lump sum?', 'Technical analysis — useful or astrology?'],
  dev:     ['Tabs vs spaces?', 'Comments in code — helpful or clutter?', 'TypeScript or pure JS?'],
  social:  ['Twitter vs Farcaster?', 'Long-form or short-form content?', 'Threads or single posts?'],
  defi:    ['Yield farming vs staking?', 'CEX vs DEX?', 'ETH or SOL for DeFi?'],
  onchain: ['L1 vs L2?', 'ZK or Optimistic rollups?', 'On-chain governance — does it work?'],
};

function getHpColor(hp: number) {
  if (hp >= 80) return '#10B981';
  if (hp >= 50) return '#8B5CF6';
  if (hp >= 20) return '#F59E0B';
  return '#EF4444';
}

function getStatusConfig(status: string) {
  const map: Record<string, any> = {
    working:  { dot: '#10B981', pulse: true },
    idle:     { dot: '#9CA3AF', pulse: false },
    hungry:   { dot: '#F59E0B', pulse: true },
    sleeping: { dot: '#EF4444', pulse: false },
  };
  return map[status] || map.idle;
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

interface FeedEvent {
  id: number;
  petName: string;
  petEmoji: string;
  type: string;
  action: string;
  xp: number;
  time: Date;
}

interface DebateMessage {
  petName: string;
  petEmoji: string;
  content: string;
  round: number;
}

interface Debate {
  topic: string;
  pet1: any;
  pet2: any;
  messages: DebateMessage[];
  loading: boolean;
  done: boolean;
}

export function Office() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toString() || null;
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [feedId, setFeedId] = useState(0);
  const [debate, setDebate] = useState<Debate | null>(null);
  const [showDebate, setShowDebate] = useState(false);
  const [petPositions, setPetPositions] = useState<Record<string, string>>({});
  const wsRef = useRef<WebSocket | null>(null);

  const { data } = useQuery<any[]>({
    queryKey: ['office-agents', wallet],
    queryFn: async () => {
      if (!wallet) return [];
      const res = await fetch(`${API_URL}/wallet/${wallet}/agents`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!wallet,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (data) {
      setAgents(data);
      const positions: Record<string, string> = {};
      data.forEach((a: any) => { positions[a.id] = a.type; });
      setPetPositions(positions);
    }
  }, [data]);

  useEffect(() => {
    if (!wallet) return;
    const ws = new WebSocket(`${WS_URL}/ws/${wallet}`);
    wsRef.current = ws;
    ws.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data);
        if (ev.type === 'hp_update') setAgents(prev => prev.map((a: any) => a.id === ev.agentId ? { ...a, hp: ev.hp } : a));
        if (ev.type === 'xp_update') setAgents(prev => prev.map((a: any) => a.id === ev.agentId ? { ...a, xp: ev.xp } : a));
      } catch {}
    };
    return () => ws.close();
  }, [wallet]);

  const addFeedEvent = useCallback((petName: string, petEmoji: string, type: string, action: string, xp: number) => {
    setFeedId(id => {
      const newId = id + 1;
      setFeed(prev => [{ id: newId, petName, petEmoji, type, action, xp, time: new Date() }, ...prev.slice(0, 19)]);
      return newId;
    });
  }, []);

  useEffect(() => {
    if (!agents.length) return;
    const rooms = Object.keys(ROOM_CONFIG);
    const interval = setInterval(() => {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      if (randomAgent && Math.random() > 0.7) {
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
        setPetPositions(prev => ({ ...prev, [randomAgent.id]: randomRoom }));
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [agents]);

  useEffect(() => {
    if (!agents.length) return;
    const ACTIONS: Record<string, string[]> = {
      trade:  ['SOL/USDC swap', 'ETH long', 'BTC arb', 'BONK play'],
      commit: ['Bug fix merged', 'Feature deployed', 'PR reviewed', 'Tests passing'],
      post:   ['Thread posted', 'Alpha shared', 'Market update', 'Meme dropped'],
      swap:   ['USDC→SOL', 'ETH→BTC', 'Liquidity added', 'Pool rebalanced'],
      battle: ['Won vs rival', 'Defense held', 'XP grind', 'Ranked up'],
    };
    const TASK_TYPES = ['trade', 'commit', 'post', 'swap', 'battle'];
    const interval = setInterval(() => {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      if (!agent) return;
      const type = TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
      const actions = ACTIONS[type];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const xp = type === 'battle' ? 25 : type === 'trade' || type === 'swap' ? 10 : type === 'commit' ? 8 : 5;
      addFeedEvent(agent.name, PET_EMOJI[agent.petType], type, action, xp);
    }, 4000);
    return () => clearInterval(interval);
  }, [agents, addFeedEvent]);

  async function startDebate() {
    if (agents.length < 2) return;
    const shuffled = [...agents].sort(() => Math.random() - 0.5);
    const pet1 = shuffled[0];
    const pet2 = shuffled[1];
    const topics = [...(DEBATE_TOPICS[pet1.type] || []), ...(DEBATE_TOPICS[pet2.type] || [])];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    setDebate({ topic, pet1, pet2, messages: [], loading: true, done: false });
    setShowDebate(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Simulate a fun debate between two AI agent pets.\nPet 1: ${pet1.name} (${pet1.type} agent)\nPet 2: ${pet2.name} (${pet2.type} agent)\nTopic: "${topic}"\nGenerate 3 rounds. Respond ONLY with JSON:\n{"messages":[{"pet":1,"round":1,"content":"..."},{"pet":2,"round":1,"content":"..."},{"pet":1,"round":2,"content":"..."},{"pet":2,"round":2,"content":"..."},{"pet":1,"round":3,"content":"..."},{"pet":2,"round":3,"content":"..."}]}`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map((c: any) => c.text || '').join('') || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      const messages: DebateMessage[] = parsed.messages.map((m: any) => ({
        petName: m.pet === 1 ? pet1.name : pet2.name,
        petEmoji: m.pet === 1 ? PET_EMOJI[pet1.petType] : PET_EMOJI[pet2.petType],
        content: m.content,
        round: m.round,
      }));
      setDebate(prev => prev ? { ...prev, messages, loading: false, done: true } : null);
    } catch {
      setDebate(prev => prev ? {
        ...prev,
        messages: [
          { petName: pet1.name, petEmoji: PET_EMOJI[pet1.petType], content: `As a ${pet1.type} agent, my stance on "${topic}" is clear — the data speaks for itself.`, round: 1 },
          { petName: pet2.name, petEmoji: PET_EMOJI[pet2.petType], content: `Respectfully, ${pet1.name} is wrong. From a ${pet2.type} perspective, the answer is obvious.`, round: 1 },
          { petName: pet1.name, petEmoji: PET_EMOJI[pet1.petType], content: `I've run the numbers. My position stands. End of discussion.`, round: 2 },
          { petName: pet2.name, petEmoji: PET_EMOJI[pet2.petType], content: `"End of discussion" — classic move when you're losing.`, round: 2 },
        ],
        loading: false, done: true,
      } : null);
    }
  }

  const roomGroups: Record<string, any[]> = {};
  Object.keys(ROOM_CONFIG).forEach(r => { roomGroups[r] = []; });
  agents.forEach(a => {
    const room = petPositions[a.id] || a.type;
    if (!roomGroups[room]) roomGroups[room] = [];
    roomGroups[room].push(a);
  });

  if (!wallet) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <span className="text-6xl">🏢</span>
      <h2 className="text-2xl font-bold text-slate-800">Connect wallet to enter the office</h2>
      <button onClick={() => navigate('/app')} className="bg-violet-600 text-white font-bold px-6 py-2 rounded-full">Go to Dashboard</button>
    </div>
  );

  if (!agents.length) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <span className="text-6xl">🏢</span>
      <h2 className="text-2xl font-bold text-slate-800">No agents yet!</h2>
      <button onClick={() => navigate('/app/adopt')} className="bg-violet-600 text-white font-bold px-6 py-2 rounded-full">Adopt First Pet</button>
    </div>
  );

  return (
    <div className="pt-20 px-4 pb-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app')} className="text-sm text-slate-400 hover:text-violet-600 font-semibold">← Back</button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">🏢 Virtual Office</h1>
            <p className="text-sm text-slate-400">{agents.length} agents · Live workspace</p>
          </div>
        </div>
        {agents.length >= 2 && (
          <button onClick={startDebate} className="bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold px-5 py-2.5 rounded-full text-sm hover:opacity-90">
            ⚔️ Start Debate
          </button>
        )}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {Object.entries(ROOM_CONFIG).map(([roomType, config]) => {
              const roomAgents = roomGroups[roomType] || [];
              return (
                <div key={roomType} style={{ background: config.bg, borderColor: config.border }} className="border-2 rounded-2xl p-4 min-h-48">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: config.textColor }}>{config.label}</p>
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {roomAgents.map((agent: any) => {
                        const hp = Math.max(0, Math.min(100, agent.hp));
                        const statusCfg = getStatusConfig(agent.status);
                        return (
                          <motion.div key={agent.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} layout
                            className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => navigate(`/app/agent/${agent.id}`)}>
                            <div className="relative">
                              <motion.span className="text-3xl block"
                                animate={agent.status === 'working' ? { y: [0,-4,0] } : agent.status === 'idle' ? { rotate: [-3,3,-3] } : agent.status === 'hungry' ? { x: [-2,2,-2] } : { opacity: [1,0.5,1] }}
                                transition={{ duration: agent.status === 'working' ? 1.5 : agent.status === 'idle' ? 3 : 0.8, repeat: Infinity }}>
                                {PET_EMOJI[agent.petType]}
                              </motion.span>
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: statusCfg.dot }} />
                            </div>
                            <p className="text-xs font-bold text-slate-700">{agent.name}</p>
                            <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full" style={{ background: getHpColor(hp) }} animate={{ width: `${hp}%` }} transition={{ duration: 0.6 }} />
                            </div>
                            <div className="w-10 h-5 rounded bg-black/10 flex items-center justify-center mt-1">
                              <div className="w-3.5 h-2.5 rounded-sm bg-black/20" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {roomAgents.length === 0 && <p className="text-xs text-slate-300 italic">Empty</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              ['Total XP', agents.reduce((s: number, a: any) => s + a.xp, 0).toLocaleString(), '✨'],
              ['Avg HP', Math.round(agents.reduce((s: number, a: any) => s + a.hp, 0) / agents.length) + '%', '💖'],
              ['Working', agents.filter((a: any) => a.status === 'working').length, '⚡'],
              ['Sleeping', agents.filter((a: any) => a.status === 'sleeping').length, '😴'],
            ].map(([label, val, icon]) => (
              <div key={label as string} className="bg-white border-2 border-purple-100 rounded-xl p-3 text-center">
                <p className="text-lg font-extrabold text-slate-900">{icon} {val}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-64 flex-shrink-0">
          <div className="bg-white border-2 border-purple-100 rounded-2xl p-4">
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
              Live Activity
            </p>
            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {feed.slice(0, 12).map(ev => (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{ev.petEmoji} {ev.petName}</span>
                      <span className="text-xs font-bold text-violet-500">+{ev.xp} XP</span>
                    </div>
                    <p className="text-xs text-slate-400">{TASK_ICON[ev.type] || '📌'} {ev.action}</p>
                    <p className="text-[10px] text-slate-300">{timeAgo(ev.time)}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {feed.length === 0 && <p className="text-xs text-slate-300 italic py-4 text-center">Waiting for activity...</p>}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDebate && debate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowDebate(false); }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">⚔️ Agent Battle</p>
                <button onClick={() => setShowDebate(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
              </div>
              <div className="bg-slate-900 rounded-2xl p-4 mb-4 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Today's Topic</p>
                <p className="text-white font-extrabold text-lg">{debate.topic}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5 items-center">
                <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-3 text-center">
                  <p className="text-4xl mb-1">{PET_EMOJI[debate.pet1.petType]}</p>
                  <p className="font-bold text-slate-900">{debate.pet1.name}</p>
                  <p className="text-xs text-violet-500">{debate.pet1.type}</p>
                </div>
                <div className="text-center font-extrabold text-2xl text-slate-400">VS</div>
                <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-3 text-center">
                  <p className="text-4xl mb-1">{PET_EMOJI[debate.pet2.petType]}</p>
                  <p className="font-bold text-slate-900">{debate.pet2.name}</p>
                  <p className="text-xs text-pink-500">{debate.pet2.type}</p>
                </div>
              </div>
              {debate.loading ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3 animate-bounce">⚔️</div>
                  <p className="text-slate-500 font-medium">Generating debate...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {debate.messages.map((msg, i) => {
                    const isP1 = msg.petName === debate.pet1.name;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                        className={`flex gap-3 ${isP1 ? '' : 'flex-row-reverse'}`}>
                        <span className="text-2xl flex-shrink-0">{msg.petEmoji}</span>
                        <div className={`rounded-2xl px-4 py-2.5 max-w-sm ${isP1 ? 'bg-violet-50 border border-violet-100' : 'bg-pink-50 border border-pink-100'}`}>
                          <p className={`text-xs font-bold mb-1 ${isP1 ? 'text-violet-600' : 'text-pink-600'}`}>{msg.petName} · Round {msg.round}</p>
                          <p className="text-sm text-slate-700">{msg.content}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              {debate.done && (
                <div className="mt-5">
                  <p className="text-center text-sm font-bold text-slate-500 mb-3">Who won the debate?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowDebate(false)} className="bg-violet-50 border-2 border-violet-200 text-violet-700 font-bold py-3 rounded-2xl hover:bg-violet-100">
                      {PET_EMOJI[debate.pet1.petType]} {debate.pet1.name} wins
                    </button>
                    <button onClick={() => setShowDebate(false)} className="bg-pink-50 border-2 border-pink-200 text-pink-700 font-bold py-3 rounded-2xl hover:bg-pink-100">
                      {PET_EMOJI[debate.pet2.petType]} {debate.pet2.name} wins
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

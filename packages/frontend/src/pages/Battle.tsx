import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const PET_EMOJI: Record<string, string> = { dog:'🐶', cat:'🐱', bird:'🐦', fish:'🐟', hamster:'🐹', lion:'🦁', tiger:'🐯', wolf:'🐺', fox:'🦊', bear:'🐻', eagle:'🦅', dragon:'🐉', shark:'🦈', leopard:'🐆', phoenix:'🦋' };

type Agent = { id:string; name:string; petType:string; type:string; hp:number; xp:number; level:number; };
type BattleState = 'select' | 'fighting' | 'result';

export function Battle() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toString() || null;

  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ['battle-agents', wallet],
    queryFn: async () => {
      if (!wallet) return [];
      const res = await fetch(`${API_URL}/wallet/${wallet}/agents`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!wallet,
  });

  const { data: allAgents = [] } = useQuery<Agent[]>({
    queryKey: ['leaderboard-agents'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/leaderboard`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [challenger, setChallenger] = useState<Agent | null>(null);
  const [opponent, setOpponent] = useState<Agent | null>(null);
  const [state, setState] = useState<BattleState>('select');
  const [winner, setWinner] = useState<Agent | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [history, setHistory] = useState<{ c: string; o: string; winner: string }[]>([]);

  const startBattle = async () => {
    if (!challenger || !opponent || challenger.id === opponent.id) return;
    setState('fighting');
    setLog([]);

    const logs: string[] = [];
    const cPower = challenger.hp * 0.4 + challenger.level * 10 + Math.random() * 30;
    const oPower = opponent.hp * 0.4 + opponent.level * 10 + Math.random() * 30;
    const w = cPower > oPower ? challenger : opponent;

    logs.push(`⚔️ Battle starts! ${challenger.name} vs ${opponent.name}`);
    logs.push(`💥 ${challenger.name} attacks for ${Math.floor(cPower * 0.3)} damage!`);
    logs.push(`💥 ${opponent.name} counters for ${Math.floor(oPower * 0.3)} damage!`);
    logs.push(`⚡ Critical hit by ${w.name}!`);
    logs.push(`🏆 ${w.name} WINS! +25 XP · +8 HP`);

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) { setLog(prev => [...prev, logs[i]]); i++; }
      else {
        clearInterval(interval);
        setTimeout(async () => {
          try {
            await fetch(`${API_URL}/agents/${w.id}/task`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'battle', payload: { opponent: w.id === challenger.id ? opponent.name : challenger.name, result: 'win' } })
            });
          } catch {}
          setWinner(w);
          setState('result');
          setHistory(prev => [{ c: challenger.name, o: opponent.name, winner: w.name }, ...prev.slice(0, 4)]);
        }, 500);
      }
    }, 700);
  };

  const reset = () => { setState('select'); setWinner(null); setLog([]); setChallenger(null); setOpponent(null); };

  const challengerList = agents.length > 0 ? agents : allAgents.slice(0, 10);
  const opponentList = allAgents.length > 0 ? allAgents : agents;

  return (
    <div className="pt-28 px-4 pb-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">⚔️ Pet Battle Arena</h1>
        <p className="text-sm text-slate-400">Pick two agents and let them fight · Winner earns XP + $FEED</p>
      </div>

      {state === 'select' && (
        <div>
          {!wallet && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6 text-center">
              <p className="text-amber-700 font-bold text-sm">Connect wallet to use your own pets as challenger!</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-bold tracking-widest text-violet-500 uppercase mb-3">🔵 Choose Challenger {agents.length > 0 ? '(Your Pets)' : ''}</p>
              {isLoading ? <p className="text-slate-400 text-sm">Loading your pets...</p> : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {challengerList.map(a => (
                    <motion.div key={a.id} whileHover={{ x: 4 }} onClick={() => setChallenger(a)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border-2 transition-all ${challenger?.id === a.id ? 'border-violet-400 bg-violet-50' : 'border-purple-100 bg-white hover:border-violet-200'}`}>
                      <span className="text-2xl">{PET_EMOJI[a.petType] || '🐾'}</span>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-900">{a.name}</p>
                        <p className="text-xs text-slate-400">{a.type} · Lvl {a.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-500">HP {Math.round(a.hp)}</p>
                        <p className="text-xs text-violet-500">{a.xp} XP</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold tracking-widest text-pink-500 uppercase mb-3">🔴 Choose Opponent (All Pets)</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {opponentList.map(a => (
                  <motion.div key={a.id} whileHover={{ x: -4 }} onClick={() => setOpponent(a)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border-2 transition-all ${opponent?.id === a.id ? 'border-pink-400 bg-pink-50' : 'border-purple-100 bg-white hover:border-pink-200'}`}>
                    <span className="text-2xl">{PET_EMOJI[a.petType] || '🐾'}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-400">{a.type} · Lvl {a.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-500">HP {Math.round(a.hp)}</p>
                      <p className="text-xs text-violet-500">{a.xp} XP</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {challenger && opponent && challenger.id !== opponent.id && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-violet-50 via-pink-50 to-violet-50 border-2 border-violet-200 rounded-3xl p-6 flex items-center justify-between mb-6">
              <div className="text-center">
                <span className="text-5xl block mb-2">{PET_EMOJI[challenger.petType] || '🐾'}</span>
                <p className="font-extrabold text-violet-700">{challenger.name}</p>
                <p className="text-xs text-slate-400">Lvl {challenger.level} · HP {Math.round(challenger.hp)}</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-pink-500">VS</p>
              </div>
              <div className="text-center">
                <span className="text-5xl block mb-2">{PET_EMOJI[opponent.petType] || '🐾'}</span>
                <p className="font-extrabold text-pink-600">{opponent.name}</p>
                <p className="text-xs text-slate-400">Lvl {opponent.level} · HP {Math.round(opponent.hp)}</p>
              </div>
            </motion.div>
          )}

          <button onClick={startBattle} disabled={!challenger || !opponent || challenger.id === opponent.id}
            className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-extrabold text-lg py-4 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all">
            ⚔️ Start Battle!
          </button>
        </div>
      )}

      {state === 'fighting' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-slate-900 to-violet-900 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center">
              <motion.span className="text-6xl block" animate={{ x: [-5,5,-5] }} transition={{ repeat: Infinity, duration: 0.3 }}>
                {PET_EMOJI[challenger!.petType] || '🐾'}
              </motion.span>
              <p className="font-bold mt-2">{challenger!.name}</p>
            </div>
            <motion.p className="text-5xl font-black text-pink-400" animate={{ scale: [1,1.2,1] }} transition={{ repeat: Infinity, duration: 0.5 }}>⚔️</motion.p>
            <div className="text-center">
              <motion.span className="text-6xl block" animate={{ x: [5,-5,5] }} transition={{ repeat: Infinity, duration: 0.3 }}>
                {PET_EMOJI[opponent!.petType] || '🐾'}
              </motion.span>
              <p className="font-bold mt-2">{opponent!.name}</p>
            </div>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {log.map((line, i) => (
                <motion.div key={i} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                  className="bg-white/10 rounded-xl px-4 py-2 text-sm font-medium">{line}</motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {state === 'result' && winner && (
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="text-center">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-10 mb-6">
            <motion.div animate={{ scale:[1,1.1,1] }} transition={{ repeat:3, duration:0.4 }}>
              <span className="text-8xl block mb-4">{PET_EMOJI[winner.petType] || '🐾'}</span>
            </motion.div>
            <h2 className="text-3xl font-black text-amber-700 mb-2">🏆 {winner.name} WINS!</h2>
            <p className="text-slate-500 mb-4">+25 XP · +8 HP · Battle logged!</p>
            <div className="flex gap-3 justify-center">
              <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-4 py-2 rounded-full">+25 XP</span>
              <span className="bg-violet-100 text-violet-700 text-sm font-bold px-4 py-2 rounded-full">+8 HP</span>
              <span className="bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-full">+5 $FEED</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="bg-violet-600 text-white font-bold px-8 py-3 rounded-full hover:bg-violet-700">⚔️ Battle Again</button>
          </div>
        </motion.div>
      )}

      {history.length > 0 && state === 'select' && (
        <div className="mt-8">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">📜 Recent Battles</p>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-purple-100 rounded-xl px-4 py-2">
                <span className="text-sm">{h.c}</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm">{h.o}</span>
                <span className="ml-auto text-xs font-bold text-violet-600">🏆 {h.winner} won</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

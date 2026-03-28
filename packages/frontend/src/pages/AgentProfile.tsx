import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL  = import.meta.env.VITE_WS_URL  || 'ws://localhost:3001';

const PET_EMOJI: Record<string, string> = { dog:'🐶', cat:'🐱', bird:'🐦', fish:'🐟', hamster:'🐹', lion:'🦁', tiger:'🐯', wolf:'🐺', fox:'🦊', bear:'🐻', eagle:'🦅', dragon:'🐉', shark:'🦈', leopard:'🐆', phoenix:'🦋' };
const TASK_ICON: Record<string, string> = { trade:'🔄', commit:'💻', post:'🐦', swap:'💧', battle:'⚔️' };
const TASK_COLOR: Record<string, string> = { trade:'text-emerald-600', commit:'text-violet-600', post:'text-blue-500', swap:'text-pink-500', battle:'text-orange-500' };

function getHpColor(hp: number) {
  if (hp >= 80) return 'from-emerald-400 to-teal-400';
  if (hp >= 50) return 'from-violet-500 to-purple-400';
  if (hp >= 20) return 'from-orange-400 to-amber-400';
  return 'from-red-500 to-rose-400';
}

function getStatusCfg(status: string) {
  const map: Record<string, any> = {
    working:  { label:'Working',  bg:'bg-emerald-100', text:'text-emerald-700', dot:'bg-emerald-500', pulse:true },
    idle:     { label:'Idle',     bg:'bg-gray-100',    text:'text-gray-500',   dot:'bg-gray-400',   pulse:false },
    hungry:   { label:'Hungry!',  bg:'bg-orange-100',  text:'text-orange-600', dot:'bg-orange-500', pulse:true },
    sleeping: { label:'Sleeping', bg:'bg-red-100',     text:'text-red-500',    dot:'bg-red-400',    pulse:false },
  };
  return map[status] || map.idle;
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}


async function feedPet(agentId: string, setAgent: any, addNotif: any) {
  const tasks = ['trade','commit','post','swap'];
  const type = tasks[Math.floor(Math.random() * tasks.length)];
  try {
    const res = await fetch(`${API_URL}/agents/${agentId}/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload: { manual: true, source: 'dashboard' } })
    });
    const data = await res.json();
    if (res.ok) {
      setAgent((p: any) => p ? { ...p, hp: data.hpAfter, xp: data.agent.xp, level: data.agent.level, status: data.agent.status } : p);
      addNotif(`🍖 Fed! +${data.xpGained} XP · HP +${Math.round(data.hpAfter - data.hpBefore)}`);
    }
  } catch { addNotif('❌ Feed failed!'); }
}

const XP_THRESHOLDS = [0,100,250,500,850,1300,1900,2700,3700,5000];

function shareToTwitter(agent: any) {
  const emoji = { dog:'🐶', cat:'🐱', bird:'🐦', fish:'🐟', hamster:'🐹', lion:'🦁', tiger:'🐯', wolf:'🐺', fox:'🦊', bear:'🐻', eagle:'🦅', dragon:'🐉', shark:'🦈', leopard:'🐆', phoenix:'🦋' }[agent.petType] || '🐾';
  const status = agent.evolved ? '👑 EVOLVED' : agent.status === 'working' ? '⚡ Working' : '😴 Resting';
  const text = `${emoji} Meet ${agent.name}, my AI agent pet on @petanaxyz!\n\n` +
    `📊 Level ${agent.level} ${agent.type} agent\n` +
    `💖 HP: ${Math.round(agent.hp)}/100\n` +
    `✨ XP: ${agent.xp.toLocaleString()}\n` +
    `${status}\n\n` +
    `Monitor your AI agents like virtual pets 🐾\n` +
    `#PETANA #Solana #AIAgent #Web3`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://www.petana.xyz')}`;
  window.open(url, '_blank');
}



export function AgentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [notifs, setNotifs] = useState<{ id: number; text: string }[]>([]);
  const [nid, setNid] = useState(0);
  const [feeding, setFeeding] = useState(false);
  const [feedCooldown, setFeedCooldown] = useState(0);

  const { data } = useQuery<any>({
    queryKey: ['agent', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/agents/${id}/detail`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: !!id,
    refetchInterval: 30_000,
  });

  const { data: quests = [], refetch: refetchQuests } = useQuery<any[]>({
    queryKey: ['quests', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/agents/${id}/quests?limit=20`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!id,
    refetchInterval: 15_000,
  });

  useEffect(() => { if (data) setAgent(data); }, [data]);

  useEffect(() => {
    if (!agent?.ownerWallet) return;
    const ws = new WebSocket(`${WS_URL}/ws/${agent.ownerWallet}`);
    ws.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data);
        if (ev.agentId !== id) return;
        if (ev.type === 'hp_update') setAgent((p: any) => p ? { ...p, hp: ev.hp } : p);
        if (ev.type === 'xp_update') setAgent((p: any) => p ? { ...p, xp: ev.xp } : p);
        if (ev.type === 'level_up') { setAgent((p: any) => p ? { ...p, level: ev.level } : p); addNotif(`🎉 Level Up! Now Level ${ev.level}`); }
        if (ev.type === 'quest_complete') { refetchQuests(); addNotif('✅ Task completed!'); }
        if (ev.type === 'evolved') { setAgent((p: any) => p ? { ...p, evolved: true } : p); addNotif('👑 EVOLVED!'); }
      } catch {}
    };
    return () => ws.close();
  }, [agent?.ownerWallet, id]);

  const addNotif = (text: string) => {
    const newId = nid + 1; setNid(newId);
    setNotifs(p => [...p, { id: newId, text }]);
    setTimeout(() => setNotifs(p => p.filter(n => n.id !== newId)), 4000);
  };

  if (!agent) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4 animate-bounce">🐾</div><p className="text-slate-500">Loading agent...</p></div>
    </div>
  );

  const statusCfg = getStatusCfg(agent.status);
  const hpPct = Math.max(0, Math.min(100, agent.hp));
  const level = agent.level;
  const xpPct = level >= 10 ? 100 : Math.min(100, ((agent.xp - (XP_THRESHOLDS[level-1]||0)) / ((XP_THRESHOLDS[level]||5000) - (XP_THRESHOLDS[level-1]||0))) * 100);

  return (
    <div className="pt-20 px-4 pb-10 max-w-4xl mx-auto">
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {notifs.map(n => (
            <motion.div key={n.id} initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:60 }}
              className="bg-violet-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg">{n.text}</motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button onClick={() => navigate('/app')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-violet-600 font-semibold mb-6">← Back</button>

      <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 mb-6">
        <div className="flex items-start gap-6 flex-wrap">
          <motion.div className="w-24 h-24 rounded-2xl flex items-center justify-center text-6xl"
            style={{ background:'linear-gradient(135deg,#F7F4FF,#EDE9FF)' }}
            animate={{ rotate:[-3,3,-3] }} transition={{ duration:4, repeat:Infinity }}>
            {PET_EMOJI[agent.petType]}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900">{agent.name}</h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${statusCfg.bg} ${statusCfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${statusCfg.pulse ? 'animate-pulse' : ''}`} />
                {statusCfg.label}
              </span>
              {agent.evolved && <span className="text-sm font-bold text-amber-500">👑 EVOLVED</span>}
            </div>
            <p className="text-sm text-slate-400 mb-1">{agent.type} · Level {agent.level}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={async () => {
                  if (feedCooldown > 0 || feeding) return;
                  setFeeding(true);
                  await feedPet(agent.id, setAgent, addNotif);
                  setFeeding(false);
                  setFeedCooldown(30);
                  const timer = setInterval(() => {
                    setFeedCooldown(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
                  }, 1000);
                }}
                disabled={feeding || feedCooldown > 0}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 disabled:opacity-50 transition-all">
                {feeding ? '🍖 Feeding...' : feedCooldown > 0 ? `⏳ ${feedCooldown}s` : '🍖 Feed Pet'}
              </button>
              <button onClick={() => shareToTwitter(agent)}
                className="flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                Share on X
              </button>
              {agent.evolved && (
                <button onClick={() => {
                  const emoji = { dog:'🐶', cat:'🐱', bird:'🐦', fish:'🐟', hamster:'🐹', lion:'🦁', tiger:'🐯', wolf:'🐺', fox:'🦊', bear:'🐻', eagle:'🦅', dragon:'🐉', shark:'🦈', leopard:'🐆', phoenix:'🦋' }[agent.petType] || '🐾';
                  const text = `👑 ${agent.name} just EVOLVED on @petanaxyz!\n\n${emoji} Level ${agent.level} ${agent.type} agent\n✨ ${agent.xp.toLocaleString()} XP earned\n\nFrom humble beginnings to a fully evolved AI pet 🚀\n#PETANA #Solana #AIAgent`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://www.petana.xyz')}`, '_blank');
                }} className="flex items-center gap-2 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-600 transition-all">
                  👑 Share Evolution!
                </button>
              )}
            </div>
            {agent.description && <p className="text-sm text-slate-500 mb-3">{agent.description}</p>}

            <div className="mb-3">
              <div className="flex justify-between mb-1"><span className="text-xs font-bold text-slate-500 uppercase">HP</span><span className="text-xs font-bold">{Math.round(hpPct)}/100</span></div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div className={`h-full rounded-full bg-gradient-to-r ${getHpColor(hpPct)}`} animate={{ width:`${hpPct}%` }} transition={{ duration:0.8 }} />
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-1"><span className="text-xs font-bold text-slate-500 uppercase">XP</span>
                <span className="text-xs font-bold text-violet-500">{agent.xp.toLocaleString()} XP {level >= 10 ? '· MAX 👑' : `· ${XP_THRESHOLDS[level]-agent.xp} to next`}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-pink-400" animate={{ width:`${xpPct}%` }} transition={{ duration:0.8 }} />
              </div>
            </div>
            <div className="flex gap-6 flex-wrap">
              {[['Level',agent.level,'⭐'],['HP',Math.round(hpPct),'💖'],['XP',agent.xp.toLocaleString(),'✨'],['Quests',quests.length,'📜']].map(([l,v,i]) => (
                <div key={l} className="text-center"><p className="text-lg font-extrabold text-slate-900">{i} {v}</p><p className="text-xs text-slate-400">{l}</p></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-purple-100 rounded-2xl p-5">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">🔴 Live Activity</p>
          {quests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm text-slate-400">No tasks yet.</p>
              <p className="text-xs text-slate-300 mt-1">Submit tasks via API to see activity here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {quests.map((q: any) => (
                <div key={q.id} className="flex items-start gap-3 py-2.5">
                  <span className="text-lg">{TASK_ICON[q.type]||'📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${TASK_COLOR[q.type]||'text-slate-600'}`}>
                      {q.type} <span className="text-emerald-500">+{q.xpGained} XP</span>
                      {q.hpChange > 0 && <span className="text-pink-500 ml-1">+{q.hpChange.toFixed(1)} HP</span>}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {JSON.stringify(q.payload).slice(0,60)}
                      {q.txHash && <a href={`https://solscan.io/tx/${q.txHash}`} target="_blank" rel="noreferrer" className="ml-1 text-violet-400">↗ on-chain</a>}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono">{timeAgo(q.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border-2 border-purple-100 rounded-2xl p-5">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">⚡ API Integration</p>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Agent ID:</p>
              <div className="bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-2">
                <code className="text-violet-600 text-xs font-mono flex-1 break-all">{agent.id}</code>
                <button onClick={() => navigator.clipboard.writeText(agent.id)} className="text-xs text-slate-400 hover:text-violet-600">📋</button>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Submit a task:</p>
              <div className="bg-slate-900 rounded-xl p-3 overflow-x-auto">
                <code className="text-green-400 text-[11px] font-mono whitespace-pre">{`POST ${API_URL}/agents/${agent.id}/task\nContent-Type: application/json\n\n{"type":"trade","payload":{"pair":"SOL/USDC","pnl":24.5}}`}</code>
              </div>
            </div>
            <div className="bg-violet-50 rounded-xl p-3">
              <p className="text-xs font-bold text-violet-600 mb-2">Task types:</p>
              {[['trade','🔄','+5 HP · +10 XP'],['commit','💻','+4 HP · +8 XP'],['post','🐦','+3 HP · +5 XP'],['swap','💧','+4 HP · +10 XP'],['battle','⚔️','+8 HP · +25 XP']].map(([t,i,r]) => (
                <div key={t} className="flex items-center gap-2 text-xs mb-1"><span>{i}</span><code className="text-violet-700 font-bold">{t}</code><span className="text-slate-400 ml-auto">{r}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

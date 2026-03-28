import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PET_TYPES = [
  { type: 'trading', petType: 'dog',     emoji: '🐶', label: 'Dog',     desc: 'Trading Agent',  color: '#00C896' },
  { type: 'dev',     petType: 'cat',     emoji: '🐱', label: 'Cat',     desc: 'Dev Agent',      color: '#9945FF' },
  { type: 'social',  petType: 'bird',    emoji: '🐦', label: 'Bird',    desc: 'Social Agent',   color: '#19AEFF' },
  { type: 'defi',    petType: 'fish',    emoji: '🐟', label: 'Fish',    desc: 'DeFi Agent',     color: '#FF5FA0' },
  { type: 'onchain', petType: 'hamster', emoji: '🐹', label: 'Hamster', desc: 'On-Chain Agent', color: '#FF8C42' },
];

export function Adopt() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toString() || null;
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<typeof PET_TYPES[0] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adopted, setAdopted] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleAdopt = async () => {
    if (!wallet || !name.trim() || !selected) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type: selected.type, petType: selected.petType, description: description.trim() || `${selected.desc} powered by PETANA`, ownerWallet: wallet }),
      });
      if (!res.ok) throw new Error('Failed');
      const agent = await res.json();
      setAdopted(agent);
      setStep('success');
    } catch { setError('Failed to create agent. Is the backend running?'); }
    finally { setLoading(false); }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(adopted?.apiKey || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!wallet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-violet-50 to-emerald-50">
        <span className="text-7xl">🐾</span>
        <h1 className="font-extrabold text-3xl text-slate-900">Connect your wallet to adopt</h1>
        <WalletMultiButton className="!bg-violet-600 !rounded-full !text-base !font-bold !px-8" />
      </div>
    );
  }

  if (step === 'success' && adopted) {
    const pet = PET_TYPES.find(p => p.petType === adopted.petType)!;
    return (
      <div className="pt-20 px-4 pb-10 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.span className="text-8xl block mb-4" animate={{ scale: [1,1.1,1] }} transition={{ repeat: 3, duration: 0.4 }}>{pet.emoji}</motion.span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">🎉 {adopted.name} has been adopted!</h1>
          <p className="text-slate-500 mb-8">Your pet is alive! Use the API key below to connect your agent.</p>

          <div className="bg-slate-900 rounded-2xl p-6 mb-6 text-left">
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">🔑 Your API Key</p>
            <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 mb-3">
              <code className="text-green-400 font-mono text-sm flex-1 break-all">{adopted.apiKey}</code>
              <button onClick={copyApiKey} className="bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0">
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-slate-500">⚠️ Save this key — it won't be shown again.</p>
          </div>

          <div className="bg-white border-2 border-purple-100 rounded-2xl p-6 mb-6 text-left">
            <p className="text-sm font-bold text-slate-700 mb-4">🚀 Connect your agent:</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">cURL</p>
            <div className="bg-slate-900 rounded-xl p-4 mb-4 overflow-x-auto">
              <code className="text-green-400 text-xs font-mono whitespace-pre">{`curl -X POST ${API_URL}/task \\\n  -H "X-API-Key: ${adopted.apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"type":"trade","payload":{"pair":"SOL/USDC","pnl":24.5}}'`}</code>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Python</p>
            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
              <code className="text-green-400 text-xs font-mono whitespace-pre">{`import requests\nrequests.post("${API_URL}/task",\n  headers={"X-API-Key": "${adopted.apiKey}"},\n  json={"type": "trade", "payload": {"pnl": 24.5}}\n)`}</code>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/app')} className="bg-violet-600 text-white font-bold px-8 py-3 rounded-full hover:bg-violet-700">Go to Dashboard</button>
            <button onClick={() => navigate(`/app/agent/${adopted.id}`)} className="bg-white border-2 border-purple-200 text-slate-700 font-bold px-8 py-3 rounded-full hover:border-violet-400">View My Pet</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 pb-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">🐾 Adopt a Pet</h1>
        <p className="text-sm text-slate-400">Create your AI agent as a virtual pet. Get an API key to start monitoring.</p>
      </div>

      <div className="bg-white border-2 border-purple-100 rounded-2xl p-6 mb-4">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">1. Name your pet</p>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rex, Whisker, Pip..." maxLength={50}
          className="w-full border-2 border-purple-100 rounded-xl px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:border-violet-400" />
      </div>

      <div className="bg-white border-2 border-purple-100 rounded-2xl p-6 mb-4">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">2. Choose agent type</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PET_TYPES.map(pet => (
            <motion.button key={pet.petType} whileHover={{ y: -2 }} onClick={() => setSelected(pet)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${selected?.petType === pet.petType ? 'border-violet-400 bg-violet-50' : 'border-purple-100'}`}>
              <span className="text-4xl">{pet.emoji}</span>
              <span className="font-bold text-xs text-slate-700">{pet.label}</span>
              <span className="text-[10px] text-slate-400 text-center">{pet.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-purple-100 rounded-2xl p-6 mb-6">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">3. Description (optional)</p>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. SOL/USDC arbitrage bot..." maxLength={200}
          className="w-full border-2 border-purple-100 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-violet-400" />
      </div>

      <AnimatePresence>
        {name && selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-50 to-pink-50 border-2 border-violet-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <span className="text-5xl">{selected.emoji}</span>
            <div>
              <p className="font-extrabold text-lg text-slate-900">{name}</p>
              <p className="text-sm text-slate-500">{selected.desc} · Level 1 · HP 100/100</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button onClick={handleAdopt} disabled={!name.trim() || !selected || loading}
        className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-extrabold text-lg py-4 rounded-2xl disabled:opacity-30 hover:opacity-90 transition-all">
        {loading ? '🐾 Adopting...' : `🐾 Adopt ${name || 'Pet'}`}
      </button>
    </div>
  );
}

import { PetCard } from '../components/PetCard';
import { ActivityFeed } from '../components/ActivityFeed';
import type { Agent } from '../types';

const DEMO_AGENTS: Agent[] = [
  { id: '1', name: 'Rex', type: 'trading', petType: 'dog', description: 'SOL/USDC arbitrage bot', ownerWallet: 'demo', hp: 82, maxHp: 100, xp: 1240, level: 12, status: 'working', evolved: false, lastTaskAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '2', name: 'Whisker', type: 'dev', petType: 'cat', description: 'GitHub automation agent', ownerWallet: 'demo', hp: 95, maxHp: 100, xp: 890, level: 9, status: 'working', evolved: false, lastTaskAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '3', name: 'Pip', type: 'social', petType: 'bird', description: 'Twitter engagement bot', ownerWallet: 'demo', hp: 60, maxHp: 100, xp: 540, level: 7, status: 'idle', evolved: false, lastTaskAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '4', name: 'Coral', type: 'defi', petType: 'fish', description: 'DeFi yield optimizer', ownerWallet: 'demo', hp: 28, maxHp: 100, xp: 320, level: 5, status: 'hungry', evolved: false, lastTaskAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '5', name: 'Scout', type: 'onchain', petType: 'hamster', description: 'On-chain protocol monitor', ownerWallet: 'demo', hp: 74, maxHp: 100, xp: 1100, level: 11, status: 'working', evolved: false, lastTaskAt: new Date().toISOString(), createdAt: new Date().toISOString() },
];

export function Demo() {
  return (
    <div className="pt-20 px-6 pb-10 max-w-6xl mx-auto">
      <div className="mb-6 bg-violet-50 border-2 border-violet-200 rounded-2xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎮</span>
          <span className="font-bold text-violet-700 text-sm">Demo Mode — data simulasi</span>
        </div>
        <a href="/app" className="text-sm font-bold text-violet-600 hover:text-violet-800">
          Connect Wallet →
        </a>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Pets</h1>
          <p className="text-sm text-slate-400">5 agents · Live on Solana</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {DEMO_AGENTS.map(agent => (
          <PetCard key={agent.id} agent={agent} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-purple-100 rounded-2xl p-5">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">⛓️ On-Chain Stats</p>
          <div className="space-y-3">
            <div><p className="text-xs text-slate-400 font-bold">TOTAL PnL</p><p className="text-xl font-extrabold text-emerald-500">+$1,247</p></div>
            <div><p className="text-xs text-slate-400 font-bold">$FEED STAKED</p><p className="text-xl font-extrabold text-violet-600">42,000</p></div>
            <div><p className="text-xs text-slate-400 font-bold">TOTAL XP</p><p className="text-xl font-extrabold text-amber-500">4,090</p></div>
            <div><p className="text-xs text-slate-400 font-bold">BATTLES WON</p><p className="text-xl font-extrabold text-pink-500">31/38</p></div>
          </div>
        </div>
        <div className="md:col-span-2 bg-white border-2 border-purple-100 rounded-2xl p-5">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">🔴 Live Activity</p>
          <div className="space-y-3">
            {[
              { ico: '🐶', who: 'Rex', color: 'text-emerald-600', what: 'SOL/USDC swap · +$24.5', when: '2s ago' },
              { ico: '🐱', who: 'Whisker', color: 'text-violet-600', what: 'PR #142 merged · auth refactor', when: '1m ago' },
              { ico: '⚔️', who: 'Battle!', color: 'text-pink-500', what: 'Rex vs Coral · Rex wins +50 XP', when: '5m ago' },
              { ico: '🐦', who: 'Pip', color: 'text-blue-500', what: '3 threads posted · 480 likes', when: '12m ago' },
              { ico: '🐹', who: 'Scout', color: 'text-amber-500', what: 'On-chain tx logged · +10 XP', when: '18m ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-1 border-b border-slate-50 last:border-0">
                <span className="text-lg">{item.ico}</span>
                <div className="flex-1">
                  <span className={`text-xs font-bold ${item.color}`}>{item.who}</span>
                  <p className="text-xs text-slate-400">{item.what}</p>
                </div>
                <span className="text-xs text-slate-300 font-mono">{item.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

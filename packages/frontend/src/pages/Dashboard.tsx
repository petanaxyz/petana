import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAgents } from '../hooks/useAgents';
import { useRealtimeFeed } from '../hooks/useRealtimeFeed';
import { useAgentStore } from '../store/agents.store';
import { PetCard } from '../components/PetCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toString() || null;
  const navigate = useNavigate();
  const [dailyClaimed, setDailyClaimed] = React.useState(false);
  const [showBonus, setShowBonus] = React.useState(false);

  const { isLoading, error } = useAgents(wallet);
  useRealtimeFeed(wallet);

  const agents = useAgentStore((s) => s.agents);

  React.useEffect(() => {
    if (wallet) {
      const lastClaim = localStorage.getItem(`daily_${wallet}`);
      const today = new Date().toDateString();
      if (lastClaim === today) setDailyClaimed(true);
    }
  }, [wallet]);

  // Not connected
  if (!wallet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-violet-50 to-emerald-50">
        <span className="text-7xl">🐾</span>
        <h1 className="font-extrabold text-4xl text-slate-900 tracking-tight">Your pets are waiting.</h1>
        <p className="text-slate-500 text-lg">Connect your Solana wallet to adopt your first agent.</p>
        <WalletMultiButton className="!bg-violet-600 !rounded-full !text-base !font-bold !px-8 !py-3 hover:!bg-violet-700" />
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🐾</div>
          <p className="text-slate-500 font-medium">Loading your pets...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😿</div>
          <p className="text-red-500 font-medium">Failed to load agents. Is the backend running?</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (agents.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🐣</div>
        <h2 className="text-2xl font-bold text-slate-800">No pets yet!</h2>
        <p className="text-slate-500">Register your first AI agent to get started.</p>
        <button
          onClick={() => navigate('/app/adopt')}
          className="bg-violet-600 text-white font-bold px-8 py-3 rounded-full hover:bg-violet-700 transition-colors"
        >
          🐾 Adopt First Agent
        </button>
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Pets</h1>
          <p className="text-sm text-slate-400">{agents.length} agent{agents.length !== 1 ? 's' : ''} · Live on Solana</p>
        </div>
        <button
          onClick={() => navigate('/app/adopt')}
          className="bg-violet-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-violet-700 transition-colors"
        >
          + Adopt Agent
        </button>
      </div>

      {/* Daily Bonus Banner */}
      {!dailyClaimed && agents.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div>
              <p className="font-bold text-slate-900 text-sm">Daily Bonus Available!</p>
              <p className="text-xs text-slate-500">Claim your free XP for today — come back every day!</p>
            </div>
          </div>
          <button
            onClick={async () => {
              setShowBonus(true);
              await claimDailyBonus(wallet!, agents, () => {}, setDailyClaimed);
              setTimeout(() => setShowBonus(false), 2000);
            }}
            className="bg-amber-500 text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-amber-600 transition-all flex-shrink-0">
            {showBonus ? '✅ Claimed!' : '🎁 Claim +10 XP'}
          </button>
        </div>
      )}
      {dailyClaimed && agents.length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-3 mb-6 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <p className="text-sm font-bold text-green-700">Daily bonus claimed! Come back tomorrow for more XP.</p>
        </div>
      )}

      {/* Pet grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {agents.map((agent) => (
          <PetCard
            key={agent.id}
            agent={agent}
            onClick={() => navigate(`/app/agent/${agent.id}`)}
          />
        ))}
      </div>

      {/* Activity feeds */}
      {agents.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {agents.slice(0, 2).map((agent) => (
            <ActivityFeed key={agent.id} agentId={agent.id} agentName={agent.name} />
          ))}
        </div>
      )}
    </div>
  );
}

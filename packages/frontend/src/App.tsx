import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import { NavBar } from './components/NavBar';
import { Dashboard } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';

import '@solana/wallet-adapter-react-ui/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 10_000 },
  },
});

const NETWORK = (import.meta.env.VITE_SOLANA_NETWORK as 'mainnet-beta' | 'devnet') || 'mainnet-beta';

export default function App() {
  const endpoint = useMemo(
    () => import.meta.env.VITE_API_URL
      ? `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_RPC_KEY || ''}`
      : clusterApiUrl(NETWORK),
    []
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <NavBar />
              <Routes>
                <Route path="/app" element={<Dashboard />} />
                <Route path="/app/leaderboard" element={<Leaderboard />} />
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
            </BrowserRouter>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

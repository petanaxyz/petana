import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { NavBar }       from './components/NavBar';
import { Landing }      from './pages/Landing';
import { Dashboard }    from './pages/Dashboard';
import { Demo }         from './pages/Demo';
import { Leaderboard }  from './pages/Leaderboard';
import { Battle }       from './pages/Battle';
import { Adopt }        from './pages/Adopt';
import { AgentProfile } from './pages/AgentProfile';
import { Office } from './pages/Office';
import { Office } from './pages/Office';
import '@solana/wallet-adapter-react-ui/styles.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2, staleTime: 10_000 } } });

export default function App() {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  const wallets  = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Routes>
                <Route path="/"                   element={<Landing />} />
                <Route path="/app"                element={<><NavBar /><Dashboard /></>} />
                <Route path="/app/adopt"          element={<><NavBar /><Adopt /></>} />
                <Route path="/app/agent/:id"      element={<><NavBar /><AgentProfile /></>} />
                <Route path="/app/leaderboard"    element={<><NavBar /><Leaderboard /></>} />
                <Route path="/app/battle" element={<><NavBar /><Battle /></>} />
                <Route path="/app/office" element={<><NavBar /><Office /></>} />
                <Route path="/app/office" element={<><NavBar /><Office /></>} />
                <Route path="/demo"               element={<><NavBar /><Demo /></>} />
                <Route path="*"                   element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

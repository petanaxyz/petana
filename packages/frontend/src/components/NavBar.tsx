import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function NavBar() {
  const location = useLocation();

  const links = [
    { to: '/app',              label: 'My Pets' },
    { to: '/app/leaderboard',  label: 'Leaderboard' },
    { to: '/app/battle',       label: '⚔️ Battle' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-100 h-16 flex items-center justify-between px-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 no-underline">
        <img src="/logo.png" alt="PETANA" className="h-8 w-auto" />
        <span className="font-extrabold text-xl tracking-widest text-violet-600">PETANA</span>
      </Link>

      {/* Links */}
      <div className="hidden md:flex items-center gap-6">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`text-sm font-semibold transition-colors ${
              location.pathname === to
                ? 'text-violet-600'
                : 'text-slate-500 hover:text-violet-500'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Wallet button */}
      <WalletMultiButton className="!bg-violet-600 !rounded-full !text-sm !font-bold !h-10 hover:!bg-violet-700" />
    </nav>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState } from 'react';

export function NavBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/app',             label: 'My Pets' },
    { to: '/app/leaderboard', label: 'Leaderboard' },
    { to: '/demo',            label: '🎮 Demo' },
    { to: '/app/battle',      label: '⚔️ Battle' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-100 h-16 flex items-center justify-between px-4 md:px-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
        <img src="/logo.png" alt="PETANA" className="h-8 w-auto" onError={e => (e.currentTarget.style.display='none')} />
        <span className="font-extrabold text-xl tracking-widest text-violet-600">PETANA</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-6">
        {links.map(({ to, label }) => (
          <Link key={to} to={to}
            className={`text-sm font-semibold transition-colors ${
              location.pathname === to ? 'text-violet-600' : 'text-slate-500 hover:text-violet-500'
            }`}>
            {label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <WalletMultiButton className="!bg-violet-600 !rounded-full !text-sm !font-bold !h-10 hover:!bg-violet-700" />
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-purple-50"
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-purple-100 shadow-lg md:hidden z-50">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-6 py-3 text-sm font-semibold border-b border-purple-50 ${
                location.pathname === to ? 'text-violet-600 bg-violet-50' : 'text-slate-600 hover:bg-purple-50'
              }`}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

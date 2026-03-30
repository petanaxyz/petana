import { useState, useEffect } from 'react';

const LAUNCH_TIME = new Date('2026-03-31T03:00:00Z').getTime();

export function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [launched, setLaunched] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_TIME - Date.now();
      if (diff <= 0) { setLaunched(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div style={{
      position: 'fixed', top: 64, left: 0, right: 0, zIndex: 49,
      background: 'linear-gradient(90deg, #9945FF, #FF5FA0, #FF8C42, #9945FF)',
      backgroundSize: '300% 100%',
      animation: 'gradShift 4s linear infinite',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 16, flexWrap: 'wrap',
    }}>
      {!launched ? (
        <>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
            🚀 $FEED launching on PumpFun in
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {[['h', timeLeft.h], ['m', timeLeft.m], ['s', timeLeft.s]].map(([label, val]) => (
              <div key={label as string} style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: 8,
                  padding: '4px 10px', minWidth: 42,
                  color: '#fff', fontWeight: 800, fontSize: 18,
                  fontFamily: 'monospace', letterSpacing: 1
                }}>{pad(val as number)}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600 }}>CA:</span>
            <div style={{
              background: 'rgba(0,0,0,0.3)', borderRadius: 20,
              padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ color: '#FFD426', fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>TBA</span>
              <button
                onClick={() => { navigator.clipboard.writeText('TBA'); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '2px 8px', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {copied ? '✓' : '📋'}
              </button>
            </div>
          </div>
          <a href="https://pump.fun" target="_blank" rel="noreferrer"
            style={{ background: '#fff', color: '#9945FF', fontWeight: 800, fontSize: 12, padding: '5px 14px', borderRadius: 20, textDecoration: 'none' }}>
            🚀 Buy on PumpFun
          </a>
        </>
      ) : (
        <>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>🎉 $FEED is LIVE on PumpFun!</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>CA:</span>
            <span style={{ color: '#FFD426', fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>TBA</span>
          </div>
          <a href="https://pump.fun" target="_blank" rel="noreferrer"
            style={{ background: '#fff', color: '#9945FF', fontWeight: 800, fontSize: 13, padding: '6px 18px', borderRadius: 20, textDecoration: 'none' }}>
            🚀 Buy Now!
          </a>
        </>
      )}
    </div>
  );
}

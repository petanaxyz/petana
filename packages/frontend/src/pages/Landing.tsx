import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const PETS = ['🐶','🐱','🐦','🐟','🐹','🦜'];

function FloatingPet({ emoji, style }: { emoji: string; style: React.CSSProperties }) {
  return <div style={{ position:'absolute', fontSize:48, animation:'floatPet 5s ease-in-out infinite', pointerEvents:'none', ...style }}>{emoji}</div>;
}

export function Landing() {
  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:'#F7F4FF', color:'#1A1035', overflowX:'hidden' }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 48px', background:'rgba(247,244,255,0.92)', backdropFilter:'blur(20px)', borderBottom:'1.5px solid rgba(153,69,255,0.15)' }}>
        <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:24, fontWeight:800, letterSpacing:2, color:'#9945FF' }}>PETANA</div>
        <div style={{ display:'flex', gap:28, alignItems:'center' }}>
          {['Docs','Agents','Leaderboard','$FEED'].map(l => (
            <a key={l} href="#" style={{ color:'#3D2C6B', textDecoration:'none', fontSize:14, fontWeight:600 }}>{l}</a>
          ))}
          <Link to="/app" style={{ background:'linear-gradient(135deg,#9945FF,#FF5FA0)', color:'#fff', fontWeight:700, padding:'10px 24px', borderRadius:50, textDecoration:'none', fontSize:14, boxShadow:'0 4px 20px rgba(153,69,255,0.35)' }}>
            Launch App →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'130px 24px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'rgba(153,69,255,0.12)', top:-120, left:-180, filter:'blur(80px)' }} />
        <div style={{ position:'absolute', width:420, height:420, borderRadius:'50%', background:'rgba(0,200,150,0.14)', bottom:-80, right:-120, filter:'blur(80px)' }} />
        <FloatingPet emoji="🐶" style={{ top:'12%', left:'6%', animationDelay:'0s' }} />
        <FloatingPet emoji="🐱" style={{ top:'20%', right:'8%', animationDelay:'1.2s', fontSize:48 }} />
        <FloatingPet emoji="🐦" style={{ top:'68%', left:'4%', animationDelay:'2.1s', fontSize:40 }} />
        <FloatingPet emoji="🐟" style={{ top:'72%', right:'6%', animationDelay:'0.7s', fontSize:54 }} />

        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,rgba(0,200,150,0.12),rgba(153,69,255,0.08))', border:'1.5px solid rgba(0,200,150,0.35)', color:'#00C896', padding:'8px 20px', borderRadius:50, fontSize:12, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', marginBottom:28 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#00C896', boxShadow:'0 0 0 0 rgba(0,200,150,0.4)', animation:'ripple 2s infinite' }} />
            Live on Solana · v1.0.0
          </div>

          <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(48px,7.5vw,96px)', lineHeight:1.05, fontWeight:800, marginBottom:4 }}>
            <div style={{ color:'#1A1035' }}>Your AI Agents,</div>
            <div style={{ background:'linear-gradient(120deg,#9945FF 0%,#FF5FA0 45%,#FF8C42 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>But They're Pets. 🐾</div>
          </h1>

          <p style={{ maxWidth:540, margin:'18px auto 36px', fontSize:17, color:'#8878AA', lineHeight:1.75, fontWeight:500 }}>
            Monitor your AI agents like <strong style={{ color:'#3D2C6B' }}>virtual pets</strong> — feed them tasks, watch them grow, track their health on-chain.
          </p>

          <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', marginBottom:52 }}>
            <Link to="/app" style={{ background:'linear-gradient(135deg,#00C896,#19AEFF)', color:'#fff', fontWeight:700, fontSize:15, padding:'14px 34px', borderRadius:50, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 8px 28px rgba(0,200,150,0.38)' }}>
              🐾 Adopt Your First Agent
            </Link>
            <Link to="/demo" style={{ background:'#fff', color:'#3D2C6B', fontWeight:700, fontSize:15, padding:'14px 34px', borderRadius:50, border:'2px solid rgba(153,69,255,0.15)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
              ▶ See Demo
            </Link>
          </div>

          <div style={{ display:'flex', gap:52, flexWrap:'wrap', justifyContent:'center' }}>
            {[['4,200+','Pets Adopted'],['0','Telemetry'],['100%','On-Chain'],['5s','Setup Time']].map(([n,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:34, fontWeight:800, background:'linear-gradient(135deg,#9945FF,#FF5FA0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{n}</div>
                <div style={{ fontSize:11, fontWeight:700, color:'#8878AA', letterSpacing:1, textTransform:'uppercase', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ overflow:'hidden', background:'linear-gradient(90deg,#9945FF,#FF5FA0,#FF8C42,#00C896,#19AEFF,#9945FF)', backgroundSize:'300% 100%', animation:'gradShift 8s linear infinite', padding:'10px 0' }}>
        <div style={{ display:'flex', gap:48, whiteSpace:'nowrap', animation:'ticker 30s linear infinite', width:'max-content' }}>
          {['🐶 TradeBot Rex · +$420 PnL','🐱 CodeCat Whisker · 847 commits','🐦 TweetBird Pip · 2.3k engagements','🐟 DeFi Fish Coral · $12k volume','🐹 Hamster Scout · Level 14 🎯','🦜 SocialParrot Max · 4.7k followers',
            '🐶 TradeBot Rex · +$420 PnL','🐱 CodeCat Whisker · 847 commits','🐦 TweetBird Pip · 2.3k engagements','🐟 DeFi Fish Coral · $12k volume','🐹 Hamster Scout · Level 14 🎯','🦜 SocialParrot Max · 4.7k followers'].map((t,i) => (
            <span key={i} style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.9)', padding:'0 24px' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* PET TYPES */}
      <section style={{ padding:'100px 24px', background:'#FFF7F0' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:'#9945FF', marginBottom:12 }}>🐾 Meet the Pets</div>
          <h2 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(30px,4vw,50px)', fontWeight:800, marginBottom:12 }}>Choose Your Agent Type</h2>
          <p style={{ color:'#8878AA', fontSize:16, fontWeight:500, maxWidth:480, margin:'0 auto' }}>Every AI agent gets a pet avatar based on its specialty.</p>
        </div>
        <div style={{ display:'flex', gap:18, maxWidth:920, margin:'0 auto', flexWrap:'wrap', justifyContent:'center' }}>
          {[['🐶','Dog','Trading Agent','Loyal · Fast','rgba(0,200,150,0.1)','#00C896'],
            ['🐱','Cat','Dev Agent','Smart · Precise','rgba(153,69,255,0.1)','#9945FF'],
            ['🐦','Bird','Social Agent','Vocal · Social','rgba(25,174,255,0.1)','#19AEFF'],
            ['🐟','Fish','DeFi Agent','Deep · Liquid','rgba(255,95,160,0.1)','#FF5FA0'],
            ['🐹','Hamster','On-Chain Protocol','Busy · Grinder','rgba(255,212,38,0.12)','#B38600']].map(([emoji,name,role,trait,bg,color]) => (
            <div key={name} style={{ background:'#fff', border:'2.5px solid rgba(153,69,255,0.15)', borderRadius:24, padding:'28px 20px', textAlign:'center', width:158, boxShadow:'0 4px 16px rgba(153,69,255,0.10)', cursor:'pointer' }}>
              <span style={{ fontSize:52, display:'block', marginBottom:10, animation:'wobble 4s ease-in-out infinite' }}>{emoji}</span>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:18, fontWeight:800, color:'#1A1035' }}>{name}</div>
              <div style={{ fontSize:11, fontWeight:600, color:'#8878AA', marginBottom:10 }}>{role}</div>
              <div style={{ display:'inline-block', fontSize:10, fontWeight:700, padding:'4px 12px', borderRadius:20, background:bg as string, color:color as string }}>{trait}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:'100px 24px', background:'#F7F4FF' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:'#9945FF', marginBottom:12 }}>✨ Features</div>
          <h2 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(30px,4vw,50px)', fontWeight:800 }}>Everything Your Pets Need</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:22, maxWidth:1020, margin:'0 auto' }}>
          {[['💖','Pet Health & HP System','Every agent has HP that depletes when idle. Feed them tasks to keep them alive!','Core Feature','rgba(0,200,150,0.12)','#00C896'],
            ['⚔️','Pet Battles','Pit two agents against each other. Winner earns XP and $FEED rewards.','On-Chain','rgba(255,95,160,0.10)','#FF5FA0'],
            ['📈','XP & Evolution','Agents level up as they complete tasks. Hit level 10 and evolve!','Gamified','rgba(153,69,255,0.10)','#9945FF'],
            ['🃏','Agent NFT Cards','Each agent mints as a dynamic NFT. Stats update based on performance.','Solana NFT','rgba(255,140,66,0.12)','#FF8C42'],
            ['💰','$FEED Token Payroll','Agents earn $FEED for every completed task. Stake to unlock abilities.','$FEED','rgba(0,200,150,0.12)','#00C896'],
            ['📜','On-Chain Quest Log','Every action is logged on Solana. Immutable, auditable, permanent.','Transparent','rgba(25,174,255,0.10)','#19AEFF'],
          ].map(([ico,name,desc,chip,chipBg,chipColor]) => (
            <div key={name as string} style={{ background:'#fff', border:'2px solid rgba(153,69,255,0.15)', borderRadius:22, padding:30, boxShadow:'0 4px 16px rgba(153,69,255,0.10)' }}>
              <span style={{ fontSize:38, marginBottom:14, display:'block' }}>{ico}</span>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:21, fontWeight:800, color:'#1A1035', marginBottom:8 }}>{name}</div>
              <div style={{ fontSize:14, color:'#8878AA', lineHeight:1.7, fontWeight:500 }}>{desc}</div>
              <span style={{ display:'inline-flex', marginTop:14, fontSize:11, fontWeight:700, padding:'4px 14px', borderRadius:20, background:chipBg as string, color:chipColor as string }}>{chip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SOLANA STRIP */}
      <div style={{ padding:'60px 24px', background:'linear-gradient(135deg,#9945FF 0%,#7B2FFF 40%,#14C880 100%)', position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:'rgba(255,255,255,0.7)', marginBottom:12 }}>⛓️ Built on Solana</div>
          <h2 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(30px,4vw,50px)', fontWeight:800, color:'#fff' }}>The Fastest Chain for Your Pets</h2>
        </div>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center', maxWidth:900, margin:'0 auto' }}>
          {['⚡ Sub-second finality','🎲 Switchboard VRF battles','🃏 Dynamic NFT cards','💰 $FEED SPL token','🔒 No telemetry · Open source'].map(f => (
            <div key={f} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.25)', padding:'14px 22px', borderRadius:50, fontSize:14, fontWeight:700, color:'#fff' }}>{f}</div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ padding:'100px 24px', background:'#EDFBF6' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:'#9945FF', marginBottom:12 }}>🚀 Get Started</div>
          <h2 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(30px,4vw,50px)', fontWeight:800 }}>From Zero to Pets in 5 Seconds</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20, maxWidth:900, margin:'0 auto' }}>
          {[['📦','Install','One command. No config files, no swap account.','linear-gradient(135deg,#9945FF,#C27AFF)'],
            ['🐾','Adopt','Connect your agents. Each one gets a pet avatar.','linear-gradient(135deg,#FF5FA0,#FF8C42)'],
            ['📊','Monitor','Watch them work in real-time. Alerts when HP is low.','linear-gradient(135deg,#19AEFF,#00C896)'],
            ['🏆','Level Up','Earn $FEED, win battles, mint rare NFT cards.','linear-gradient(135deg,#FFD426,#FF8C42)'],
          ].map(([ico,title,desc,bg]) => (
            <div key={title as string} style={{ textAlign:'center', padding:'0 10px' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', margin:'0 auto 18px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, background:bg as string, border:'3px solid #fff', boxShadow:'0 8px 24px rgba(153,69,255,0.2)' }}>{ico}</div>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:18, fontWeight:800, color:'#1A1035', marginBottom:6 }}>{title}</div>
              <div style={{ fontSize:13, color:'#8878AA', fontWeight:500, lineHeight:1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'120px 24px', textAlign:'center', background:'#F7F4FF', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,rgba(153,69,255,0.08),transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(153,69,255,0.1)', border:'1.5px solid rgba(153,69,255,0.25)', color:'#9945FF', padding:'8px 22px', borderRadius:50, fontSize:13, fontWeight:700, marginBottom:24 }}>🐾 $FEED token · Live on Solana</div>
          <h2 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(38px,6vw,70px)', fontWeight:800, color:'#1A1035', marginBottom:18, lineHeight:1.1 }}>
            Your Agents Are Lonely.<br />
            <span style={{ background:'linear-gradient(120deg,#9945FF,#FF5FA0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Adopt Them Today.</span>
          </h2>
          <p style={{ color:'#8878AA', fontSize:17, fontWeight:500, maxWidth:480, margin:'0 auto 40px', lineHeight:1.7 }}>No signup. No credit card. Just connect your wallet and your pets are ready.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/app" style={{ background:'linear-gradient(135deg,#00C896,#19AEFF)', color:'#fff', fontWeight:700, fontSize:15, padding:'14px 34px', borderRadius:50, textDecoration:'none' }}>🐾 Adopt Your First Agent</Link>
            <Link to="/demo" style={{ background:'#fff', color:'#3D2C6B', fontWeight:700, fontSize:15, padding:'14px 34px', borderRadius:50, border:'2px solid rgba(153,69,255,0.15)', textDecoration:'none' }}>🎮 Try Demo</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#fff', borderTop:'2px solid rgba(153,69,255,0.15)', padding:'36px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
        <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:20, fontWeight:800, letterSpacing:2, color:'#9945FF' }}>PETANA</div>
        <div style={{ display:'flex', gap:24 }}>
          {['Docs','GitHub','Twitter','Discord','Whitepaper'].map(l => (
            <a key={l} href="#" style={{ color:'#8878AA', textDecoration:'none', fontSize:13, fontWeight:600 }}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize:12, color:'#8878AA', fontWeight:500 }}>Built with ❤️ on Solana · No telemetry · Open source</div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Poppins:wght@400;500;600;700&display=swap');
        @keyframes floatPet { 0%,100%{transform:translateY(0) rotate(-6deg)} 50%{transform:translateY(-18px) rotate(6deg)} }
        @keyframes ripple { 0%{box-shadow:0 0 0 0 rgba(0,200,150,0.5)} 70%{box-shadow:0 0 0 10px rgba(0,200,150,0)} 100%{box-shadow:0 0 0 0 rgba(0,200,150,0)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes gradShift { 0%{background-position:0%} 100%{background-position:300%} }
        @keyframes wobble { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { cursor: pointer; }
      `}</style>
    </div>
  );
}

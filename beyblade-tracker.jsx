import { useState, useCallback, useEffect, useRef } from "react";

const HELP_STEPS = [
  { icon: '🎮', title: 'ADD A COMBO', desc: 'Tap [ + NEW ] to register your Beyblade combo. Enter the Blade, Ratchet, and Bit parts.' },
  { icon: '⚔️', title: 'RECORD BATTLES', desc: 'Go to the BATTLE tab. After each match, tap WIN or LOSS under the finish type that ended the battle.' },
  { icon: '🌀', title: 'SPIN FINISH', desc: 'Opponent stops spinning. Worth 1 point.' },
  { icon: '💥', title: 'OVER FINISH', desc: 'Opponent flies out of the stadium. Worth 2 points.' },
  { icon: '💢', title: 'BURST FINISH', desc: 'Opponent\'s Beyblade bursts apart. Worth 2 points.' },
  { icon: '⚡', title: 'XTREME FINISH', desc: 'Opponent hits the Xtreme Line and exits. Worth 3 points.' },
  { icon: '📊', title: 'VIEW STATS', desc: 'The STATS tab shows your score breakdown, win rate, and average points per battle.' },
  { icon: '↩', title: 'UNDO', desc: 'Made a mistake? Tap UNDO LAST in the BATTLE tab to reverse the previous record.' },
];

const FINISH_TYPES = [
  { key: 'spin',   label: 'SPIN FINISH',   points: 1, color: '#38D9F5', glow: '#38D9F5', icon: '🌀', desc: '1 PT' },
  { key: 'over',   label: 'OVER FINISH',   points: 2, color: '#FFB340', glow: '#FFB340', icon: '💥', desc: '2 PT' },
  { key: 'burst',  label: 'BURST FINISH',  points: 2, color: '#FF5C7A', glow: '#FF5C7A', icon: '💢', desc: '2 PT' },
  { key: 'xtreme', label: 'XTREME FINISH', points: 3, color: '#C97FFF', glow: '#C97FFF', icon: '⚡', desc: '3 PT' },
];

const DEFAULT_STATS = () => ({
  spin: { wins: 0, losses: 0 },
  over: { wins: 0, losses: 0 },
  burst: { wins: 0, losses: 0 },
  xtreme: { wins: 0, losses: 0 },
});

const loadData = async () => {
  try {
    const result = await window.storage.get('beyblade-combos');
    return result ? JSON.parse(result.value) : [];
  } catch { return []; }
};
const saveData = async (combos) => {
  try { await window.storage.set('beyblade-combos', JSON.stringify(combos)); } catch(e) { console.error(e); }
};

function calcStats(stats) {
  let totalWins = 0, totalLosses = 0, totalGained = 0, totalLost = 0;
  FINISH_TYPES.forEach(ft => {
    const s = stats[ft.key];
    totalWins += s.wins;
    totalLosses += s.losses;
    totalGained += s.wins * ft.points;
    totalLost += s.losses * ft.points;
  });
  const totalBattles = totalWins + totalLosses;
  const winRate = totalBattles > 0 ? (totalWins / totalBattles * 100) : 0;
  const avgWinScore = totalWins > 0 ? (totalGained / totalWins) : 0;
  const netPoints = totalGained - totalLost;
  const avgNetPerBattle = totalBattles > 0 ? (netPoints / totalBattles) : 0;
  return { totalWins, totalLosses, totalBattles, totalGained, totalLost, winRate, avgWinScore, netPoints, avgNetPerBattle };
}

// ── HUD corner bracket decoration ──
function HudPanel({ children, color = '#38D9F5', style = {}, title }) {
  const c = color;
  const dim = 14;
  const thick = 2;
  const cornerStyle = (top, right, bottom, left) => ({
    position: 'absolute',
    width: dim, height: dim,
    top: top !== undefined ? top : undefined,
    bottom: bottom !== undefined ? bottom : undefined,
    left: left !== undefined ? left : undefined,
    right: right !== undefined ? right : undefined,
    borderTop: top !== undefined ? `${thick}px solid ${c}` : 'none',
    borderBottom: bottom !== undefined ? `${thick}px solid ${c}` : 'none',
    borderLeft: left !== undefined ? `${thick}px solid ${c}` : 'none',
    borderRight: right !== undefined ? `${thick}px solid ${c}` : 'none',
  });
  return (
    <div style={{
      position: 'relative',
      background: 'rgba(0,0,0,0.6)',
      border: `1px solid ${c}22`,
      borderRadius: 4,
      padding: title ? '36px 16px 16px' : '16px',
      boxShadow: `0 0 20px ${c}10, inset 0 0 20px rgba(0,0,0,0.5)`,
      ...style,
    }}>
      {title && (
        <div style={{
          position: 'absolute', top: -1, left: 12,
          background: '#050508', padding: '0 8px',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: c, letterSpacing: 1,
          textShadow: `0 0 8px ${c}`,
        }}>{title}</div>
      )}
      <div style={cornerStyle(0, undefined, undefined, 0)} />
      <div style={cornerStyle(0, 0, undefined, undefined)} />
      <div style={cornerStyle(undefined, undefined, 0, 0)} />
      <div style={cornerStyle(undefined, 0, 0, undefined)} />
      {children}
    </div>
  );
}

// ── Arcade stat chip ──
function StatChip({ label, value, color = '#38D9F5', unit = '' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 6, minWidth: 64,
    }}>
      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 16, fontWeight: 400,
        color, textShadow: `0 0 12px ${color}, 0 0 24px ${color}88`,
        lineHeight: 1,
      }}>
        {typeof value === 'number'
          ? (Number.isInteger(value) ? value : value.toFixed(1))
          : value}
        {unit && <span style={{ fontSize: 9 }}>{unit}</span>}
      </div>
      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 6,
        color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textAlign: 'center',
      }}>{label}</div>
    </div>
  );
}

// ── Animated flash on record ──
function FlashButton({ onClick, children, variant = 'win' }) {
  const [flash, setFlash] = useState(false);
  const isWin = variant === 'win';
  const base = isWin ? 'rgba(0,255,100,0.08)' : 'rgba(255,60,80,0.08)';
  const active = isWin ? 'rgba(0,255,100,0.35)' : 'rgba(255,60,80,0.35)';
  const col = isWin ? '#00FF64' : '#FF3C50';
  const border = isWin ? '#00FF6444' : '#FF3C5044';
  const handle = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    onClick();
  };
  return (
    <button onClick={handle} style={{
      flex: 1, padding: '14px 8px', borderRadius: 4,
      border: `1px solid ${flash ? col : border}`,
      background: flash ? active : base,
      color: col, cursor: 'pointer',
      fontFamily: "'Press Start 2P', monospace", fontSize: 9,
      letterSpacing: 0.5, transition: 'all 0.15s',
      textShadow: flash ? `0 0 8px ${col}` : 'none',
      boxShadow: flash ? `0 0 16px ${col}66` : 'none',
      WebkitTapHighlightColor: 'transparent',
      userSelect: 'none',
    }}>
      {children}
    </button>
  );
}

// ── Finish type battle row ──
function FinishRow({ finishType: ft, stat, onRecord }) {
  const total = stat.wins + stat.losses;
  const rate = total > 0 ? (stat.wins / total * 100) : 0;
  return (
    <div style={{
      marginBottom: 12,
      padding: '14px 12px',
      background: `${ft.color}08`,
      border: `1px solid ${ft.color}22`,
      borderRadius: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{ft.icon}</span>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: ft.color, textShadow: `0 0 6px ${ft.color}`, letterSpacing: 0.5 }}>{ft.label}</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{ft.desc}</div>
          </div>
        </div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
          <span style={{ color: '#00FF64' }}>{stat.wins}W</span> / <span style={{ color: '#FF3C50' }}>{stat.losses}L</span>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${rate}%`, background: ft.color, boxShadow: `0 0 6px ${ft.color}`, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <FlashButton variant="win" onClick={() => onRecord(ft.key, 'win')}>▲ WIN</FlashButton>
        <FlashButton variant="loss" onClick={() => onRecord(ft.key, 'loss')}>▼ LOSS</FlashButton>
      </div>
    </div>
  );
}

// ── Combo list card ──
function ComboCard({ combo, isActive, onSelect, onDelete }) {
  const stats = calcStats(combo.stats);
  const winPct = stats.winRate.toFixed(0);
  const col = isActive ? '#38D9F5' : 'rgba(255,255,255,0.15)';
  return (
    <div onClick={onSelect} style={{
      padding: '14px 12px',
      background: isActive ? 'rgba(56,217,245,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isActive ? '#38D9F544' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 4, cursor: 'pointer',
      boxShadow: isActive ? '0 0 16px #38D9F518' : 'none',
      transition: 'all 0.2s', position: 'relative',
      WebkitTapHighlightColor: 'transparent',
    }}>
      {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#38D9F5', boxShadow: '0 0 8px #38D9F5', borderRadius: '4px 0 0 4px' }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingLeft: isActive ? 8 : 0 }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: col, textShadow: isActive ? '0 0 6px #38D9F5' : 'none', letterSpacing: 0.5, lineHeight: 1.5, flex: 1, paddingRight: 8 }}>
          {combo.name || 'UNNAMED'}
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{
          background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)',
          cursor: 'pointer', fontSize: 12, padding: '0 4px', lineHeight: 1,
          WebkitTapHighlightColor: 'transparent',
        }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 12, fontFamily: "'Press Start 2P', monospace", fontSize: 6, paddingLeft: isActive ? 8 : 0 }}>
        <span style={{ color: '#00FF64' }}>{winPct}% WIN</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>{stats.totalBattles} BTLS</span>
        <span style={{ color: '#38D9F5' }}>{stats.avgWinScore.toFixed(1)} AVG</span>
      </div>
    </div>
  );
}

// ── Help Modal ──
function HelpModal({ onClose }) {
  const [step, setStep] = useState(0);
  const total = HELP_STEPS.length;
  const s = HELP_STEPS[step];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 480,
        background: '#07070c', borderRadius: '12px 12px 0 0',
        border: '1px solid rgba(56,217,245,0.2)', borderBottom: 'none',
        padding: '28px 20px 40px',
        boxShadow: '0 -8px 40px rgba(56,217,245,0.12)',
      }}>
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 24px' }} />

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {HELP_STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i === step ? '#38D9F5' : 'rgba(255,255,255,0.15)',
              boxShadow: i === step ? '0 0 6px #38D9F5' : 'none',
              transition: 'all 0.3s', cursor: 'pointer',
            }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#38D9F5', textShadow: '0 0 8px #38D9F5', marginBottom: 16, letterSpacing: 1 }}>{s.title}</div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'rgba(255,255,255,0.5)', lineHeight: 2, maxWidth: 320 }}>{s.desc}</div>
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button onClick={() => setStep(p => Math.max(0, p - 1))} disabled={step === 0} style={{
            flex: 1, padding: '13px', borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
            color: step === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
            fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: step === 0 ? 'default' : 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}>◀ PREV</button>
          {step < total - 1 ? (
            <button onClick={() => setStep(p => p + 1)} style={{
              flex: 2, padding: '13px', borderRadius: 4, border: 'none',
              background: 'linear-gradient(135deg, #38D9F5, #C97FFF)', color: '#000',
              fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}>NEXT ▶</button>
          ) : (
            <button onClick={onClose} style={{
              flex: 2, padding: '13px', borderRadius: 4, border: 'none',
              background: 'linear-gradient(135deg, #00FF64, #38D9F5)', color: '#000',
              fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}>START ⚡</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Bottom tab bar (mobile) ──
function TabBar({ tab, setTab, hasCombos }) {
  const tabs = [
    { key: 'combos', label: 'ROSTER', icon: '🎮' },
    { key: 'battle', label: 'BATTLE', icon: '⚔️', disabled: !hasCombos },
    { key: 'stats',  label: 'STATS',  icon: '📊', disabled: !hasCombos },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      display: 'flex', borderTop: '1px solid rgba(56,217,245,0.18)',
      background: 'rgba(8,8,20,0.97)', backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }}>
      {tabs.map(t => {
        const active = tab === t.key;
        return (
          <button key={t.key} onClick={() => !t.disabled && setTab(t.key)} style={{
            flex: 1, padding: '12px 4px 10px',
            background: 'transparent', border: 'none', cursor: t.disabled ? 'default' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            opacity: t.disabled ? 0.3 : 1,
            WebkitTapHighlightColor: 'transparent',
          }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 6,
              color: active ? '#38D9F5' : 'rgba(180,220,255,0.35)',
              textShadow: active ? '0 0 8px #38D9F5' : 'none',
            }}>{t.label}</span>
            {active && <div style={{ width: 24, height: 2, background: '#38D9F5', boxShadow: '0 0 6px #38D9F5', borderRadius: 1 }} />}
          </button>
        );
      })}
    </nav>
  );
}

export default function App() {
  const [combos, setCombos] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newCombo, setNewCombo] = useState({ name: '', blade: '', ratchet: '', bit: '' });
  const [loaded, setLoaded] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [tab, setTab] = useState('combos');
  const [notification, setNotification] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const notifTimer = useRef(null);

  useEffect(() => { loadData().then(data => { setCombos(data); setLoaded(true); }); }, []);
  useEffect(() => { if (loaded) saveData(combos); }, [combos, loaded]);

  const activeCombo = combos[activeIdx] || null;
  const activeStats = activeCombo ? calcStats(activeCombo.stats) : null;

  const showNotif = (msg, color = '#00FF64') => {
    clearTimeout(notifTimer.current);
    setNotification({ msg, color });
    notifTimer.current = setTimeout(() => setNotification(null), 1200);
  };

  const addCombo = () => {
    if (!newCombo.name.trim()) return;
    const c = { id: Date.now(), ...newCombo, stats: DEFAULT_STATS() };
    setCombos(prev => [...prev, c]);
    setActiveIdx(combos.length);
    setShowAdd(false);
    setNewCombo({ name: '', blade: '', ratchet: '', bit: '' });
    setTab('battle');
  };

  const deleteCombo = (idx) => {
    setCombos(prev => prev.filter((_, i) => i !== idx));
    if (activeIdx >= combos.length - 1) setActiveIdx(Math.max(0, combos.length - 2));
  };

  const recordResult = useCallback((finishKey, result) => {
    setUndoStack(prev => [...prev.slice(-19), { idx: activeIdx, finishKey, result }]);
    setCombos(prev => prev.map((c, i) => {
      if (i !== activeIdx) return c;
      const newStats = { ...c.stats };
      newStats[finishKey] = { ...newStats[finishKey] };
      if (result === 'win') { newStats[finishKey].wins += 1; showNotif('WIN!', '#00FF64'); }
      else { newStats[finishKey].losses += 1; showNotif('LOSS', '#FF3C50'); }
      return { ...c, stats: newStats };
    }));
  }, [activeIdx]);

  const undo = () => {
    if (!undoStack.length) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setCombos(prev => prev.map((c, i) => {
      if (i !== last.idx) return c;
      const newStats = { ...c.stats };
      newStats[last.finishKey] = { ...newStats[last.finishKey] };
      if (last.result === 'win') newStats[last.finishKey].wins = Math.max(0, newStats[last.finishKey].wins - 1);
      else newStats[last.finishKey].losses = Math.max(0, newStats[last.finishKey].losses - 1);
      return { ...c, stats: newStats };
    }));
    showNotif('UNDONE', '#FF9500');
  };

  const globalStats = (() => {
    const merged = DEFAULT_STATS();
    combos.forEach(c => FINISH_TYPES.forEach(ft => {
      merged[ft.key].wins += c.stats[ft.key].wins;
      merged[ft.key].losses += c.stats[ft.key].losses;
    }));
    return calcStats(merged);
  })();

  // ── Panel renderers ──

  const renderCombosPanel = () => (
    <div style={{ padding: '16px 14px' }}>
      <HudPanel color="#38D9F5" title="COMBO ROSTER" style={{ marginBottom: 14 }}>
        {combos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 2 }}>
              NO COMBOS<br/>REGISTERED
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {combos.map((c, i) => (
              <ComboCard key={c.id} combo={c} isActive={i === activeIdx}
                onSelect={() => { setActiveIdx(i); setTab('battle'); }}
                onDelete={() => deleteCombo(i)} />
            ))}
          </div>
        )}
      </HudPanel>

      {combos.length > 0 && (
        <HudPanel color="#C97FFF" title="GLOBAL STATS" style={{ marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '4px 0' }}>
            <StatChip label="WIN RATE" value={globalStats.winRate} unit="%" color="#00FF64" />
            <StatChip label="BATTLES" value={globalStats.totalBattles} color="#FF9500" />
            <StatChip label="AVG WIN PT" value={globalStats.avgWinScore} color="#38D9F5" />
            <StatChip label="NET PT/BTL" value={globalStats.avgNetPerBattle} color="#C97FFF" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14, fontFamily: "'Press Start 2P', monospace", fontSize: 7 }}>
            <span style={{ color: '#00FF64' }}>+{globalStats.totalGained}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ color: '#FF3C50' }}>-{globalStats.totalLost}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ color: globalStats.netPoints >= 0 ? '#38D9F5' : '#FF3C50' }}>
              NET {globalStats.netPoints >= 0 ? '+' : ''}{globalStats.netPoints}
            </span>
          </div>
        </HudPanel>
      )}
    </div>
  );

  const renderBattlePanel = () => {
    if (!activeCombo) return (
      <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: "'Press Start 2P', monospace", fontSize: 8, lineHeight: 2 }}>
        SELECT A COMBO<br/>FROM ROSTER
      </div>
    );
    return (
      <div style={{ padding: '16px 14px' }}>
        {/* Combo header */}
        <HudPanel color="#38D9F5" style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#38D9F5', textShadow: '0 0 8px #38D9F5', marginBottom: 10, lineHeight: 1.6 }}>
            {activeCombo.name}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {activeCombo.blade   && <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, padding:'4px 8px', background:'rgba(56,217,245,0.08)', border:'1px solid #38D9F533', color:'#38D9F5', borderRadius:2 }}>{activeCombo.blade}</span>}
            {activeCombo.ratchet && <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, padding:'4px 8px', background:'rgba(255,149,0,0.08)',  border:'1px solid #FF950033',  color:'#FF9500', borderRadius:2 }}>{activeCombo.ratchet}</span>}
            {activeCombo.bit     && <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, padding:'4px 8px', background:'rgba(201,127,255,0.08)', border:'1px solid #C97FFF33', color:'#C97FFF', borderRadius:2 }}>{activeCombo.bit}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <StatChip label="WIN%" value={activeStats.winRate} unit="%" color="#00FF64" />
            <StatChip label="WINS" value={activeStats.totalWins} color="#00FF64" />
            <StatChip label="LOSS" value={activeStats.totalLosses} color="#FF3C50" />
            <StatChip label="AVG PT" value={activeStats.avgWinScore} color="#38D9F5" />
          </div>
        </HudPanel>

        {/* Record panel */}
        <HudPanel color="#FF3B5C" title="RECORD RESULT" style={{ marginBottom: 14 }}>
          {FINISH_TYPES.map(ft => (
            <FinishRow key={ft.key} finishType={ft} stat={activeCombo.stats[ft.key]} onRecord={recordResult} />
          ))}
        </HudPanel>

        {undoStack.length > 0 && (
          <button onClick={undo} style={{
            width: '100%', padding: '12px', border: '1px solid #FF950044',
            background: 'rgba(255,149,0,0.06)', color: '#FF9500',
            fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: 'pointer',
            borderRadius: 4, letterSpacing: 1,
            WebkitTapHighlightColor: 'transparent',
          }}>↩ UNDO LAST</button>
        )}
      </div>
    );
  };

  const renderStatsPanel = () => {
    if (!activeCombo) return null;
    return (
      <div style={{ padding: '16px 14px' }}>
        <HudPanel color="#C97FFF" title="SCORE BREAKDOWN" style={{ marginBottom: 14 }}>
          {FINISH_TYPES.map(ft => {
            const s = activeCombo.stats[ft.key];
            const gained = s.wins * ft.points;
            const lost = s.losses * ft.points;
            return (
              <div key={ft.key} style={{ marginBottom: 12, padding: '10px 10px', background: `${ft.color}08`, border: `1px solid ${ft.color}22`, borderRadius: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: ft.color }}>{ft.icon} {ft.label}</span>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'rgba(255,255,255,0.3)' }}>{ft.points}PT</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, fontFamily: "'Press Start 2P', monospace" }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#00FF64' }}>{s.wins}</div>
                    <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>WIN</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#FF3C50' }}>{s.losses}</div>
                    <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>LOSS</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#00FF64' }}>+{gained}</div>
                    <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>GAINED</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#FF3C50' }}>-{lost}</div>
                    <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>LOST</div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Total row */}
          <div style={{ padding: '12px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, fontFamily: "'Press Start 2P', monospace" }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#00FF64' }}>{activeStats.totalWins}</div>
                <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>WINS</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#FF3C50' }}>{activeStats.totalLosses}</div>
                <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>LOSSES</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#00FF64' }}>+{activeStats.totalGained}</div>
                <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>TOTAL+</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#FF3C50' }}>-{activeStats.totalLost}</div>
                <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>TOTAL-</div>
              </div>
            </div>
          </div>

          {/* Formulas */}
          {activeStats.totalBattles > 0 && (
            <div style={{ padding: '10px 12px', background: 'rgba(56,217,245,0.04)', border: '1px solid rgba(56,217,245,0.1)', borderRadius: 4 }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: '#38D9F5', marginBottom: 8 }}>FORMULAS</div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'rgba(255,255,255,0.4)', lineHeight: 2.2 }}>
                AVG WIN = {activeStats.totalGained}/{activeStats.totalWins} = <span style={{ color: '#38D9F5' }}>{activeStats.avgWinScore.toFixed(3)}</span>
                <br />
                NET/BTL = {activeStats.netPoints}/{activeStats.totalBattles} = <span style={{ color: '#C97FFF' }}>{activeStats.avgNetPerBattle.toFixed(3)}</span>
              </div>
            </div>
          )}
        </HudPanel>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#080814',
      backgroundImage: 'radial-gradient(ellipse at 20% 10%, rgba(56,217,245,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(201,127,255,0.07) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(30,30,80,0.5) 0%, transparent 70%)',
      color: '#E8F4FF',
      paddingBottom: 72,
      overflowX: 'hidden',
    }}>

      {/* Scanline overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 300, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      }} />

      {/* Notification flash */}
      {notification && (
        <div style={{
          position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
          zIndex: 400, padding: '8px 20px',
          background: `${notification.color}22`, border: `1px solid ${notification.color}`,
          borderRadius: 4, boxShadow: `0 0 20px ${notification.color}66`,
          fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: notification.color,
          textShadow: `0 0 8px ${notification.color}`,
          animation: 'fadeInOut 1.2s ease',
        }}>{notification.msg}</div>
      )}

      {/* ═══ HEADER ═══ */}
      <header style={{
        padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(56,217,245,0.12)',
        background: 'rgba(8,8,20,0.92)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 8, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(circle, rgba(56,217,245,0.15) 0%, transparent 70%)',
            boxShadow: '0 0 20px rgba(56,217,245,0.35)',
            flexShrink: 0,
          }}>
            <img
              src="/icon.png"
              alt="Bey Tracker"
              style={{
                width: 52, height: 52, objectFit: 'contain',
                filter: 'brightness(1.4) saturate(1.3) contrast(1.1) drop-shadow(0 0 6px rgba(56,217,245,0.7))',
                mixBlendMode: 'screen',
              }}
            />
          </div>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#38D9F5', textShadow: '0 0 10px #38D9F5, 0 0 20px rgba(56,217,245,0.4)', letterSpacing: 1 }}>BEY TRACKER</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: 'rgba(200,230,255,0.35)', letterSpacing: 1, marginTop: 4 }}>BEYBLADE X STATS</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowHelp(true)} style={{
            width: 38, height: 38, borderRadius: 4, border: '1px solid rgba(56,217,245,0.15)',
            background: 'rgba(56,217,245,0.05)', color: 'rgba(200,235,255,0.55)',
            fontFamily: "'Press Start 2P', monospace", fontSize: 11,
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}>?</button>
          <button onClick={() => setShowAdd(true)} style={{
            padding: '10px 14px', borderRadius: 4, border: '1px solid rgba(56,217,245,0.35)',
            background: 'rgba(56,217,245,0.1)', color: '#38D9F5',
            fontFamily: "'Press Start 2P', monospace", fontSize: 7,
            cursor: 'pointer', letterSpacing: 0.5,
            textShadow: '0 0 8px #38D9F5',
            boxShadow: '0 0 14px rgba(56,217,245,0.2)',
            WebkitTapHighlightColor: 'transparent',
          }}>+ NEW</button>
        </div>
      </header>

      {/* ═══ CONTENT ═══ */}
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {tab === 'combos' && renderCombosPanel()}
        {tab === 'battle' && renderBattlePanel()}
        {tab === 'stats'  && renderStatsPanel()}
      </div>

      {/* ═══ BOTTOM TAB BAR ═══ */}
      <TabBar tab={tab} setTab={setTab} hasCombos={combos.length > 0} />

      {/* ═══ HELP MODAL ═══ */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* ═══ ADD COMBO MODAL ═══ */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={() => setShowAdd(false)} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }} />
          <div style={{
            position: 'relative', zIndex: 1, width: '100%', maxWidth: 480,
            background: '#07070c', borderRadius: '12px 12px 0 0',
            border: '1px solid rgba(56,217,245,0.15)',
            borderBottom: 'none',
            padding: '28px 20px 40px',
            boxShadow: '0 -8px 40px rgba(56,217,245,0.1)',
          }}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 24px' }} />
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#38D9F5', textShadow: '0 0 8px #38D9F5', marginBottom: 6 }}>NEW COMBO</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: 'rgba(255,255,255,0.3)', marginBottom: 24, letterSpacing: 1 }}>
              BLADE · RATCHET · BIT
            </div>

            {[
              { key: 'name',    label: 'COMBO NAME', placeholder: 'e.g. Dran Sword 3-60F', required: true },
              { key: 'blade',   label: 'BLADE',      placeholder: 'e.g. Dran Sword' },
              { key: 'ratchet', label: 'RATCHET',    placeholder: 'e.g. 3-60' },
              { key: 'bit',     label: 'BIT',        placeholder: 'e.g. Flat' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>
                  {field.label}{field.required && <span style={{ color: '#FF3C50' }}> *</span>}
                </label>
                <input
                  value={newCombo[field.key]}
                  onChange={e => setNewCombo(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 4,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(56,217,245,0.15)',
                    color: '#F1F5F9', fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#38D9F5'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(56,217,245,0.15)'}
                />
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowAdd(false)} style={{
                flex: 1, padding: '14px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent', color: 'rgba(255,255,255,0.4)',
                fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}>CANCEL</button>
              <button onClick={addCombo} disabled={!newCombo.name.trim()} style={{
                flex: 2, padding: '14px', borderRadius: 4, border: 'none',
                background: newCombo.name.trim()
                  ? 'linear-gradient(135deg, #38D9F5, #C97FFF)'
                  : 'rgba(255,255,255,0.05)',
                color: newCombo.name.trim() ? '#000' : 'rgba(255,255,255,0.2)',
                fontFamily: "'Press Start 2P', monospace", fontSize: 8, fontWeight: 700,
                cursor: newCombo.name.trim() ? 'pointer' : 'default',
                letterSpacing: 1, transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}>CREATE ⚡</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Rajdhani:wght@700&family=Space+Mono&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { background:#080814; overscroll-behavior:none; }
        input::placeholder { color:rgba(180,220,255,0.2); font-size:8px; }
        ::-webkit-scrollbar { width:2px; }
        ::-webkit-scrollbar-thumb { background:rgba(56,217,245,0.25); }
        @keyframes fadeInOut {
          0%   { opacity:0; transform:translateX(-50%) translateY(-6px); }
          15%  { opacity:1; transform:translateX(-50%) translateY(0); }
          75%  { opacity:1; }
          100% { opacity:0; transform:translateX(-50%) translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

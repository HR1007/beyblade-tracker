import { useState, useCallback, useEffect, useRef, createContext, useContext } from "react";

// ── Translations ──────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    appSubtitle: 'BEYBLADE X STATS',
    btnNew: '+ NEW',
    tabRoster: 'ROSTER', tabBattle: 'BATTLE', tabStats: 'STATS',
    panelRoster: 'COMBO ROSTER', panelGlobal: 'GLOBAL STATS',
    panelRecord: 'RECORD RESULT', panelBreakdown: 'SCORE BREAKDOWN',
    noCombos: ['NO COMBOS', 'REGISTERED'],
    selectCombo: ['SELECT A COMBO', 'FROM ROSTER'],
    winRate: 'WIN RATE', battles: 'BATTLES', avgWinPt: 'AVG WIN PT', netPtBtl: 'NET PT/BTL',
    winPct: 'WIN%', wins: 'WINS', loss: 'LOSS', avgPt: 'AVG PT',
    btnWin: '▲ WIN', btnLoss: '▼ LOSS', btnUndo: '↩ UNDO LAST',
    formulas: 'FORMULAS',
    gained: 'GAINED', lost: 'LOST', totalPlus: 'TOTAL+', totalMinus: 'TOTAL-',
    unnamed: 'UNNAMED', btls: 'BTLS', avg: 'AVG',
    modalTitle: 'NEW COMBO', modalSub: 'BLADE · RATCHET · BIT',
    fieldName: 'COMBO NAME', fieldBlade: 'BLADE', fieldRatchet: 'RATCHET', fieldBit: 'BIT',
    placeholderName: 'e.g. Dran Sword 3-60F', placeholderBlade: 'e.g. Dran Sword',
    placeholderRatchet: 'e.g. 3-60', placeholderBit: 'e.g. Flat',
    btnCancel: 'CANCEL', btnCreate: 'CREATE ⚡',
    deleteTitle: 'DELETE COMBO?',
    deleteMsg: 'All battle records for this combo will be permanently lost.',
    btnDeleteConfirm: '🗑 DELETE', btnDeleteCancel: 'KEEP IT',
    btnCopy: 'COPY', btnEdit: 'EDIT', btnShare: 'SHARE', btnExportCSV: 'CSV',
    modalEditTitle: 'EDIT COMBO', btnSave: 'SAVE ✓',
    notifWin: 'WIN!', notifLoss: 'LOSS', notifUndo: 'UNDONE', notifCopy: 'COPIED!', notifSaved: 'SAVED!', notifShared: 'COPIED!', notifExported: 'EXPORTED!',
    helpPrev: '◀ PREV', helpNext: 'NEXT ▶', helpStart: 'START ⚡',
    net: 'NET',
    spinFinish: 'SPIN FINISH', overFinish: 'OVER FINISH',
    burstFinish: 'BURST FINISH', xtremeFinish: 'XTREME FINISH',
    panelPerf: 'BATTLE PERFORMANCE',
    panelGlossary: 'STAT GLOSSARY',
    perfLabel: 'NET/BTL RATING',
    perfDominantTitle: 'DOMINANT',
    perfDominantDesc: 'This combo has overwhelming control. It is your primary point scorer — keep it in your main rotation.',
    perfBalancedTitle: 'TRADE WAR',
    perfBalancedDesc: 'Win/loss rates and point gains are in equilibrium. Solid but not decisive — consider adjusting the Bit or Ratchet for an edge.',
    perfLosingTitle: 'LOSING GROUND',
    perfLosingDesc: 'This combo is bleeding points under its current setup. Try swapping the Ratchet or Bit to improve performance.',
    glossaryItems: [
      { term: 'WIN RATE',     formula: 'Wins ÷ Total Battles × 100%',        desc: 'The percentage of battles this combo has won.' },
      { term: 'AVG WIN PT',   formula: 'Points Gained in Wins ÷ Wins',        desc: 'Average points earned per victory. Higher = more decisive wins.' },
      { term: 'NET POINTS',   formula: 'Total Gained − Total Lost',            desc: 'Overall point balance across all battles.' },
      { term: 'NET PT/BTL',   formula: 'Net Points ÷ Total Battles',           desc: 'Average net points per battle. The key performance index.' },
      { term: 'SPIN FINISH',  formula: '1 PT',                                 desc: 'Opponent\'s Beyblade stops spinning inside the stadium.' },
      { term: 'OVER FINISH',  formula: '2 PT',                                 desc: 'Opponent\'s Beyblade is knocked out of the stadium.' },
      { term: 'BURST FINISH', formula: '2 PT',                                 desc: 'Opponent\'s Beyblade bursts apart during battle.' },
      { term: 'XTREME FINISH',formula: '3 PT',                                 desc: 'Opponent\'s Beyblade hits the Xtreme Line and exits.' },
    ],
    help: [
      { icon: '🎮', title: 'ADD A COMBO',    desc: 'Tap [ + NEW ] to register your combo. Enter the Blade, Ratchet, and Bit parts.' },
      { icon: '⚔️', title: 'RECORD BATTLES', desc: 'Go to BATTLE tab. After each match, tap WIN or LOSS under the finish type.' },
      { icon: '🌀', title: 'SPIN FINISH',    desc: 'Opponent stops spinning. Worth 1 point.' },
      { icon: '💥', title: 'OVER FINISH',    desc: 'Opponent flies out of the stadium. Worth 2 points.' },
      { icon: '💢', title: 'BURST FINISH',   desc: "Opponent's Beyblade bursts apart. Worth 2 points." },
      { icon: '⚡', title: 'XTREME FINISH',  desc: 'Opponent hits the Xtreme Line and exits. Worth 3 points.' },
      { icon: '📊', title: 'VIEW STATS',     desc: 'The STATS tab shows your score breakdown, win rate, and average points per battle.' },
      { icon: '↩', title: 'UNDO',            desc: 'Made a mistake? Tap UNDO LAST in the BATTLE tab to reverse the last record.' },
    ],
  },
  zh: {
    appSubtitle: '戰鬥陀螺 X 對戰數據',
    btnNew: '+ 新增',
    tabRoster: '名單', tabBattle: '對戰', tabStats: '數據',
    panelRoster: '組合名單', panelGlobal: '整體數據',
    panelRecord: '記錄結果', panelBreakdown: '分數明細',
    noCombos: ['尚無組合', '請點新增'],
    selectCombo: ['請先選擇', '一個組合'],
    winRate: '勝率', battles: '場次', avgWinPt: '平均勝分', netPtBtl: '每場淨分',
    winPct: '勝率%', wins: '勝場', loss: '敗場', avgPt: '平均分',
    btnWin: '▲ 勝', btnLoss: '▼ 敗', btnUndo: '↩ 取消上一筆',
    formulas: '計算公式',
    gained: '獲得', lost: '失去', totalPlus: '總得分', totalMinus: '總失分',
    unnamed: '未命名', btls: '場', avg: '平均',
    modalTitle: '新增組合', modalSub: '刀刃 · 棘輪 · 尖端',
    fieldName: '組合名稱', fieldBlade: '刀刃', fieldRatchet: '棘輪', fieldBit: '尖端',
    placeholderName: '例：Dran Sword 3-60F', placeholderBlade: '例：Dran Sword',
    placeholderRatchet: '例：3-60', placeholderBit: '例：Flat',
    btnCancel: '取消', btnCreate: '建立 ⚡',
    deleteTitle: '確定刪除組合？',
    deleteMsg: '這個組合的所有對戰紀錄將永久消失。',
    btnDeleteConfirm: '🗑 刪除', btnDeleteCancel: '保留',
    btnCopy: '複製', btnEdit: '編輯', btnShare: '分享', btnExportCSV: 'CSV',
    modalEditTitle: '編輯組合', btnSave: '儲存 ✓',
    notifWin: '勝利！', notifLoss: '落敗', notifUndo: '已撤銷', notifCopy: '已複製！', notifSaved: '已儲存！', notifShared: '已複製！', notifExported: '已匯出！',
    helpPrev: '◀ 上一頁', helpNext: '下一頁 ▶', helpStart: '開始 ⚡',
    net: '淨分',
    spinFinish: '轉停勝利', overFinish: '擊飛勝利',
    burstFinish: '爆裂勝利', xtremeFinish: '極限勝利',
    panelPerf: '戰鬥表現評價',
    panelGlossary: '數據名詞解釋',
    perfLabel: '每場淨得分評級',
    perfDominantTitle: '強力壓制',
    perfDominantDesc: '該陀螺具有強大的壓制力，是您的主力得分手。建議在重要對局中優先使用此組合。',
    perfBalancedTitle: '貿易戰',
    perfBalancedDesc: '勝負機率與分數獲取處於平衡，此陀螺表現中規中矩，沒有絕對的勝率優勢，但也不至於被完全克制。',
    perfLosingTitle: '賠分警示',
    perfLosingDesc: '該陀螺在目前戰術體系中持續「賠分」，建議調整零件搭配（例如更換 Ratchet 或 Bit）以提升整體表現。',
    glossaryItems: [
      { term: '勝率',       formula: '勝場 ÷ 總場數 × 100%',          desc: '此組合在所有對戰中獲勝的百分比。' },
      { term: '平均勝分',   formula: '勝利總得分 ÷ 勝場數',            desc: '每次勝利平均獲得的點數，數字越高代表勝利越具決定性。' },
      { term: '淨得分',     formula: '總獲得分 − 總失去分',            desc: '所有對戰的點數總結算，正數表示整體獲利。' },
      { term: '每場淨分',   formula: '淨得分 ÷ 總場數',                desc: '每場對戰平均淨得幾分，是衡量此陀螺實力的核心指標。' },
      { term: '轉停勝利',   formula: '1 分',                           desc: '對手陀螺在場內停止旋轉。' },
      { term: '擊飛勝利',   formula: '2 分',                           desc: '對手陀螺被擊飛出場地。' },
      { term: '爆裂勝利',   formula: '2 分',                           desc: '對手陀螺在對戰中爆裂分解。' },
      { term: '極限勝利',   formula: '3 分',                           desc: '對手陀螺碰觸極限線後飛出場地，得分最高。' },
    ],
    help: [
      { icon: '🎮', title: '新增組合', desc: '點擊 [ + 新增 ] 登錄你的陀螺組合，輸入刀刃、棘輪、尖端零件名稱。' },
      { icon: '⚔️', title: '記錄對戰', desc: '切換到「對戰」頁籤，每場結束後點擊對應完成方式的「勝」或「敗」。' },
      { icon: '🌀', title: '轉停勝利', desc: '對手停止旋轉，得 1 分。' },
      { icon: '💥', title: '擊飛勝利', desc: '對手飛出場地，得 2 分。' },
      { icon: '💢', title: '爆裂勝利', desc: '對手陀螺爆裂分解，得 2 分。' },
      { icon: '⚡', title: '極限勝利', desc: '對手碰觸極限線後飛出，得 3 分。' },
      { icon: '📊', title: '查看數據', desc: '「數據」頁籤顯示分數明細、勝率與每場平均得分。' },
      { icon: '↩', title: '撤銷',     desc: '記錄錯誤？在「對戰」頁籤點擊「取消上一筆」來撤銷最後一次記錄。' },
    ],
  },
};

const LangCtx = createContext(TRANSLATIONS.en);
const useLang = () => useContext(LangCtx);

// ── Data ──────────────────────────────────────────────────────
const FINISH_TYPES = [
  { key: 'spin',   labelKey: 'spinFinish',   points: 1, color: '#38D9F5', icon: '🌀', desc: '1 PT' },
  { key: 'over',   labelKey: 'overFinish',   points: 2, color: '#FFB340', icon: '💥', desc: '2 PT' },
  { key: 'burst',  labelKey: 'burstFinish',  points: 2, color: '#FF5C7A', icon: '💢', desc: '2 PT' },
  { key: 'xtreme', labelKey: 'xtremeFinish', points: 3, color: '#C97FFF', icon: '⚡', desc: '3 PT' },
];

const DEFAULT_STATS = () => ({
  spin: { wins: 0, losses: 0 }, over: { wins: 0, losses: 0 },
  burst: { wins: 0, losses: 0 }, xtreme: { wins: 0, losses: 0 },
});

const loadData = async () => {
  try { const r = await window['storage'].get('beyblade-combos'); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
};
const saveData = async (combos) => {
  try { await window['storage'].set('beyblade-combos', JSON.stringify(combos)); } catch(e) { console.error(e); }
};

function calcStats(stats) {
  let totalWins = 0, totalLosses = 0, totalGained = 0, totalLost = 0;
  FINISH_TYPES.forEach(ft => {
    const s = stats[ft.key];
    totalWins += s.wins; totalLosses += s.losses;
    totalGained += s.wins * ft.points; totalLost += s.losses * ft.points;
  });
  const totalBattles = totalWins + totalLosses;
  const winRate = totalBattles > 0 ? (totalWins / totalBattles * 100) : 0;
  const avgWinScore = totalWins > 0 ? (totalGained / totalWins) : 0;
  const netPoints = totalGained - totalLost;
  const avgNetPerBattle = totalBattles > 0 ? (netPoints / totalBattles) : 0;
  return { totalWins, totalLosses, totalBattles, totalGained, totalLost, winRate, avgWinScore, netPoints, avgNetPerBattle };
}

function getPerformanceTier(avgNetPerBattle) {
  if (avgNetPerBattle >= 0.8)  return { tier: 'dominant', color: '#00FF64', bar: '#00FF64', icon: '🔥' };
  if (avgNetPerBattle >= -0.3) return { tier: 'balanced', color: '#FFB340', bar: '#FFB340', icon: '⚖️' };
  return                               { tier: 'losing',   color: '#FF5C7A', bar: '#FF5C7A', icon: '📉' };
}

// ── Loading Screen ────────────────────────────────────────────
function LoadingScreen({ progress }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: '#080814',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'radial-gradient(ellipse at 20% 10%, rgba(56,217,245,0.1) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(201,127,255,0.1) 0%, transparent 55%)',
    }}>
      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)' }} />

      {/* Icon */}
      <div style={{
        position: 'relative', marginBottom: 36,
        width: 120, height: 120, borderRadius: 24, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(56,217,245,0.18) 0%, transparent 70%)',
        boxShadow: '0 0 50px rgba(56,217,245,0.45), 0 0 100px rgba(56,217,245,0.15)',
        animation: 'iconPulse 2s ease-in-out infinite',
      }}>
        <img src="/icon.png" alt="Bey Tracker" style={{
          width: 130, height: 130, objectFit: 'contain',
          filter: 'brightness(1.4) saturate(1.3) contrast(1.1) drop-shadow(0 0 12px rgba(56,217,245,0.9))',
          mixBlendMode: 'screen',
        }} />
      </div>

      {/* Title */}
      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: '#38D9F5',
        textShadow: '0 0 16px #38D9F5, 0 0 36px rgba(56,217,245,0.5)',
        letterSpacing: 2, marginBottom: 10,
      }}>BEY TRACKER</div>
      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 8,
        color: 'rgba(200,230,255,0.35)', letterSpacing: 2, marginBottom: 48,
      }}>BEYBLADE X STATS</div>

      {/* Progress bar */}
      <div style={{ width: '62%', maxWidth: 260, marginBottom: 14 }}>
        <div style={{
          height: 7, background: 'rgba(56,217,245,0.08)', borderRadius: 3,
          border: '1px solid rgba(56,217,245,0.2)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #38D9F5, #C97FFF)',
            boxShadow: '0 0 10px #38D9F5, 0 0 22px rgba(56,217,245,0.5)',
            borderRadius: 3, transition: 'width 0.15s ease',
          }} />
        </div>
      </div>
      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 8,
        color: 'rgba(56,217,245,0.55)', letterSpacing: 2,
      }}>LOADING... {Math.round(progress)}%</div>
    </div>
  );
}

// ── HUD Panel ─────────────────────────────────────────────────
function HudPanel({ children, color = '#38D9F5', style = {}, title }) {
  const c = color;
  const dim = 14, thick = 2;
  const cs = (top, right, bottom, left) => ({
    position: 'absolute', width: dim, height: dim,
    top: top ?? undefined, bottom: bottom ?? undefined,
    left: left ?? undefined, right: right ?? undefined,
    borderTop: top != null ? `${thick}px solid ${c}` : 'none',
    borderBottom: bottom != null ? `${thick}px solid ${c}` : 'none',
    borderLeft: left != null ? `${thick}px solid ${c}` : 'none',
    borderRight: right != null ? `${thick}px solid ${c}` : 'none',
  });
  return (
    <div style={{ position:'relative', background:'rgba(0,0,0,0.6)', border:`1px solid ${c}22`, borderRadius:4,
      padding: title ? '36px 16px 16px' : '16px', boxShadow:`0 0 20px ${c}10, inset 0 0 20px rgba(0,0,0,0.5)`, ...style }}>
      {title && (
        <div style={{ position:'absolute', top:-1, left:12, background:'#080814', padding:'0 8px',
          fontFamily:"'Press Start 2P', monospace", fontSize:9, color:c, letterSpacing:1, textShadow:`0 0 8px ${c}` }}>
          {title}
        </div>
      )}
      <div style={cs(0,undefined,undefined,0)} /><div style={cs(0,0,undefined,undefined)} />
      <div style={cs(undefined,undefined,0,0)} /><div style={cs(undefined,0,0,undefined)} />
      {children}
    </div>
  );
}

// ── Stat Chip ─────────────────────────────────────────────────
function StatChip({ label, value, color = '#38D9F5', unit = '' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:64 }}>
      <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:16, color,
        textShadow:`0 0 12px ${color}, 0 0 24px ${color}88`, lineHeight:1 }}>
        {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
        {unit && <span style={{ fontSize:10 }}>{unit}</span>}
      </div>
      <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8,
        color:'rgba(255,255,255,0.35)', letterSpacing:1, textAlign:'center' }}>{label}</div>
    </div>
  );
}

// ── Flash Button ──────────────────────────────────────────────
function FlashButton({ onClick, children, variant = 'win' }) {
  const [flash, setFlash] = useState(false);
  const isWin = variant === 'win';
  const col = isWin ? '#00FF64' : '#FF3C50';
  const handle = () => { setFlash(true); setTimeout(() => setFlash(false), 200); onClick(); };
  return (
    <button onClick={handle} style={{
      flex:1, padding:'16px 8px', borderRadius:4,
      border:`1px solid ${flash ? col : col + '44'}`,
      background: flash ? col + '35' : col + '08',
      color:col, cursor:'pointer',
      fontFamily:"'Press Start 2P', monospace", fontSize:11, letterSpacing:0.5,
      transition:'all 0.15s',
      textShadow: flash ? `0 0 8px ${col}` : 'none',
      boxShadow: flash ? `0 0 16px ${col}66` : 'none',
      WebkitTapHighlightColor:'transparent', userSelect:'none',
    }}>{children}</button>
  );
}

// ── Finish Row ────────────────────────────────────────────────
function FinishRow({ finishType: ft, stat, onRecord }) {
  const t = useLang();
  const total = stat.wins + stat.losses;
  const rate = total > 0 ? (stat.wins / total * 100) : 0;
  return (
    <div style={{ marginBottom:12, padding:'14px 12px', background:`${ft.color}08`, border:`1px solid ${ft.color}22`, borderRadius:4 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>{ft.icon}</span>
          <div>
            <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:9, color:ft.color, textShadow:`0 0 6px ${ft.color}`, letterSpacing:0.5 }}>{t[ft.labelKey]}</div>
            <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:'rgba(255,255,255,0.3)', marginTop:4 }}>{ft.desc}</div>
          </div>
        </div>
        <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8, color:'rgba(255,255,255,0.3)' }}>
          <span style={{ color:'#00FF64' }}>{stat.wins}W</span> / <span style={{ color:'#FF3C50' }}>{stat.losses}L</span>
        </div>
      </div>
      <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:2, overflow:'hidden', marginBottom:10 }}>
        <div style={{ height:'100%', width:`${rate}%`, background:ft.color, boxShadow:`0 0 6px ${ft.color}`, borderRadius:2, transition:'width 0.4s ease' }} />
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <FlashButton variant="win"  onClick={() => onRecord(ft.key, 'win')}>{t.btnWin}</FlashButton>
        <FlashButton variant="loss" onClick={() => onRecord(ft.key, 'loss')}>{t.btnLoss}</FlashButton>
      </div>
    </div>
  );
}

// ── Combo Card ────────────────────────────────────────────────
function ComboCard({ combo, isActive, onSelect, onDelete, onCopy, onEdit, onShare, onExport }) {
  const t = useLang();
  const stats = calcStats(combo.stats);
  const col = isActive ? '#38D9F5' : 'rgba(255,255,255,0.15)';
  return (
    <div onClick={onSelect} style={{
      padding:'14px 12px', borderRadius:4, cursor:'pointer', position:'relative',
      background: isActive ? 'rgba(56,217,245,0.06)' : 'rgba(255,255,255,0.02)',
      border:`1px solid ${isActive ? '#38D9F544' : 'rgba(255,255,255,0.06)'}`,
      boxShadow: isActive ? '0 0 16px #38D9F518' : 'none',
      transition:'all 0.2s', WebkitTapHighlightColor:'transparent',
    }}>
      {isActive && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'#38D9F5', boxShadow:'0 0 8px #38D9F5', borderRadius:'4px 0 0 4px' }} />}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8, paddingLeft: isActive ? 8 : 0 }}>
        <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:10, color:col, textShadow: isActive ? '0 0 6px #38D9F5' : 'none', letterSpacing:0.5, lineHeight:1.5, flex:1, paddingRight:8 }}>
          {combo.name || t.unnamed}
        </div>
        <div style={{ display:'flex', gap:2, alignItems:'center', flexShrink:0 }}>
          <button onClick={e => { e.stopPropagation(); onEdit(); }} title={t.btnEdit} style={{
            background:'transparent', border:'none', color:'rgba(255,179,64,0.4)', cursor:'pointer',
            fontSize:14, padding:'2px 5px', WebkitTapHighlightColor:'transparent',
            lineHeight:1, transition:'color 0.15s',
          }} onMouseEnter={e => e.currentTarget.style.color='#FFB340'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,179,64,0.4)'}>✎</button>
          <button onClick={e => { e.stopPropagation(); onCopy(); }} title={t.btnCopy} style={{
            background:'transparent', border:'none', color:'rgba(56,217,245,0.35)', cursor:'pointer',
            fontSize:14, padding:'2px 5px', WebkitTapHighlightColor:'transparent',
            lineHeight:1, transition:'color 0.15s',
          }} onMouseEnter={e => e.currentTarget.style.color='#38D9F5'} onMouseLeave={e => e.currentTarget.style.color='rgba(56,217,245,0.35)'}>⊕</button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{
            background:'transparent', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer',
            fontSize:13, padding:'2px 5px', WebkitTapHighlightColor:'transparent',
          }}>✕</button>
        </div>
      </div>
      <div style={{ display:'flex', gap:12, fontFamily:"'Press Start 2P', monospace", fontSize:8, paddingLeft: isActive ? 8 : 0, marginBottom:10 }}>
        <span style={{ color:'#00FF64' }}>{stats.winRate.toFixed(0)}% {t.tabBattle === '對戰' ? '勝' : 'WIN'}</span>
        <span style={{ color:'rgba(255,255,255,0.3)' }}>{stats.totalBattles} {t.btls}</span>
        <span style={{ color:'#38D9F5' }}>{stats.avgWinScore.toFixed(1)} {t.avg}</span>
      </div>
      <div style={{ display:'flex', gap:6, paddingLeft: isActive ? 8 : 0 }}>
        <button onClick={e => { e.stopPropagation(); onShare(); }} style={{
          flex:1, padding:'7px 4px', borderRadius:3,
          border:'1px solid rgba(56,217,245,0.2)', background:'rgba(56,217,245,0.04)',
          color:'rgba(56,217,245,0.7)', cursor:'pointer',
          fontFamily:"'Press Start 2P', monospace", fontSize:7, letterSpacing:0.5,
          WebkitTapHighlightColor:'transparent', transition:'all 0.15s',
        }}>📤 {t.btnShare}</button>
        <button onClick={e => { e.stopPropagation(); onExport(); }} style={{
          flex:1, padding:'7px 4px', borderRadius:3,
          border:'1px solid rgba(201,127,255,0.2)', background:'rgba(201,127,255,0.04)',
          color:'rgba(201,127,255,0.7)', cursor:'pointer',
          fontFamily:"'Press Start 2P', monospace", fontSize:7, letterSpacing:0.5,
          WebkitTapHighlightColor:'transparent', transition:'all 0.15s',
        }}>📥 {t.btnExportCSV}</button>
      </div>
    </div>
  );
}

// ── Help Modal ────────────────────────────────────────────────
function HelpModal({ onClose }) {
  const t = useLang();
  const [step, setStep] = useState(0);
  const steps = t.help;
  const s = steps[step];
  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' }} />
      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:480, background:'#07070c',
        borderRadius:'12px 12px 0 0', border:'1px solid rgba(56,217,245,0.2)', borderBottom:'none',
        padding:'28px 20px 40px', boxShadow:'0 -8px 40px rgba(56,217,245,0.12)' }}>
        <div style={{ width:36, height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, margin:'0 auto 24px' }} />
        <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:24 }}>
          {steps.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              width: i === step ? 20 : 6, height:6, borderRadius:3, cursor:'pointer',
              background: i === step ? '#38D9F5' : 'rgba(255,255,255,0.15)',
              boxShadow: i === step ? '0 0 6px #38D9F5' : 'none', transition:'all 0.3s',
            }} />
          ))}
        </div>
        <div style={{ textAlign:'center', minHeight:140, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 8px' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>{s.icon}</div>
          <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:10, color:'#38D9F5', textShadow:'0 0 8px #38D9F5', marginBottom:16, letterSpacing:1 }}>{s.title}</div>
          <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8, color:'rgba(255,255,255,0.5)', lineHeight:2.2, maxWidth:320 }}>{s.desc}</div>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:28 }}>
          <button onClick={() => setStep(p => Math.max(0, p-1))} disabled={step === 0} style={{
            flex:1, padding:'14px', borderRadius:4, border:'1px solid rgba(255,255,255,0.08)',
            background:'transparent', color: step===0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
            fontFamily:"'Press Start 2P', monospace", fontSize:9, cursor: step===0 ? 'default' : 'pointer',
            WebkitTapHighlightColor:'transparent',
          }}>{t.helpPrev}</button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(p => p+1)} style={{
              flex:2, padding:'14px', borderRadius:4, border:'none',
              background:'linear-gradient(135deg, #38D9F5, #C97FFF)', color:'#000',
              fontFamily:"'Press Start 2P', monospace", fontSize:9, cursor:'pointer',
              WebkitTapHighlightColor:'transparent',
            }}>{t.helpNext}</button>
          ) : (
            <button onClick={onClose} style={{
              flex:2, padding:'14px', borderRadius:4, border:'none',
              background:'linear-gradient(135deg, #00FF64, #38D9F5)', color:'#000',
              fontFamily:"'Press Start 2P', monospace", fontSize:9, cursor:'pointer',
              WebkitTapHighlightColor:'transparent',
            }}>{t.helpStart}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab Bar ───────────────────────────────────────────────────
function TabBar({ tab, setTab, hasCombos }) {
  const t = useLang();
  const tabs = [
    { key:'combos', label: t.tabRoster, icon:'🎮' },
    { key:'battle', label: t.tabBattle, icon:'⚔️', disabled: !hasCombos },
    { key:'stats',  label: t.tabStats,  icon:'📊', disabled: !hasCombos },
  ];
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, display:'flex',
      borderTop:'1px solid rgba(56,217,245,0.18)', background:'rgba(8,8,20,0.97)',
      backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)' }}>
      {tabs.map(tt => {
        const active = tab === tt.key;
        return (
          <button key={tt.key} onClick={() => !tt.disabled && setTab(tt.key)} style={{
            flex:1, padding:'13px 4px 11px', background:'transparent', border:'none',
            cursor: tt.disabled ? 'default' : 'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', gap:5,
            opacity: tt.disabled ? 0.3 : 1, WebkitTapHighlightColor:'transparent',
          }}>
            <span style={{ fontSize:20 }}>{tt.icon}</span>
            <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8,
              color: active ? '#38D9F5' : 'rgba(180,220,255,0.35)',
              textShadow: active ? '0 0 8px #38D9F5' : 'none' }}>{tt.label}</span>
            {active && <div style={{ width:24, height:2, background:'#38D9F5', boxShadow:'0 0 6px #38D9F5', borderRadius:1 }} />}
          </button>
        );
      })}
    </nav>
  );
}

// ── Language Toggle Button ────────────────────────────────────
function LangToggle({ lang, setLang }) {
  return (
    <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} style={{
      padding:'0 12px', height:40, borderRadius:4,
      border:'1px solid rgba(56,217,245,0.2)',
      background:'rgba(56,217,245,0.05)',
      cursor:'pointer', WebkitTapHighlightColor:'transparent',
      display:'flex', alignItems:'center', gap:6,
    }}>
      <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8,
        color: lang === 'zh' ? '#38D9F5' : 'rgba(180,220,255,0.35)',
        textShadow: lang === 'zh' ? '0 0 6px #38D9F5' : 'none', transition:'all 0.2s' }}>中</span>
      <span style={{ color:'rgba(255,255,255,0.15)', fontSize:11 }}>|</span>
      <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8,
        color: lang === 'en' ? '#38D9F5' : 'rgba(180,220,255,0.35)',
        textShadow: lang === 'en' ? '0 0 6px #38D9F5' : 'none', transition:'all 0.2s' }}>EN</span>
    </button>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [combos, setCombos] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newCombo, setNewCombo] = useState({ name:'', blade:'', ratchet:'', bit:'' });
  const [loaded, setLoaded] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [tab, setTab] = useState('combos');
  const [notification, setNotification] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem('bey-lang') || 'en');
  const [showLoading, setShowLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [editComboIdx, setEditComboIdx] = useState(null);
  const [editForm, setEditForm] = useState({ name:'', blade:'', ratchet:'', bit:'' });
  const notifTimer = useRef(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => { localStorage.setItem('bey-lang', lang); }, [lang]);

  useEffect(() => {
    const startTime = Date.now();
    let prog = 0;
    const tick = setInterval(() => {
      prog = Math.min(prog + Math.random() * 2.5 + 1.2, 88);
      setLoadingProgress(prog);
    }, 100);
    loadData().then(data => {
      clearInterval(tick);
      setCombos(data);
      setLoaded(true);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 4000 - elapsed);
      setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => setShowLoading(false), 450);
      }, remaining);
    });
  }, []);

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
    setNewCombo({ name:'', blade:'', ratchet:'', bit:'' });
    setTab('battle');
  };

  const deleteCombo = (idx) => {
    setCombos(prev => prev.filter((_,i) => i !== idx));
    if (activeIdx >= combos.length - 1) setActiveIdx(Math.max(0, combos.length - 2));
  };

  const openEdit = (idx) => {
    const src = combos[idx];
    setEditForm({ name: src.name, blade: src.blade || '', ratchet: src.ratchet || '', bit: src.bit || '' });
    setEditComboIdx(idx);
  };

  const saveEdit = () => {
    if (!editForm.name.trim()) return;
    setCombos(prev => prev.map((c, i) =>
      i === editComboIdx ? { ...c, ...editForm } : c
    ));
    setEditComboIdx(null);
    showNotif(t.notifSaved, '#00FF64');
  };

  const shareCombo = (idx) => {
    const c = combos[idx];
    const s = calcStats(c.stats);
    const lines = [
      `⚡ ${c.name}`,
      [c.blade, c.ratchet, c.bit].filter(Boolean).join(' / '),
      '',
      `📊 ${lang === 'zh' ? '數據' : 'STATS'}`,
      `${t.winRate}: ${s.winRate.toFixed(1)}%`,
      `${t.battles}: ${s.totalBattles} (${s.totalWins}W / ${s.totalLosses}L)`,
      `${t.avgWinPt}: ${s.avgWinScore.toFixed(2)}`,
      `${t.netPtBtl}: ${s.avgNetPerBattle.toFixed(2)}`,
      '',
      ...FINISH_TYPES.map(ft => `${ft.icon} ${t[ft.labelKey]}: ${c.stats[ft.key].wins}W / ${c.stats[ft.key].losses}L`),
      '',
      'Bey Tracker — https://github.com/HR1007/beyblade-tracker',
    ];
    const text = lines.join('\n');
    if (navigator.share) {
      navigator.share({ title: c.name, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => showNotif(t.notifShared, '#38D9F5')).catch(() => {});
    }
  };

  const exportCSV = (idx) => {
    const c = combos[idx];
    const s = calcStats(c.stats);
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const row = (...cells) => cells.map(esc).join(',');
    const rows = [
      row('Combo', 'Blade', 'Ratchet', 'Bit'),
      row(c.name, c.blade || '', c.ratchet || '', c.bit || ''),
      '',
      row('Finish', 'Points', 'Wins', 'Losses', 'Win Rate%', 'Pts Gained', 'Pts Lost'),
      ...FINISH_TYPES.map(ft => {
        const fs = c.stats[ft.key];
        const tot = fs.wins + fs.losses;
        return row(ft.key.toUpperCase(), ft.points, fs.wins, fs.losses,
          tot > 0 ? (fs.wins / tot * 100).toFixed(1) : '0.0',
          fs.wins * ft.points, fs.losses * ft.points);
      }),
      '',
      row('TOTAL', '', s.totalWins, s.totalLosses, s.winRate.toFixed(1), s.totalGained, s.totalLost),
      '',
      row('Win Rate%', 'Avg Win Pt', 'Net Points', 'Net Pt/Btl'),
      row(s.winRate.toFixed(2), s.avgWinScore.toFixed(2), s.netPoints, s.avgNetPerBattle.toFixed(2)),
    ];
    const csv = '﻿' + rows.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${c.name || 'combo'}-stats.csv`; a.click();
    URL.revokeObjectURL(url);
    showNotif(t.notifExported, '#C97FFF');
  };

  const duplicateCombo = (idx) => {
    const src = combos[idx];
    const suffix = lang === 'zh' ? ' (複製)' : ' (COPY)';
    const copy = {
      id: Date.now(),
      name: src.name + suffix,
      blade: src.blade,
      ratchet: src.ratchet,
      bit: src.bit,
      stats: DEFAULT_STATS(),
    };
    setCombos(prev => [...prev, copy]);
    setActiveIdx(combos.length);
    showNotif(t.notifCopy, '#38D9F5');
  };

  const recordResult = useCallback((finishKey, result) => {
    setUndoStack(prev => [...prev.slice(-19), { idx: activeIdx, finishKey, result }]);
    setCombos(prev => prev.map((c, i) => {
      if (i !== activeIdx) return c;
      const ns = { ...c.stats };
      ns[finishKey] = { ...ns[finishKey] };
      if (result === 'win') { ns[finishKey].wins += 1; showNotif(t.notifWin, '#00FF64'); }
      else { ns[finishKey].losses += 1; showNotif(t.notifLoss, '#FF3C50'); }
      return { ...c, stats: ns };
    }));
  }, [activeIdx, t]);

  const undo = () => {
    if (!undoStack.length) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setCombos(prev => prev.map((c, i) => {
      if (i !== last.idx) return c;
      const ns = { ...c.stats };
      ns[last.finishKey] = { ...ns[last.finishKey] };
      if (last.result === 'win') ns[last.finishKey].wins = Math.max(0, ns[last.finishKey].wins - 1);
      else ns[last.finishKey].losses = Math.max(0, ns[last.finishKey].losses - 1);
      return { ...c, stats: ns };
    }));
    showNotif(t.notifUndo, '#FF9500');
  };

  const globalStats = (() => {
    const merged = DEFAULT_STATS();
    combos.forEach(c => FINISH_TYPES.forEach(ft => {
      merged[ft.key].wins += c.stats[ft.key].wins;
      merged[ft.key].losses += c.stats[ft.key].losses;
    }));
    return calcStats(merged);
  })();

  const renderCombosPanel = () => (
    <div style={{ padding:'16px 14px' }}>
      <HudPanel color="#38D9F5" title={t.panelRoster} style={{ marginBottom:14 }}>
        {combos.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
            <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:10, color:'rgba(255,255,255,0.4)', lineHeight:2.2 }}>
              {t.noCombos[0]}<br/>{t.noCombos[1]}
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {combos.map((c,i) => (
              <ComboCard key={c.id} combo={c} isActive={i === activeIdx}
                onSelect={() => { setActiveIdx(i); setTab('battle'); }}
                onDelete={() => setConfirmDelete(i)}
                onCopy={() => duplicateCombo(i)}
                onEdit={() => openEdit(i)}
                onShare={() => shareCombo(i)}
                onExport={() => exportCSV(i)} />
            ))}
          </div>
        )}
      </HudPanel>

      {combos.length > 0 && (
        <HudPanel color="#C97FFF" title={t.panelGlobal} style={{ marginBottom:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, padding:'4px 0' }}>
            <StatChip label={t.winRate}   value={globalStats.winRate}        unit="%" color="#00FF64" />
            <StatChip label={t.battles}   value={globalStats.totalBattles}        color="#FFB340" />
            <StatChip label={t.avgWinPt}  value={globalStats.avgWinScore}         color="#38D9F5" />
            <StatChip label={t.netPtBtl}  value={globalStats.avgNetPerBattle}     color="#C97FFF" />
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:14, fontFamily:"'Press Start 2P', monospace", fontSize:8 }}>
            <span style={{ color:'#00FF64' }}>+{globalStats.totalGained}</span>
            <span style={{ color:'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ color:'#FF3C50' }}>-{globalStats.totalLost}</span>
            <span style={{ color:'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ color: globalStats.netPoints >= 0 ? '#38D9F5' : '#FF3C50' }}>
              {t.net} {globalStats.netPoints >= 0 ? '+' : ''}{globalStats.netPoints}
            </span>
          </div>
        </HudPanel>
      )}
    </div>
  );

  const renderBattlePanel = () => {
    if (!activeCombo) return (
      <div style={{ padding:24, textAlign:'center', color:'rgba(255,255,255,0.3)', fontFamily:"'Press Start 2P', monospace", fontSize:10, lineHeight:2 }}>
        {t.selectCombo[0]}<br/>{t.selectCombo[1]}
      </div>
    );
    return (
      <div style={{ padding:'16px 14px' }}>
        <HudPanel color="#38D9F5" style={{ marginBottom:14 }}>
          <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:12, color:'#38D9F5', textShadow:'0 0 8px #38D9F5', marginBottom:10, lineHeight:1.6 }}>
            {activeCombo.name}
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
            {activeCombo.blade   && <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, padding:'5px 9px', background:'rgba(56,217,245,0.08)', border:'1px solid #38D9F533', color:'#38D9F5', borderRadius:2 }}>{activeCombo.blade}</span>}
            {activeCombo.ratchet && <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, padding:'5px 9px', background:'rgba(255,179,64,0.08)',  border:'1px solid #FFB34033', color:'#FFB340', borderRadius:2 }}>{activeCombo.ratchet}</span>}
            {activeCombo.bit     && <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, padding:'5px 9px', background:'rgba(201,127,255,0.08)', border:'1px solid #C97FFF33', color:'#C97FFF', borderRadius:2 }}>{activeCombo.bit}</span>}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8 }}>
            <StatChip label={t.winPct} value={activeStats.winRate}     unit="%" color="#00FF64" />
            <StatChip label={t.wins}   value={activeStats.totalWins}        color="#00FF64" />
            <StatChip label={t.loss}   value={activeStats.totalLosses}      color="#FF3C50" />
            <StatChip label={t.avgPt}  value={activeStats.avgWinScore}      color="#38D9F5" />
          </div>
        </HudPanel>

        <HudPanel color="#FF5C7A" title={t.panelRecord} style={{ marginBottom:14 }}>
          {FINISH_TYPES.map(ft => (
            <FinishRow key={ft.key} finishType={ft} stat={activeCombo.stats[ft.key]} onRecord={recordResult} />
          ))}
        </HudPanel>

        {undoStack.length > 0 && (
          <button onClick={undo} style={{
            width:'100%', padding:'14px', border:'1px solid #FFB34044',
            background:'rgba(255,179,64,0.06)', color:'#FFB340',
            fontFamily:"'Press Start 2P', monospace", fontSize:10, cursor:'pointer',
            borderRadius:4, letterSpacing:1, WebkitTapHighlightColor:'transparent',
          }}>{t.btnUndo}</button>
        )}
      </div>
    );
  };

  const renderStatsPanel = () => {
    if (!activeCombo) return null;
    return (
      <div style={{ padding:'16px 14px' }}>
        <HudPanel color="#C97FFF" title={t.panelBreakdown} style={{ marginBottom:14 }}>
          {FINISH_TYPES.map(ft => {
            const s = activeCombo.stats[ft.key];
            return (
              <div key={ft.key} style={{ marginBottom:12, padding:'10px 10px', background:`${ft.color}08`, border:`1px solid ${ft.color}22`, borderRadius:4 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8, color:ft.color }}>{ft.icon} {t[ft.labelKey]}</span>
                  <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:'rgba(255,255,255,0.3)' }}>{ft.points}PT</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, fontFamily:"'Press Start 2P', monospace" }}>
                  {[
                    { v: s.wins,                  c:'#00FF64', l: t.wins },
                    { v: s.losses,                c:'#FF3C50', l: t.loss },
                    { v: `+${s.wins*ft.points}`,  c:'#00FF64', l: t.gained },
                    { v: `-${s.losses*ft.points}`,c:'#FF3C50', l: t.lost },
                  ].map((cell, i) => (
                    <div key={i} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:14, color:cell.c }}>{cell.v}</div>
                      <div style={{ fontSize:7, color:'rgba(255,255,255,0.3)', marginTop:4 }}>{cell.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ padding:'12px 10px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:4, marginBottom:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, fontFamily:"'Press Start 2P', monospace" }}>
              {[
                { v: activeStats.totalWins,                           c:'#00FF64', l: t.wins },
                { v: activeStats.totalLosses,                         c:'#FF3C50', l: t.loss },
                { v: `+${activeStats.totalGained}`,                   c:'#00FF64', l: t.totalPlus },
                { v: `-${activeStats.totalLost}`,                     c:'#FF3C50', l: t.totalMinus },
              ].map((cell, i) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:15, color:cell.c }}>{cell.v}</div>
                  <div style={{ fontSize:7, color:'rgba(255,255,255,0.3)', marginTop:4 }}>{cell.l}</div>
                </div>
              ))}
            </div>
          </div>

          {activeStats.totalBattles > 0 && (
            <div style={{ padding:'10px 12px', background:'rgba(56,217,245,0.04)', border:'1px solid rgba(56,217,245,0.1)', borderRadius:4 }}>
              <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:'#38D9F5', marginBottom:8 }}>{t.formulas}</div>
              <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:'rgba(255,255,255,0.4)', lineHeight:2.2 }}>
                AVG WIN = {activeStats.totalGained}/{activeStats.totalWins} = <span style={{ color:'#38D9F5' }}>{activeStats.avgWinScore.toFixed(3)}</span>
                <br/>
                NET/BTL = {activeStats.netPoints}/{activeStats.totalBattles} = <span style={{ color:'#C97FFF' }}>{activeStats.avgNetPerBattle.toFixed(3)}</span>
              </div>
            </div>
          )}
        </HudPanel>

        {/* ── Performance Rating ── */}
        {activeStats.totalBattles > 0 && (() => {
          const perf = getPerformanceTier(activeStats.avgNetPerBattle);
          const titleKey = perf.tier === 'dominant' ? 'perfDominantTitle' : perf.tier === 'balanced' ? 'perfBalancedTitle' : 'perfLosingTitle';
          const descKey  = perf.tier === 'dominant' ? 'perfDominantDesc'  : perf.tier === 'balanced' ? 'perfBalancedDesc'  : 'perfLosingDesc';
          const barPct = Math.min(100, Math.max(0, ((activeStats.avgNetPerBattle + 3) / 6) * 100));
          return (
            <HudPanel color={perf.color} title={t.panelPerf} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:28 }}>{perf.icon}</span>
                  <div>
                    <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:11, color:perf.color, textShadow:`0 0 10px ${perf.color}`, letterSpacing:0.5 }}>{t[titleKey]}</div>
                    <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:'rgba(255,255,255,0.35)', marginTop:6 }}>{t.perfLabel}</div>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:18, color:perf.color, textShadow:`0 0 12px ${perf.color}` }}>
                    {activeStats.avgNetPerBattle >= 0 ? '+' : ''}{activeStats.avgNetPerBattle.toFixed(2)}
                  </div>
                  <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:'rgba(255,255,255,0.3)', marginTop:4 }}>NET/BTL</div>
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden', position:'relative' }}>
                  <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, background:'rgba(255,255,255,0.2)' }} />
                  <div style={{ height:'100%', width:`${barPct}%`, background:`linear-gradient(90deg, #FF5C7A, #FFB340, #00FF64)`, borderRadius:3, transition:'width 0.6s ease' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, fontFamily:"'Press Start 2P', monospace", fontSize:6, color:'rgba(255,255,255,0.25)' }}>
                  <span>−</span><span>0</span><span>+</span>
                </div>
              </div>
              <div style={{ padding:'10px 12px', background:`${perf.color}08`, border:`1px solid ${perf.color}22`, borderRadius:4 }}>
                <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8, color:'rgba(255,255,255,0.55)', lineHeight:2.2 }}>{t[descKey]}</div>
              </div>
            </HudPanel>
          );
        })()}

        {/* ── Glossary ── */}
        <HudPanel color="#C97FFF" title={t.panelGlossary} style={{ marginBottom:14 }}>
          {t.glossaryItems.map((item, i) => (
            <div key={i} style={{ marginBottom: i < t.glossaryItems.length - 1 ? 10 : 0,
              padding:'10px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:4 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8, color:'#C97FFF' }}>{item.term}</span>
                <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:'rgba(255,255,255,0.25)',
                  background:'rgba(201,127,255,0.08)', border:'1px solid rgba(201,127,255,0.2)',
                  padding:'2px 7px', borderRadius:3 }}>{item.formula}</span>
              </div>
              <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:'rgba(255,255,255,0.4)', lineHeight:2 }}>{item.desc}</div>
            </div>
          ))}
        </HudPanel>
      </div>
    );
  };

  const formFields = [
    { key:'name',    label: t.fieldName,    placeholder: t.placeholderName,    required: true },
    { key:'blade',   label: t.fieldBlade,   placeholder: t.placeholderBlade },
    { key:'ratchet', label: t.fieldRatchet, placeholder: t.placeholderRatchet },
    { key:'bit',     label: t.fieldBit,     placeholder: t.placeholderBit },
  ];

  return (
    <LangCtx.Provider value={t}>
      {showLoading && <LoadingScreen progress={loadingProgress} />}
      <div style={{
        minHeight:'100vh', width:'100%', background:'#080814',
        backgroundImage:'radial-gradient(ellipse at 20% 10%, rgba(56,217,245,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(201,127,255,0.07) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(30,30,80,0.5) 0%, transparent 70%)',
        color:'#E8F4FF', paddingBottom:76, overflowX:'hidden',
      }}>
        {/* Scanline */}
        <div style={{ position:'fixed', inset:0, zIndex:300, pointerEvents:'none',
          backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)' }} />

        {/* Notification */}
        {notification && (
          <div style={{
            position:'fixed', top:70, left:'50%', transform:'translateX(-50%)', zIndex:400,
            padding:'8px 20px', background:`${notification.color}22`, border:`1px solid ${notification.color}`,
            borderRadius:4, boxShadow:`0 0 20px ${notification.color}66`,
            fontFamily:"'Press Start 2P', monospace", fontSize:12, color:notification.color,
            textShadow:`0 0 8px ${notification.color}`, animation:'fadeInOut 1.2s ease',
          }}>{notification.msg}</div>
        )}

        {/* Header */}
        <header style={{ padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
          borderBottom:'1px solid rgba(56,217,245,0.12)', background:'rgba(8,8,20,0.92)',
          backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:100 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:46, height:46, borderRadius:8, overflow:'hidden', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'radial-gradient(circle, rgba(56,217,245,0.15) 0%, transparent 70%)',
              boxShadow:'0 0 20px rgba(56,217,245,0.35)' }}>
              <img src="/icon.png" alt="Bey Tracker" style={{
                width:52, height:52, objectFit:'contain',
                filter:'brightness(1.4) saturate(1.3) contrast(1.1) drop-shadow(0 0 6px rgba(56,217,245,0.7))',
                mixBlendMode:'screen',
              }} />
            </div>
            <div>
              <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:12, color:'#38D9F5',
                textShadow:'0 0 10px #38D9F5, 0 0 20px rgba(56,217,245,0.4)', letterSpacing:1 }}>BEY TRACKER</div>
              <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:'rgba(200,230,255,0.35)', letterSpacing:1, marginTop:4 }}>{t.appSubtitle}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <LangToggle lang={lang} setLang={setLang} />
            <button onClick={() => setShowHelp(true)} style={{
              width:40, height:40, borderRadius:4, border:'1px solid rgba(56,217,245,0.15)',
              background:'rgba(56,217,245,0.05)', color:'rgba(200,235,255,0.55)',
              fontFamily:"'Press Start 2P', monospace", fontSize:12, cursor:'pointer',
              WebkitTapHighlightColor:'transparent',
            }}>?</button>
            <button onClick={() => setShowAdd(true)} style={{
              padding:'10px 14px', borderRadius:4, border:'1px solid rgba(56,217,245,0.35)',
              background:'rgba(56,217,245,0.1)', color:'#38D9F5',
              fontFamily:"'Press Start 2P', monospace", fontSize:8, cursor:'pointer',
              letterSpacing:0.5, textShadow:'0 0 8px #38D9F5',
              boxShadow:'0 0 14px rgba(56,217,245,0.2)', WebkitTapHighlightColor:'transparent',
            }}>{t.btnNew}</button>
          </div>
        </header>

        {/* Content */}
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          {tab === 'combos' && renderCombosPanel()}
          {tab === 'battle' && renderBattlePanel()}
          {tab === 'stats'  && renderStatsPanel()}

          {/* Footer */}
          <div style={{ padding:'20px 20px 10px', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.05)', marginTop:8 }}>
            <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:'rgba(255,255,255,0.18)', lineHeight:2.4, letterSpacing:0.5 }}>
              {lang === 'zh' ? (
                <>
                  非官方粉絲網站，所有圖片版權歸原始版權所有人所有<br/>
                  開發者：Noah Wen｜
                  <a href="mailto:hungnoah730@gmail.com" style={{ color:'#38D9F5', textDecoration:'none', textShadow:'0 0 6px #38D9F588' }}>
                    hungnoah730@gmail.com
                  </a>
                </>
              ) : (
                <>
                  Unofficial fan website. Images &amp; trademarks belong to their respective owners.<br/>
                  Beyblade X is a trademark of TOMY / Hasbro. Not affiliated with or endorsed by TOMY / Hasbro.<br/>
                  Developed by Noah Wen｜
                  <a href="mailto:hungnoah730@gmail.com" style={{ color:'#38D9F5', textDecoration:'none', textShadow:'0 0 6px #38D9F588' }}>
                    hungnoah730@gmail.com
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <TabBar tab={tab} setTab={setTab} hasCombos={combos.length > 0} />
        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

        {/* ═══ DELETE CONFIRM MODAL ═══ */}
        {confirmDelete !== null && (
          <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
            <div onClick={() => setConfirmDelete(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' }} />
            <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:480,
              background:'#07070c', borderRadius:'12px 12px 0 0',
              border:'1px solid rgba(255,92,122,0.25)', borderBottom:'none',
              padding:'28px 20px 40px', boxShadow:'0 -8px 40px rgba(255,92,122,0.12)' }}>
              <div style={{ width:36, height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, margin:'0 auto 24px' }} />
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ fontSize:36, marginBottom:14 }}>⚠️</div>
                <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:11, color:'#FF5C7A',
                  textShadow:'0 0 8px #FF5C7A', marginBottom:14, letterSpacing:1 }}>{t.deleteTitle}</div>
                <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:9,
                  color:'rgba(255,255,255,0.4)', lineHeight:2, maxWidth:300, margin:'0 auto' }}>
                  {combos[confirmDelete]?.name && (
                    <span style={{ color:'#38D9F5', display:'block', marginBottom:10 }}>
                      [{combos[confirmDelete].name}]
                    </span>
                  )}
                  {t.deleteMsg}
                </div>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:24 }}>
                <button onClick={() => setConfirmDelete(null)} style={{
                  flex:2, padding:'15px', borderRadius:4,
                  border:'1px solid rgba(56,217,245,0.25)', background:'rgba(56,217,245,0.06)',
                  color:'#38D9F5', fontFamily:"'Press Start 2P', monospace", fontSize:10,
                  cursor:'pointer', WebkitTapHighlightColor:'transparent',
                }}>{t.btnDeleteCancel}</button>
                <button onClick={() => { deleteCombo(confirmDelete); setConfirmDelete(null); }} style={{
                  flex:1, padding:'15px', borderRadius:4,
                  border:'1px solid rgba(255,92,122,0.35)',
                  background:'rgba(255,92,122,0.15)', color:'#FF5C7A',
                  fontFamily:"'Press Start 2P', monospace", fontSize:10,
                  cursor:'pointer', WebkitTapHighlightColor:'transparent',
                  boxShadow:'0 0 12px rgba(255,92,122,0.2)',
                }}>{t.btnDeleteConfirm}</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ EDIT COMBO MODAL ═══ */}
        {editComboIdx !== null && (
          <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
            <div onClick={() => setEditComboIdx(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' }} />
            <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:480,
              background:'#07070c', borderRadius:'12px 12px 0 0',
              border:'1px solid rgba(255,179,64,0.2)', borderBottom:'none',
              padding:'28px 20px 40px', boxShadow:'0 -8px 40px rgba(255,179,64,0.1)' }}>
              <div style={{ width:36, height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, margin:'0 auto 24px' }} />
              <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:12, color:'#FFB340', textShadow:'0 0 8px #FFB340', marginBottom:6 }}>{t.modalEditTitle}</div>
              <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8, color:'rgba(255,255,255,0.3)', marginBottom:24, letterSpacing:1 }}>{t.modalSub}</div>

              {[
                { key:'name',    label: t.fieldName,    placeholder: t.placeholderName,    required: true },
                { key:'blade',   label: t.fieldBlade,   placeholder: t.placeholderBlade },
                { key:'ratchet', label: t.fieldRatchet, placeholder: t.placeholderRatchet },
                { key:'bit',     label: t.fieldBit,     placeholder: t.placeholderBit },
              ].map(field => (
                <div key={field.key} style={{ marginBottom:16 }}>
                  <label style={{ fontFamily:"'Press Start 2P', monospace", fontSize:9, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:8, letterSpacing:1 }}>
                    {field.label}{field.required && <span style={{ color:'#FF3C50' }}> *</span>}
                  </label>
                  <input value={editForm[field.key]}
                    onChange={e => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width:'100%', padding:'13px 14px', borderRadius:4,
                      background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,179,64,0.2)',
                      color:'#F1F5F9', fontFamily:"'Press Start 2P', monospace", fontSize:10,
                      outline:'none', transition:'border-color 0.2s' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#FFB340'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,179,64,0.2)'}
                  />
                </div>
              ))}

              <div style={{ display:'flex', gap:10, marginTop:24 }}>
                <button onClick={() => setEditComboIdx(null)} style={{
                  flex:1, padding:'15px', borderRadius:4, border:'1px solid rgba(255,255,255,0.08)',
                  background:'transparent', color:'rgba(255,255,255,0.4)',
                  fontFamily:"'Press Start 2P', monospace", fontSize:9, cursor:'pointer',
                  WebkitTapHighlightColor:'transparent',
                }}>{t.btnCancel}</button>
                <button onClick={saveEdit} disabled={!editForm.name.trim()} style={{
                  flex:2, padding:'15px', borderRadius:4, border:'none',
                  background: editForm.name.trim() ? 'linear-gradient(135deg, #FFB340, #FF5C7A)' : 'rgba(255,255,255,0.05)',
                  color: editForm.name.trim() ? '#000' : 'rgba(255,255,255,0.2)',
                  fontFamily:"'Press Start 2P', monospace", fontSize:9, fontWeight:700,
                  cursor: editForm.name.trim() ? 'pointer' : 'default',
                  letterSpacing:1, transition:'all 0.2s', WebkitTapHighlightColor:'transparent',
                }}>{t.btnSave}</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Combo Modal */}
        {showAdd && (
          <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
            <div onClick={() => setShowAdd(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' }} />
            <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:480,
              background:'#07070c', borderRadius:'12px 12px 0 0',
              border:'1px solid rgba(56,217,245,0.15)', borderBottom:'none',
              padding:'28px 20px 40px', boxShadow:'0 -8px 40px rgba(56,217,245,0.1)' }}>
              <div style={{ width:36, height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, margin:'0 auto 24px' }} />
              <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:12, color:'#38D9F5', textShadow:'0 0 8px #38D9F5', marginBottom:6 }}>{t.modalTitle}</div>
              <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8, color:'rgba(255,255,255,0.3)', marginBottom:24, letterSpacing:1 }}>{t.modalSub}</div>

              {formFields.map(field => (
                <div key={field.key} style={{ marginBottom:16 }}>
                  <label style={{ fontFamily:"'Press Start 2P', monospace", fontSize:9, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:8, letterSpacing:1 }}>
                    {field.label}{field.required && <span style={{ color:'#FF3C50' }}> *</span>}
                  </label>
                  <input value={newCombo[field.key]}
                    onChange={e => setNewCombo(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width:'100%', padding:'13px 14px', borderRadius:4,
                      background:'rgba(255,255,255,0.03)', border:'1px solid rgba(56,217,245,0.15)',
                      color:'#F1F5F9', fontFamily:"'Press Start 2P', monospace", fontSize:10,
                      outline:'none', transition:'border-color 0.2s' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#38D9F5'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(56,217,245,0.15)'}
                  />
                </div>
              ))}

              <div style={{ display:'flex', gap:10, marginTop:24 }}>
                <button onClick={() => setShowAdd(false)} style={{
                  flex:1, padding:'15px', borderRadius:4, border:'1px solid rgba(255,255,255,0.08)',
                  background:'transparent', color:'rgba(255,255,255,0.4)',
                  fontFamily:"'Press Start 2P', monospace", fontSize:9, cursor:'pointer',
                  WebkitTapHighlightColor:'transparent',
                }}>{t.btnCancel}</button>
                <button onClick={addCombo} disabled={!newCombo.name.trim()} style={{
                  flex:2, padding:'15px', borderRadius:4, border:'none',
                  background: newCombo.name.trim() ? 'linear-gradient(135deg, #38D9F5, #C97FFF)' : 'rgba(255,255,255,0.05)',
                  color: newCombo.name.trim() ? '#000' : 'rgba(255,255,255,0.2)',
                  fontFamily:"'Press Start 2P', monospace", fontSize:9, fontWeight:700,
                  cursor: newCombo.name.trim() ? 'pointer' : 'default',
                  letterSpacing:1, transition:'all 0.2s', WebkitTapHighlightColor:'transparent',
                }}>{t.btnCreate}</button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Rajdhani:wght@700&family=Space+Mono&display=swap');
          * { margin:0; padding:0; box-sizing:border-box; }
          html, body { background:#080814; overscroll-behavior:none; }
          input::placeholder { color:rgba(180,220,255,0.2); font-size:9px; }
          ::-webkit-scrollbar { width:2px; }
          ::-webkit-scrollbar-thumb { background:rgba(56,217,245,0.25); }
          @keyframes fadeInOut {
            0%   { opacity:0; transform:translateX(-50%) translateY(-6px); }
            15%  { opacity:1; transform:translateX(-50%) translateY(0); }
            75%  { opacity:1; }
            100% { opacity:0; transform:translateX(-50%) translateY(-4px); }
          }
          @keyframes iconPulse {
            0%, 100% { box-shadow: 0 0 50px rgba(56,217,245,0.45), 0 0 100px rgba(56,217,245,0.15); }
            50%       { box-shadow: 0 0 70px rgba(56,217,245,0.65), 0 0 130px rgba(56,217,245,0.25); }
          }
        `}</style>
      </div>
    </LangCtx.Provider>
  );
}

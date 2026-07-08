import { useEffect, useMemo, useRef, useState } from 'react'
import { AZ_ROWS } from '../data/azquiz.js'
import { FREE, BLOCKED, assignCategories, pickQuestion, checkWin as checkWinPure } from './azQuizLogic.js'
import { useModeratorHost, openModeratorWindow } from '../utils/moderatorSync.js'

const ANSWER_TIME = 30 // sekúnd na odpoveď

const COLORS = ['#4d8df0', '#f0404a', '#3fb950', '#f5c518', '#c77dff', '#ff8a3d']

export default function AzQuiz({ teams: draftTeams, report, clearResult, categories }) {
  const AZ_CATEGORIES = categories
  const [phase, setPhase] = useState('setup')
  const [mode, setMode] = useState('classic') // classic (spoj 3 strany) | rychlovka
  // Tímy, farby aj počet (2) prichádzajú z losovania — nedajú sa tu meniť
  const numTeams = 2
  const teams = [
    { name: draftTeams?.[0]?.name || 'Tím 1', color: COLORS[0] },
    { name: draftTeams?.[1]?.name || 'Tím 2', color: COLORS[1] },
  ]
  const [owner, setOwner] = useState(() => Object.fromEntries([...Array(28)].map((_, i) => [i + 1, FREE])))
  const [cellCat, setCellCat] = useState({})
  const [turn, setTurn] = useState(0)
  const [modal, setModal] = useState(null) // {cell, catId, q, a}
  const [used, setUsed] = useState(() => new Set()) // globálne použité otázky "catId:qIdx" — bez opakovania
  const [winner, setWinner] = useState(null)
  const [revealed, setRevealed] = useState(false) // odhalená odpoveď v modáli
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIME)
  const timerRef = useRef(null)

  function stopTimer() { clearInterval(timerRef.current); timerRef.current = null }
  useEffect(() => () => stopTimer(), [])

  function start() {
    setCellCat(assignCategories(AZ_CATEGORIES))
    setOwner(Object.fromEntries([...Array(28)].map((_, i) => [i + 1, FREE])))
    setUsed(new Set()); setTurn(0); setWinner(null); setPhase('play')
    clearResult() // nová hra → výsledok disciplíny sa zatiaľ vynuluje
  }

  function openCell(cell) {
    if (winner || owner[cell] >= 0) return // už obsadené
    const catId = cellCat[cell]
    // najprv nepoužité otázky z pridelenej kategórie; ak sú vyčerpané, požičaj z inej (bez opakovania)
    const pick = pickQuestion(AZ_CATEGORIES, catId, used)
    if (!pick) return // všetky otázky vyčerpané
    setModal({ cell, catId: pick.cat.id, icon: pick.cat.icon, label: pick.cat.label, qIdx: pick.i, ...pick.q })
    // spusti 30s odpočet — odpoveď sa odhalí až po čase (alebo skôr cez tlačidlo)
    setRevealed(false); setTimeLeft(ANSWER_TIME)
    stopTimer()
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { stopTimer(); setRevealed(true); return 0 }
        return t - 1
      })
    }, 1000)
  }

  function revealAnswer() { stopTimer(); setRevealed(true) }
  function closeModal() { stopTimer(); setModal(null) }

  function resolve(correct) {
    const { cell, catId, qIdx } = modal
    stopTimer()
    const nextOwner = { ...owner, [cell]: correct ? turn : BLOCKED }
    setOwner(nextOwner)
    setUsed((u) => new Set(u).add(catId + ':' + qIdx)) // označ otázku ako použitú (nezopakuje sa)
    setModal(null)

    // detekcia výhry
    let win = checkWin(nextOwner)
    if (win != null) { setWinner(win); setPhase('end'); report(win === 0 || win === 1 ? win : null); return }
    setTurn((t) => (t + 1) % numTeams)
  }

  function checkWin(o) {
    return checkWinPure(o, mode, numTeams)
  }

  function manualWin() {
    const counts = teams.slice(0, numTeams).map((_, t) => Object.values(owner).filter((v) => v === t).length)
    const w = counts.indexOf(Math.max(...counts))
    setWinner(w); setPhase('end'); report(w === 0 || w === 1 ? w : null)
  }

  function reset() { setPhase('setup'); setWinner(null); clearResult() }

  // ---- Moderátorské okno (na laptope) ----
  const counts = teams.slice(0, numTeams).map((_, t) => Object.values(owner).filter((v) => v === t).length)
  useModeratorHost('lostdawgs-az', {
    phase, mode, turn, winner, numTeams,
    teams: teams.map((t) => ({ name: t.name, color: t.color })),
    counts, owner,
    modal: modal ? { cell: modal.cell, icon: modal.icon, label: modal.label, difficulty: modal.difficulty, q: modal.q, a: modal.a } : null,
    revealed, timeLeft, answerTime: ANSWER_TIME,
  }, {
    setMode: (d) => setMode(d.mode),
    start: () => start(),
    openCell: (d) => openCell(d.cell),
    reveal: () => revealAnswer(),
    resolve: (d) => resolve(d.correct),
    close: () => closeModal(),
    setTurn: (d) => setTurn(d.team),
    manualWin: () => manualWin(),
    reset: () => reset(),
  }, [phase, mode, turn, winner, owner, modal, revealed, timeLeft])

  /* ---------- SETUP ---------- */
  if (phase === 'setup') {
    return (
      <main className="page">
        <div className="page-head"><img className="title-emote" src="/emotes/fudyPodelafka.png" alt="" /><h1>AZ Kvíz</h1><span className="pill">28 políčok · 9 kategórií</span></div>
        <p className="page-sub">Hrajú vylosované tímy. Vyber herný mód — kategórie sa políčkam priradia náhodne a skryto.</p>

        <div className="az-setup">
          <div className="az-teams-info">
            {teams.map((t, i) => (
              <span key={i} className="turn-pill"><span className="dot" style={{ background: t.color }} />{t.name}</span>
            ))}
          </div>

          <div>
            <p className="section-label">Herný mód</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className={'btn' + (mode === 'classic' ? ' btn-primary' : '')} onClick={() => setMode('classic')}>Spoj všetky 3 strany trojuholníka</button>
              <button className={'btn' + (mode === 'rychlovka' ? ' btn-primary' : '')} onClick={() => setMode('rychlovka')}>Rýchlovka: najviac políčok</button>
            </div>
            <p className="mod-note" style={{ textAlign: 'left', marginTop: 8 }}>
              {mode === 'rychlovka'
                ? 'Žiadne prepájanie — vyhráva tím s najviac políčkami z 28 otázok.'
                : 'Vyhráva tím, ktorý prvý spojí ľavú, pravú aj spodnú stranu súvislou reťazou svojich políčok.'}
            </p>
          </div>

          <button className="btn btn-primary btn-xl" onClick={start}>Spustiť hru →</button>
        </div>
      </main>
    )
  }

  /* ---------- END ---------- */
  if (phase === 'end') {
    return (
      <main className="page">
        <div className="vn-wrap">
          <h1 style={{ fontSize: 52 }}>Koniec hry</h1>
          <div className="vn-card">
            <div className="vn-cat">Víťaz</div>
            <div className="vn-verdict ok" style={{ fontSize: 54, color: teams[winner].color }}>🏆 {teams[winner].name}</div>
          </div>
          <div className="draft-actions" style={{ marginTop: 24 }}>
            <button className="btn btn-primary btn-xl" onClick={start}>🔁 Nová hra (rovnaké tímy)</button>
            <button className="btn btn-lg" onClick={reset}>Upraviť nastavenie</button>
          </div>
        </div>
      </main>
    )
  }

  /* ---------- PLAY ---------- */
  return (
    <main className="page">
      <div className="page-head"><img className="title-emote" src="/emotes/fudyPodelafka.png" alt="" /><h1>AZ Kvíz</h1><span className="pill">{mode === 'rychlovka' ? 'Rýchlovka' : 'Spoj 3 strany'}</span></div>

      <div className="az-turn">
        {teams.slice(0, numTeams).map((t, i) => (
          <div key={i} className={'turn-pill' + (turn === i ? ' active' : '')} style={turn === i ? { borderColor: t.color } : {}}>
            <span className="dot" style={{ background: t.color }} />
            {t.name} <span style={{ color: 'var(--muted)', fontWeight: 700 }}>· {counts[i]}</span>
            {turn === i && <span style={{ color: t.color }}>← na ťahu</span>}
          </div>
        ))}
      </div>

      <div className="az-board">
        {AZ_ROWS.map((row, r) => (
          <div className="az-row" key={r}>
            {row.map((cell) => {
              const o = owner[cell]
              const cls = o === BLOCKED ? ' blocked' : o >= 0 ? ' owned' : ''
              const bg = o >= 0 ? teams[o].color : undefined
              return (
                <button key={cell} className={'hex' + cls} onClick={() => openCell(cell)}>
                  <span className="shape" style={bg ? { background: `linear-gradient(160deg, ${bg}, ${bg}cc)` } : {}}>
                    {o === FREE ? cell : o === BLOCKED ? <><span className="x">✕</span>{cell}</> : ''}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="az-legend">
        <span><i className="dot" style={{ background: '#2a2a32' }} /> voľné (číslo)</span>
        <span><i className="dot" style={{ background: '#f5f5f7', color: 'var(--red)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, boxShadow: 'inset 0 0 0 1.5px var(--red)' }}>✕</i> zablokované</span>
        {teams.slice(0, numTeams).map((t, i) => (
          <span key={i}><i className="dot" style={{ background: t.color }} /> {t.name}</span>
        ))}
      </div>

      <div className="controls" style={{ marginTop: 24, justifyContent: 'center' }}>
        <button className="btn btn-green btn-lg" onClick={() => openModeratorWindow('az')}>🔎 Otvoriť moderátorský panel</button>
      </div>

      {modal && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} title="Zrušiť otázku">✕</button>
            <div className="q-cat">{modal.icon} {modal.label} · políčko {modal.cell} · {modal.difficulty === 'hard' ? '🔴 ťažká' : '🟢 ľahká'}</div>
            <div className="q-text">{modal.q}</div>
            <div className={'az-timer' + (timeLeft <= 5 ? ' danger' : timeLeft <= 10 ? ' warn' : '')}>
              <div className="az-timer-num">{timeLeft}<span>s</span></div>
              <div className="az-timer-bar"><div style={{ width: `${(timeLeft / ANSWER_TIME) * 100}%` }} /></div>
              <div className="az-timer-lab">{revealed ? '⏳ Čas vypršal — moderátor vyhodnotí' : 'Čas na odpoveď'}</div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

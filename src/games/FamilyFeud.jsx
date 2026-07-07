import { useEffect, useMemo, useRef, useState } from 'react'
import { roundMultiplier, TOTAL_ROUNDS } from '../data/familyFeud.js'
import { playBuzzer } from '../utils/sounds.js'

export default function FamilyFeud({ teams, report, clearResult, questions, goHome }) {
  const FEUD_QUESTIONS = questions
  const TEAM_NAMES = teams.map((t) => t.name)
  const MEMBERS = teams.map((t) => t.members || [])

  const [phase, setPhase] = useState('intro') // intro (štart kola) | play | end
  const [scores, setScores] = useState([0, 0])
  const [round, setRound] = useState(1)
  const [qIndex, setQIndex] = useState(0)
  const [revealed, setRevealed] = useState(new Set())
  const [strikes, setStrikes] = useState(0)
  const [active, setActive] = useState(0)
  const [stealing, setStealing] = useState(false)
  const [frozenBank, setFrozenBank] = useState(null) // bank zmrazený pri krádeži
  const [lifelines, setLifelines] = useState([3, 3]) // remaining lifelines per team

  const mult = roundMultiplier(round)
  const q = FEUD_QUESTIONS[qIndex] ?? null

  const liveBank = useMemo(() => {
    if (!q) return 0
    let base = 0
    revealed.forEach((i) => { base += q.answers[i].points })
    return base * mult
  }, [q, revealed, mult])

  // Po „Súper kradne" sa bank zmrazí — odhalenie odpovede pri krádeži ho už nezvyšuje
  const bank = frozenBank ?? liveBank

  const allRevealed = q && revealed.size === q.answers.length

  // ---- Sync + ovládanie zo samostatného moderátorského okna (BroadcastChannel) ----
  const chanRef = useRef(null)
  const payloadRef = useRef(null)
  const dispatchRef = useRef(null)
  payloadRef.current = {
    phase, question: q?.question, category: q?.category, icon: q?.icon,
    answers: q?.answers || [], revealed: [...revealed],
    round, mult, totalRounds: TOTAL_ROUNDS, teamNames: TEAM_NAMES, scores,
    active, strikes, stealing, lifelines, bank, allRevealed: !!allRevealed,
  }
  dispatchRef.current = (d) => {
    switch (d?.type) {
      case 'hello': chanRef.current?.postMessage({ type: 'state', state: payloadRef.current }); break
      case 'reveal': revealCell(d.index); break
      case 'hide': hideCell(d.index); break
      case 'setActive': setActive(d.team); break
      case 'addStrike': addStrike(); break
      case 'clearStrikes': setStrikes(0); break
      case 'steal': setFrozenBank(bank); setStealing(true); setStrikes(0); setActive(active === 0 ? 1 : 0); break
      case 'useLifeline': useLifeline(d.team); break
      case 'assign': assign(d.team); break
      case 'adjust': adjust(d.team, d.delta); break
      case 'startRound': setPhase('play'); break
      case 'reset': fullReset(); break
      default: break
    }
  }
  useEffect(() => {
    const ch = new BroadcastChannel('lostdawgs-feud')
    chanRef.current = ch
    ch.onmessage = (e) => dispatchRef.current?.(e.data)
    return () => ch.close()
  }, [])
  useEffect(() => {
    chanRef.current?.postMessage({ type: 'state', state: payloadRef.current })
  }, [phase, qIndex, revealed, round, scores, active, strikes, stealing, frozenBank, lifelines])

  function openModerator() {
    window.open(window.location.pathname + '?mod=feud', 'feud-moderator', 'width=580,height=840')
  }

  function revealCell(i) {
    if (revealed.has(i)) return
    setRevealed((prev) => new Set(prev).add(i))
  }

  // Skrytie omylom odhalenej odpovede — body sa odrátajú z banku (bank sa počíta z odhalených)
  function hideCell(i) {
    setRevealed((prev) => { const n = new Set(prev); n.delete(i); return n })
  }

  function addStrike() {
    playBuzzer()
    setTimeout(() => setStrikes((s) => Math.min(3, s + 1)), 1000)
  }

  function useLifeline(team) {
    setLifelines((prev) => {
      const next = [...prev]
      if (next[team] > 0) next[team]--
      return next
    })
  }

  function assign(team) {
    const newScores = [...scores]
    newScores[team] += bank
    setScores(newScores)

    const nextQ = qIndex + 1
    const nextRound = round + 1

    if (nextQ >= FEUD_QUESTIONS.length || nextRound > TOTAL_ROUNDS) {
      const w = newScores[0] === newScores[1] ? 'tie' : newScores[0] > newScores[1] ? 0 : 1
      report(w)
      setPhase('end')
    } else {
      setRound(nextRound)
      setQIndex(nextQ)
      setRevealed(new Set())
      setStrikes(0)
      setStealing(false)
      setFrozenBank(null)
      setActive(0)
      setPhase('intro') // medzi kolami — obrazovka štart kola
    }
  }

  function adjust(team, delta) {
    setScores((s) => { const n = [...s]; n[team] = Math.max(0, n[team] + delta); return n })
  }

  function fullReset() {
    setScores([0, 0]); setRound(1); setQIndex(0)
    setRevealed(new Set()); setStrikes(0); setActive(0); setStealing(false); setFrozenBank(null)
    setLifelines([3, 3]); setPhase('intro')
    clearResult()
  }

  /* ---------- END ---------- */
  if (phase === 'end') {
    const winner = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1
    return (
      <main className="page">
        <div className="vn-wrap">
          <h1 style={{ fontSize: 52, marginBottom: 10 }}>Koniec hry</h1>
          <div className="vn-card">
            <div className="vn-cat">Celkový víťaz</div>
            <div className="vn-verdict ok" style={{ fontSize: 56 }}>
              {winner == null ? '🤝 Remíza!' : `🏆 ${TEAM_NAMES[winner]}`}
            </div>
            <div style={{ display: 'flex', gap: 40, marginTop: 10 }}>
              <div><div className="vn-cat">{TEAM_NAMES[0]}</div><div className="pts" style={{ fontSize: 44, color: 'var(--t1)', fontWeight: 900 }}>{scores[0]}</div></div>
              <div><div className="vn-cat">{TEAM_NAMES[1]}</div><div className="pts" style={{ fontSize: 44, color: 'var(--t2)', fontWeight: 900 }}>{scores[1]}</div></div>
            </div>
          </div>
          <div className="draft-actions" style={{ marginTop: 26 }}>
            <button className="btn btn-primary btn-xl" onClick={fullReset}>🔁 Hrať znova</button>
            <button className="btn btn-green btn-xl" onClick={goHome}>🏠 Späť na hub</button>
          </div>
        </div>
      </main>
    )
  }

  /* ---------- ŠTART KOLA (intro) ---------- */
  if (phase === 'intro') {
    return (
      <main className="page">
        <div className="feud-intro">
          <img className="feud-intro-logo" src="/5-proti-5.png" alt="Family Feud" />
          <div className="feud-intro-round">Kolo {round} <span>/ {TOTAL_ROUNDS}</span></div>
          <div className="feud-intro-mult">Násobič bodov ×{mult}</div>
          <button className="btn btn-primary btn-xl" onClick={() => setPhase('play')}>🎬 Štart kola {round}</button>
          <p className="mod-note" style={{ marginTop: 4 }}>Otázka sa ukáže až po kliknutí — nech hráči stihnú prísť k tlačidlu.</p>
        </div>
      </main>
    )
  }

  /* ---------- SCOREBOARD ---------- */
  const Lifelines = ({ team }) => (
    <div className="lifelines">
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={'lifeline-icon' + (i < lifelines[team] ? ' active' : ' used')}
          title={i < lifelines[team] ? 'Joker k dispozícii' : 'Joker použitý'}
        >
          🃏
        </span>
      ))}
    </div>
  )

  const Scoreboard = () => (
    <div className="scorebar">
      <div className={'team-score t1' + (active === 0 ? ' active' : '')}>
        <div className="ts-info">
          <span className="name" style={{ color: 'var(--t1)' }}>{TEAM_NAMES[0]}</span>
          {MEMBERS[0].length > 0 && <span className="members">{MEMBERS[0].join(' · ')}</span>}
          <Lifelines team={0} />
        </div>
        <span className="pts">{scores[0]}</span>
      </div>
      <div className="mid">
        <span className="vs">KOLO</span>
        <span style={{ fontSize: 30, fontWeight: 900 }}>{round}<span style={{ color: 'var(--muted)', fontSize: 18 }}>/{TOTAL_ROUNDS}</span></span>
        <span className="round">násobič ×{mult}</span>
      </div>
      <div className={'team-score t2' + (active === 1 ? ' active' : '')}>
        <span className="pts">{scores[1]}</span>
        <div className="ts-info">
          <span className="name" style={{ color: 'var(--t2)' }}>{TEAM_NAMES[1]}</span>
          {MEMBERS[1].length > 0 && <span className="members">{MEMBERS[1].join(' · ')}</span>}
          <Lifelines team={1} />
        </div>
      </div>
    </div>
  )

  /* ---------- PLAY ---------- */
  return (
    <main className="page page-wide">
      <div className="page-head">
        <img className="title-emote" src="/emotes/antyApprove.png" alt="" />
        <h1>5 proti 5</h1>
      </div>
      <Scoreboard />

      <div className="feud-question">
        <span className="cat">{q.icon} {q.category}</span>
        {q.question}
      </div>

      <div className="bank-row">
        <span className="bank-pill lg">💰 Bank kola: {bank} {mult > 1 && <span style={{ opacity: 0.7, fontSize: 16 }}>(×{mult})</span>}{stealing && <span style={{ opacity: 0.85, fontSize: 16 }}> 🧊 zmrazený</span>}</span>
      </div>

      {/* Farba odpovedí = farba tímu, ktorý je práve na ťahu */}
      <div className={'feud-board ' + (active === 0 ? 't1' : 't2')}>
        {q.answers.map((a, i) => (
          <div
            key={i}
            className={'feud-cell' + (revealed.has(i) ? ' revealed' : '')}
            onClick={() => revealCell(i)}
          >
            <div className="inner">
              <div className="face front">{i + 1}</div>
              <div className="face back">
                <span className="ans">{a.text}</span>
                <span className="pts">{a.points}</span>
              </div>
            </div>
          </div>
        ))}
        {q.answers.length % 2 === 1 && <div className="feud-cell empty-slot" />}
      </div>

      <div className="strikes">
        {Array.from({ length: strikes }).map((_, i) => <span className="strike-x" key={i}>✕</span>)}
      </div>

      <div className="controls" style={{ justifyContent: 'center' }}>
        <button className="btn btn-green btn-lg" onClick={openModerator}>🔎 Otvoriť moderátorský panel</button>
      </div>
    </main>
  )
}

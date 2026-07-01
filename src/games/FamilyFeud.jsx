import { useMemo, useState } from 'react'
import { roundMultiplier, TOTAL_ROUNDS } from '../data/familyFeud.js'
import { playBuzzer } from '../utils/sounds.js'

export default function FamilyFeud({ teams, report, clearResult, questions }) {
  const FEUD_QUESTIONS = questions
  const TEAM_NAMES = teams.map((t) => t.name)
  const MEMBERS = teams.map((t) => t.members || [])

  const [phase, setPhase] = useState('play')
  const [scores, setScores] = useState([0, 0])
  const [round, setRound] = useState(1)
  const [qIndex, setQIndex] = useState(0)
  const [revealed, setRevealed] = useState(new Set())
  const [strikes, setStrikes] = useState(0)
  const [active, setActive] = useState(0)
  const [stealing, setStealing] = useState(false)
  const [lifelines, setLifelines] = useState([3, 3]) // remaining lifelines per team

  const mult = roundMultiplier(round)
  const q = FEUD_QUESTIONS[qIndex] ?? null

  const bank = useMemo(() => {
    if (!q) return 0
    let base = 0
    revealed.forEach((i) => { base += q.answers[i].points })
    return base * mult
  }, [q, revealed, mult])

  const allRevealed = q && revealed.size === q.answers.length

  function revealCell(i) {
    if (revealed.has(i)) return
    setRevealed((prev) => new Set(prev).add(i))
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
      setActive(0)
    }
  }

  function adjust(team, delta) {
    setScores((s) => { const n = [...s]; n[team] = Math.max(0, n[team] + delta); return n })
  }

  function fullReset() {
    setScores([0, 0]); setRound(1); setQIndex(0)
    setRevealed(new Set()); setStrikes(0); setActive(0); setStealing(false)
    setLifelines([3, 3]); setPhase('play')
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
          </div>
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

      <div className="feud-board">
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

      <div style={{ textAlign: 'center' }}>
        <span className="bank-pill">💰 Bank kola: {bank} {mult > 1 && <span style={{ opacity: 0.7, fontSize: 14 }}>(×{mult})</span>}</span>
      </div>

      <div className="controls">
        <div className="label">Ovládanie moderátora</div>

        <div className="group">
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>Na ťahu:</span>
          <button className={'btn' + (active === 0 ? ' btn-blue' : '')} onClick={() => setActive(0)}>{TEAM_NAMES[0]}</button>
          <button className={'btn' + (active === 1 ? ' btn-primary' : '')} onClick={() => setActive(1)}>{TEAM_NAMES[1]}</button>
        </div>

        <div className="divider" />

        <div className="group">
          <button className="btn" onClick={addStrike} disabled={strikes >= 3}>✕ Pridať krížik ({strikes}/3)</button>
          <button className="btn btn-ghost" onClick={() => setStrikes(0)}>Vynulovať krížiky</button>
          {strikes >= 3 && !stealing && (
            <button className="btn btn-green" onClick={() => { setStealing(true); setActive(active === 0 ? 1 : 0) }}>
              🪤 Súper kradne
            </button>
          )}
          {stealing && <span style={{ color: 'var(--green)', fontWeight: 800 }}>Pokus o krádež — {TEAM_NAMES[active]}</span>}
        </div>

        <div className="divider" />

        <div className="group">
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>Joker (lifeline):</span>
          <button
            className="btn btn-ghost"
            onClick={() => useLifeline(0)}
            disabled={lifelines[0] === 0}
          >
            🃏 {TEAM_NAMES[0]} ({lifelines[0]} zostatok)
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => useLifeline(1)}
            disabled={lifelines[1] === 0}
          >
            🃏 {TEAM_NAMES[1]} ({lifelines[1]} zostatok)
          </button>
        </div>

        <div className="divider" />

        <div className="group">
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>Prideliť bank kola:</span>
          <button className="btn btn-blue" onClick={() => assign(0)}>→ {TEAM_NAMES[0]} (+{bank})</button>
          <button className="btn btn-primary" onClick={() => assign(1)}>→ {TEAM_NAMES[1]} (+{bank})</button>
        </div>

        <div className="divider" />

        <div className="group">
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>Ručná úprava:</span>
          <button className="btn btn-ghost" onClick={() => adjust(0, -5)}>T1 −5</button>
          <button className="btn btn-ghost" onClick={() => adjust(0, 5)}>T1 +5</button>
          <button className="btn btn-ghost" onClick={() => adjust(1, -5)}>T2 −5</button>
          <button className="btn btn-ghost" onClick={() => adjust(1, 5)}>T2 +5</button>
          <button className="btn btn-ghost" onClick={fullReset}>🔁 Reštart hry</button>
        </div>
      </div>
      <p className="mod-note">{allRevealed ? '✅ Celá tabuľa odhalená — prideľ bank víťazovi kola.' : 'Klikni na pole pre odhalenie odpovede.'}</p>
    </main>
  )
}

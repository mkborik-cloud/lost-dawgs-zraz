import { useMemo, useState } from 'react'
import { roundMultiplier, TOTAL_ROUNDS } from '../data/familyFeud.js'

export default function FamilyFeud({ teams, report, clearResult, questions }) {
  const FEUD_QUESTIONS = questions
  const TEAM_NAMES = teams.map((t) => t.name)
  const MEMBERS = teams.map((t) => t.members || [])
  const [phase, setPhase] = useState('pick') // pick | play | end
  const [scores, setScores] = useState([0, 0])
  const [round, setRound] = useState(1)
  const [used, setUsed] = useState(new Set())
  const [qIndex, setQIndex] = useState(null)
  const [revealed, setRevealed] = useState(new Set())
  const [strikes, setStrikes] = useState(0)
  const [active, setActive] = useState(0) // 0 = Tím 1, 1 = Tím 2
  const [stealing, setStealing] = useState(false)

  const mult = roundMultiplier(round)
  const q = qIndex == null ? null : FEUD_QUESTIONS[qIndex]

  const bank = useMemo(() => {
    if (!q) return 0
    let base = 0
    revealed.forEach((i) => { base += q.answers[i].points })
    return base * mult
  }, [q, revealed, mult])

  const allRevealed = q && revealed.size === q.answers.length

  // group questions by category for picker
  const grouped = useMemo(() => {
    const map = new Map()
    FEUD_QUESTIONS.forEach((item, i) => {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category).push({ ...item, i })
    })
    return [...map.entries()]
  }, [FEUD_QUESTIONS])

  function openQuestion(i) {
    setQIndex(i); setRevealed(new Set()); setStrikes(0); setStealing(false); setPhase('play')
  }

  function revealCell(i) {
    if (revealed.has(i)) return
    setRevealed((prev) => new Set(prev).add(i))
  }

  function addStrike() {
    setStrikes((s) => Math.min(3, s + 1))
  }

  function assign(team) {
    const newScores = [...scores]; newScores[team] += bank
    setScores(newScores)
    setUsed((prev) => new Set(prev).add(qIndex))
    const next = round + 1
    if (next > TOTAL_ROUNDS) {
      const w = newScores[0] === newScores[1] ? 'tie' : newScores[0] > newScores[1] ? 0 : 1
      report(w)
      setPhase('end')
    } else {
      setRound(next); setQIndex(null); setPhase('pick')
    }
  }

  function adjust(team, delta) {
    setScores((s) => { const n = [...s]; n[team] = Math.max(0, n[team] + delta); return n })
  }

  function fullReset() {
    setScores([0, 0]); setRound(1); setUsed(new Set()); setQIndex(null)
    setRevealed(new Set()); setStrikes(0); setActive(0); setStealing(false); setPhase('pick')
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

  /* ---------- SCOREBOARD (shared) ---------- */
  const Scoreboard = () => (
    <div className="scorebar">
      <div className={'team-score t1' + (active === 0 ? ' active' : '')}>
        <div className="ts-info">
          <span className="name" style={{ color: 'var(--t1)' }}>{TEAM_NAMES[0]}</span>
          {MEMBERS[0].length > 0 && <span className="members">{MEMBERS[0].join(' · ')}</span>}
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
        </div>
      </div>
    </div>
  )

  /* ---------- PICK ---------- */
  if (phase === 'pick') {
    return (
      <main className="page">
        <div className="page-head">
          <h1>5 proti 5 — Family Feud</h1>
          <span className="pill">Kolo {round} · ×{mult}</span>
        </div>
        <p className="page-sub">Moderátor: vyber otázku pre toto kolo. Násobič bodov sa určuje podľa čísla kola.</p>
        <Scoreboard />
        <p className="mod-note">👁️ Túto obrazovku vidí len moderátor — na TV prepni až po výbere otázky.</p>

        <div className="picker">
          {grouped.map(([cat, items]) => (
            <div className="picker-cat" key={cat}>
              <h4>{items[0].icon} {cat}</h4>
              {items.map((it) => (
                <button
                  key={it.i}
                  className={'picker-item' + (used.has(it.i) ? ' used' : '')}
                  onClick={() => openQuestion(it.i)}
                >
                  <span className="ico">{it.icon}</span>
                  <span>{it.question}</span>
                  <span className="badge">{used.has(it.i) ? '✔ hrané' : `${it.answers.length} odpovedí`}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="draft-actions" style={{ marginTop: 30 }}>
          <button className="btn btn-ghost" onClick={fullReset}>Reštartovať hru</button>
        </div>
      </main>
    )
  }

  /* ---------- PLAY ---------- */
  return (
    <main className="page page-wide">
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
          <button className="btn btn-ghost" onClick={() => { setQIndex(null); setPhase('pick') }}>← Iná otázka</button>
          <button className="btn btn-ghost" onClick={fullReset}>🔁 Reštart hry</button>
        </div>
      </div>
      <p className="mod-note">{allRevealed ? '✅ Celá tabuľa odhalená — prideľ bank víťazovi kola.' : 'Klikni na pole pre odhalenie odpovede.'}</p>
    </main>
  )
}

import { useEffect, useRef, useState } from 'react'
import { CAPTAINS, PLAYERS } from '../data/players.js'

// Do žrebovania idú všetci hráči vrátane Fudyho a Myrella
const POOL = [...CAPTAINS, ...PLAYERS]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TeamDraft({ setTeams }) {
  const [excluded, setExcluded] = useState(new Set())
  const [names, setNames] = useState(['Tím 1', 'Tím 2']) // vlastné názvy tímov
  const [teamA, setTeamA] = useState([])
  const [teamB, setTeamB] = useState([])
  const [drawing, setDrawing] = useState(false)
  const [reveal, setReveal] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [locked, setLocked] = useState(false)
  const [targetTeam, setTargetTeam] = useState(0)
  const [spinTick, setSpinTick] = useState(0)
  const [done, setDone] = useState(false)
  const [muted, setMuted] = useState(false)
  const timer = useRef(null)
  const audioRef = useRef(null)
  const mutedRef = useRef(false)

  const active = POOL.filter((p) => !excluded.has(p))

  function clearTimers() { clearInterval(timer.current); clearTimeout(timer.current) }
  useEffect(() => () => clearTimers(), [])
  useEffect(() => { mutedRef.current = muted }, [muted])

  // ----- Web Audio (syntetizované zvuky) -----
  function getCtx() {
    if (!audioRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext
      audioRef.current = new AC()
    }
    if (audioRef.current.state === 'suspended') audioRef.current.resume()
    return audioRef.current
  }
  function playTick() {
    if (mutedRef.current) return
    const ctx = getCtx(); const t = ctx.currentTime
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.type = 'square'; o.frequency.value = 480 + Math.random() * 160
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.06)
  }
  function playLock(team) {
    if (mutedRef.current) return
    const ctx = getCtx()
    const freqs = team === 0 ? [660, 988] : [587, 880]
    freqs.forEach((f, idx) => {
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = 'triangle'; o.frequency.value = f
      const t = ctx.currentTime + idx * 0.06
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34)
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.36)
    })
  }
  function playFanfare() {
    if (mutedRef.current) return
    const ctx = getCtx()
    ;[523, 659, 784, 1047].forEach((f, idx) => {
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = 'triangle'; o.frequency.value = f
      const t = ctx.currentTime + idx * 0.1
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.52)
    })
  }

  function toggle(p) {
    if (drawing || done) return
    setExcluded((prev) => {
      const next = new Set(prev)
      next.has(p) ? next.delete(p) : next.add(p)
      return next
    })
  }

  // Náhodné rozdelenie so zaručenou podmienkou: Fudy a Myrell nie sú v tom istom tíme
  function buildTeams() {
    const rest = shuffle(active.filter((p) => p !== 'Fudy' && p !== 'Myrell'))
    const A = [], B = []
    const hasF = active.includes('Fudy'), hasM = active.includes('Myrell')
    if (hasF && hasM) {
      if (Math.random() < 0.5) { A.push('Fudy'); B.push('Myrell') }
      else { A.push('Myrell'); B.push('Fudy') }
    } else if (hasF) { (Math.random() < 0.5 ? A : B).push('Fudy') }
    else if (hasM) { (Math.random() < 0.5 ? A : B).push('Myrell') }
    for (const p of rest) {
      if (A.length < B.length) A.push(p)
      else if (B.length < A.length) B.push(p)
      else (Math.random() < 0.5 ? A : B).push(p)
    }
    return { A, B }
  }

  function draw() {
    clearTimers()
    getCtx() // odomkni audio na kliknutie
    const { A, B } = buildTeams()
    // poradie odhaľovania: striedavo A, B
    const seq = []
    const maxLen = Math.max(A.length, B.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < A.length) seq.push({ name: A[i], team: 0 })
      if (i < B.length) seq.push({ name: B[i], team: 1 })
    }
    setTeamA([]); setTeamB([]); setDone(false); setDrawing(true); setReveal(''); setLocked(false)
    let i = 0

    const step = () => {
      if (i >= seq.length) {
        setDrawing(false); setSpinning(false); setLocked(false); setDone(true); setReveal('')
        setTeams([
          { name: names[0].trim() || 'Tím 1', members: A, color: 't1' },
          { name: names[1].trim() || 'Tím 2', members: B, color: 't2' },
        ])
        playFanfare()
        return
      }
      const { name, team } = seq[i]
      setTargetTeam(team)
      setSpinning(true); setLocked(false)
      const totalSpins = 13 + Math.floor(Math.random() * 5)
      let s = 0
      const tick = () => {
        setReveal(active[Math.floor(Math.random() * active.length)])
        setSpinTick((n) => n + 1)
        playTick()
        s++
        if (s >= totalSpins) {
          setReveal(name); setSpinTick((n) => n + 1)
          setSpinning(false); setLocked(true)
          playLock(team)
          if (team === 0) setTeamA((t) => [...t, name])
          else setTeamB((t) => [...t, name])
          i++
          timer.current = setTimeout(() => { setLocked(false); step() }, 460)
          return
        }
        // plynulejšie spomaľovanie: pomalší štart (~70 ms) a jemný ease-out do ~260 ms
        const p = s / totalSpins
        const delay = 70 + Math.pow(p, 2) * 190
        timer.current = setTimeout(tick, delay)
      }
      tick()
    }
    step()
  }

  function reset() {
    clearTimers()
    setTeamA([]); setTeamB([]); setDrawing(false); setDone(false); setReveal('')
    setSpinning(false); setLocked(false)
    setTeams([
      { name: 'Tím 1', members: [], color: 't1' },
      { name: 'Tím 2', members: [], color: 't2' },
    ])
  }

  const started = drawing || done
  const displayNames = [names[0].trim() || 'Tím 1', names[1].trim() || 'Tím 2']

  return (
    <main className="page">
      <div className="page-head">
        <h1>Rozdelenie tímov</h1>
        <span className="pill">🎲 Losovanie</span>
      </div>

      {!started && (
        <>
          <p className="section-label" style={{ textAlign: 'center' }}>Názvy tímov</p>
          <div className="name-inputs" style={{ justifyContent: 'center' }}>
            <input
              className="cfg-input" style={{ maxWidth: 260 }}
              value={names[0]} onChange={(e) => setNames([e.target.value, names[1]])}
              placeholder="Tím 1"
            />
            <span className="vs" style={{ color: 'var(--muted)', fontWeight: 800 }}>vs</span>
            <input
              className="cfg-input" style={{ maxWidth: 260 }}
              value={names[1]} onChange={(e) => setNames([names[0], e.target.value])}
              placeholder="Tím 2"
            />
          </div>

          <p className="section-label" style={{ marginTop: 22 }}>Hráči v žrebovaní ({active.length})</p>
          <div className="pool">
            {POOL.map((p) => (
              <button
                key={p}
                className={'pool-chip' + (excluded.has(p) ? ' picked' : '')}
                onClick={() => toggle(p)}
                title={excluded.has(p) ? 'Klikni pre pridanie' : 'Klikni pre vyradenie'}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="draft-actions">
            <button className="btn btn-primary btn-xl" onClick={draw} disabled={active.length < 2}>
              🎲 Generovať
            </button>
            <button className="btn btn-lg" onClick={() => setMuted((m) => !m)} title="Zvuk losovania">
              {muted ? '🔇 Zvuk vyp.' : '🔊 Zvuk zap.'}
            </button>
          </div>
        </>
      )}

      {started && (
        <>
          {done ? (
            <div className="reveal-name done">✅ Tímy sú rozdelené!</div>
          ) : (
            <div className="slot">
              <div className="slot-target" style={{ color: targetTeam === 0 ? 'var(--t1)' : 'var(--t2)' }}>
                {drawing ? <>→ do tímu <b>{displayNames[targetTeam]}</b></> : ' '}
              </div>
              <div
                className={'slot-name' + (spinning ? ' spinning' : '') + (locked ? ' locked' : '')}
                style={{ color: locked ? (targetTeam === 0 ? 'var(--t1)' : 'var(--t2)') : 'var(--white)' }}
              >
                <span className="slot-val" key={spinTick}>{reveal || '—'}</span>
              </div>
            </div>
          )}
          <div className="draft-grid">
            <div className="draft-team a">
              <div className="cap">
                <span className="crown">🔵</span>
                <div>
                  <div className="nm">{displayNames[0]}</div>
                  <div className="role">Tím 1</div>
                </div>
                <div className="spacer" style={{ flex: 1 }} />
                <span className="num" style={{ position: 'static', color: 'var(--t1)', fontSize: 30 }}>
                  {teamA.length}
                </span>
              </div>
              <div className="draft-list">
                {teamA.map((m, i) => (
                  <div className="draft-member" key={m}>
                    <span className="idx">{i + 1}</span> {m}
                  </div>
                ))}
              </div>
            </div>

            <div className="draft-team b">
              <div className="cap">
                <span className="crown">🔴</span>
                <div>
                  <div className="nm">{displayNames[1]}</div>
                  <div className="role">Tím 2</div>
                </div>
                <div className="spacer" style={{ flex: 1 }} />
                <span className="num" style={{ position: 'static', color: 'var(--t2)', fontSize: 30 }}>
                  {teamB.length}
                </span>
              </div>
              <div className="draft-list">
                {teamB.map((m, i) => (
                  <div className="draft-member" key={m}>
                    <span className="idx">{i + 1}</span> {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="draft-actions" style={{ marginTop: 26 }}>
            <button className="btn btn-primary btn-lg" onClick={draw} disabled={drawing}>
              🔁 Losovať znova
            </button>
            <button className="btn btn-lg" onClick={reset} disabled={drawing}>
              Upraviť hráčov
            </button>
          </div>
        </>
      )}
    </main>
  )
}

import { useEffect, useRef, useState } from 'react'
import { CAPTAINS, PLAYERS } from '../data/players.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TeamDraft({ setTeams }) {
  // Predvolene sú v žrebovaní všetci hráči; moderátor môže ktoréhokoľvek vyradiť klikom
  const [excluded, setExcluded] = useState(new Set())
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

  const active = PLAYERS.filter((p) => !excluded.has(p))

  function clearTimers() { clearInterval(timer.current); clearTimeout(timer.current) }
  useEffect(() => () => clearTimers(), [])
  useEffect(() => { mutedRef.current = muted }, [muted])

  // ----- Web Audio (syntetizované zvuky, žiadne súbory) -----
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
    const freqs = team === 0 ? [660, 988] : [587, 880] // dve noty, podľa tímu
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

  function draw() {
    clearTimers()
    getCtx() // odomkni audio na kliknutie (user gesture)
    const order = shuffle(active)
    setTeamA([]); setTeamB([]); setDone(false); setDrawing(true); setReveal(''); setLocked(false)
    let i = 0

    // jeden los = roztočenie reelu, ktoré sa plynulo spomaľuje (ease-out), potom zacvakne vybraný hráč
    const step = () => {
      if (i >= order.length) {
        setDrawing(false); setSpinning(false); setLocked(false); setDone(true); setReveal('')
        const a = order.filter((_, idx) => idx % 2 === 0)
        const b = order.filter((_, idx) => idx % 2 === 1)
        setTeams([
          { name: CAPTAINS[0], captain: CAPTAINS[0], members: a, color: 't1' },
          { name: CAPTAINS[1], captain: CAPTAINS[1], members: b, color: 't2' },
        ])
        playFanfare()
        return
      }
      setTargetTeam(i % 2)
      setSpinning(true); setLocked(false)
      const totalSpins = 9 + Math.floor(Math.random() * 4)
      let s = 0
      const tick = () => {
        setReveal(active[Math.floor(Math.random() * active.length)])
        setSpinTick((n) => n + 1)
        playTick()
        s++
        if (s >= totalSpins) {
          const name = order[i]
          setReveal(name); setSpinTick((n) => n + 1)
          setSpinning(false); setLocked(true)
          playLock(i % 2)
          if (i % 2 === 0) setTeamA((t) => [...t, name])
          else setTeamB((t) => [...t, name])
          i++
          timer.current = setTimeout(() => { setLocked(false); step() }, 340)
          return
        }
        // ease-out: rýchlo na začiatku (~32 ms), postupne spomalí (~135 ms) na konci
        const p = s / totalSpins
        const delay = 32 + Math.pow(p, 2.3) * 105
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
      { name: CAPTAINS[0], captain: CAPTAINS[0], members: [], color: 't1' },
      { name: CAPTAINS[1], captain: CAPTAINS[1], members: [], color: 't2' },
    ])
  }

  const started = drawing || done

  return (
    <main className="page">
      <div className="page-head">
        <h1>Rozdelenie tímov</h1>
        <span className="pill">🎲 Losovanie</span>
      </div>
      <p className="page-sub">
        Kapitáni sú pevne dané — <b>Fudy</b> a <b>Myrell</b>. Ostatní hráči sa rozdelia náhodne,
        striedavo do oboch tímov. Pred losovaním môžeš vyradiť hráča (napr. neistú účasť).
      </p>

      {!started && (
        <>
          <p className="section-label">Hráči v žrebovaní ({active.length})</p>
          <div className="pool">
            {PLAYERS.map((p) => (
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
              🎲 Vylosovať tímy
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
                {drawing ? <>→ do tímu <b>{CAPTAINS[targetTeam]}</b></> : ' '}
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
                <span className="crown">👑</span>
                <div>
                  <div className="nm">{CAPTAINS[0]}</div>
                  <div className="role">Kapitán · Tím 1</div>
                </div>
                <div className="spacer" style={{ flex: 1 }} />
                <span className="num" style={{ position: 'static', color: 'var(--t1)', fontSize: 30 }}>
                  {teamA.length + 1}
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
                <span className="crown">👑</span>
                <div>
                  <div className="nm">{CAPTAINS[1]}</div>
                  <div className="role">Kapitán · Tím 2</div>
                </div>
                <div className="spacer" style={{ flex: 1 }} />
                <span className="num" style={{ position: 'static', color: 'var(--t2)', fontSize: 30 }}>
                  {teamB.length + 1}
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

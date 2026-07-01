import { useEffect, useRef, useState } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function VerteNeverte({ teams, report, clearResult, statements, active }) {
  const VN_STATEMENTS = statements
  const TEAM_NAMES = teams.map((t) => t.name)
  const MEMBERS = teams.map((t) => t.members || [])

  const [deck, setDeck] = useState(() => shuffle(VN_STATEMENTS))
  const [pos, setPos] = useState(0)
  const [scores, setScores] = useState([0, 0])
  const [revealed, setRevealed] = useState(false)
  const [phase, setPhase] = useState('play') // play | end
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const audioRef = useRef(null)

  // Hudba na pozadí (loop) — hrá, len keď je Verte/Neverte aktívna obrazovka
  useEffect(() => {
    const a = new Audio('/verte-neverte-theme.mp3')
    a.loop = true
    a.volume = 0.4
    audioRef.current = a
    return () => { a.pause(); audioRef.current = null }
  }, [])
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (active && !muted) a.play().catch(() => {})
    else a.pause()
  }, [active, muted])
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])

  const total = deck.length
  const cur = deck[pos]

  const musicBtn = (
    <span className="vn-music-ctrl">
      <button className="btn btn-ghost" onClick={() => setMuted((m) => !m)} title="Hudba na pozadí">
        {muted || volume === 0 ? '🔇' : '🎵'} Hudba
      </button>
      <input
        type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
        onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false) }}
        title="Hlasitosť hudby"
      />
    </span>
  )

  function award(which) {
    // which: 0 = Tím 1, 1 = Tím 2, 'both' = obaja, null = nikto
    const n = [...scores]
    if (which === 0) n[0]++
    else if (which === 1) n[1]++
    else if (which === 'both') { n[0]++; n[1]++ }
    setScores(n)
    advance(n)
  }

  function advance(currentScores) {
    setRevealed(false)
    if (pos + 1 >= total) {
      const w = currentScores[0] === currentScores[1] ? 'tie' : currentScores[0] > currentScores[1] ? 0 : 1
      report(w); setPhase('end'); return
    }
    setPos((p) => p + 1)
  }

  function restart() {
    setDeck(shuffle(VN_STATEMENTS)); setPos(0); setScores([0, 0]); setRevealed(false); setPhase('play')
    clearResult()
  }

  /* ---------- END ---------- */
  if (phase === 'end') {
    const winner = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1
    return (
      <main className="page">
        <div className="vn-wrap">
          <h1 style={{ fontSize: 52 }}>Koniec!</h1>
          <div className="vn-card">
            <div className="vn-cat">Celkový víťaz</div>
            <div className="vn-verdict ok" style={{ fontSize: 56, color: winner == null ? 'var(--gold)' : winner === 0 ? 'var(--t1)' : 'var(--t2)' }}>
              {winner == null ? '🤝 Remíza!' : `🏆 ${TEAM_NAMES[winner]}`}
            </div>
            <div style={{ display: 'flex', gap: 40, marginTop: 10 }}>
              <div><div className="vn-cat">{TEAM_NAMES[0]}</div><div className="pts" style={{ fontSize: 44, color: 'var(--t1)', fontWeight: 900 }}>{scores[0]}</div></div>
              <div><div className="vn-cat">{TEAM_NAMES[1]}</div><div className="pts" style={{ fontSize: 44, color: 'var(--t2)', fontWeight: 900 }}>{scores[1]}</div></div>
            </div>
          </div>
          <div className="draft-actions" style={{ marginTop: 24 }}>
            <button className="btn btn-primary btn-xl" onClick={restart}>🔁 Hrať znova</button>
            {musicBtn}
          </div>
        </div>
      </main>
    )
  }

  /* ---------- PLAY ---------- */
  if (!cur) {
    return (
      <main className="page">
        <div className="vn-wrap" style={{ textAlign: 'center' }}>
          <h1>🤔 Verte alebo Neverte</h1>
          <p className="page-sub" style={{ marginTop: 20 }}>Žiadne tvrdenia. Pridaj ich cez ⚙️ Nastavenia.</p>
          <button className="btn btn-primary btn-lg" onClick={restart}>🔁 Načítať znova</button>
        </div>
      </main>
    )
  }
  return (
    <main className="page">
      <div className="page-head" style={{ justifyContent: 'center' }}>
        <img className="title-emote" src="/emotes/tomkoDawg.png" alt="" />
        <h1>Verte alebo Neverte</h1>
      </div>

      <div className="scorebar">
        <div className="team-score t1">
          <div className="ts-info">
            <span className="name" style={{ color: 'var(--t1)' }}>{TEAM_NAMES[0]}</span>
            {MEMBERS[0].length > 0 && <span className="members">{MEMBERS[0].join(' · ')}</span>}
          </div>
          <span className="pts">{scores[0]}</span>
        </div>
        <div className="mid">
          <span className="vs">TVRDENIE</span>
          <span style={{ fontSize: 28, fontWeight: 900 }}>{pos + 1}<span style={{ color: 'var(--muted)', fontSize: 16 }}>/{total}</span></span>
        </div>
        <div className="team-score t2">
          <span className="pts">{scores[1]}</span>
          <div className="ts-info">
            <span className="name" style={{ color: 'var(--t2)' }}>{TEAM_NAMES[1]}</span>
            {MEMBERS[1].length > 0 && <span className="members">{MEMBERS[1].join(' · ')}</span>}
          </div>
        </div>
      </div>

      <div className="vn-bar"><div style={{ width: `${((pos + (revealed ? 1 : 0)) / total) * 100}%` }} /></div>

      <div className="vn-wrap">
        <div className="vn-card">
          <div className="vn-cat">{cur.icon} {cur.category}</div>
          <div className="vn-text">„{cur.text}"</div>

          {!revealed ? (
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <span className="chip" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>👍 VERÍM</span>
              <span className="chip" style={{ borderColor: 'var(--red-bright)', color: 'var(--red-bright)' }}>👎 NEVERÍM</span>
            </div>
          ) : (
            <div className="vn-reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div className="vn-truth" style={{ fontSize: 30, color: cur.truth ? 'var(--green)' : 'var(--red-bright)' }}>
                {cur.truth ? '✅ PRAVDA (VERÍM)' : '❌ BLUD (NEVERÍM)'}
              </div>
              <div className="vn-expl">{cur.explanation}</div>
            </div>
          )}
        </div>

        <div className="controls" style={{ marginTop: 22 }}>
          <div className="label">Ovládanie moderátora</div>
          {!revealed ? (
            <button className="btn btn-primary btn-lg" onClick={() => setRevealed(true)}>👁️ Odhaliť pravdu</button>
          ) : (
            <div className="group">
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>Bod pre:</span>
              <button className="btn btn-blue" onClick={() => award(0)}>{TEAM_NAMES[0]}</button>
              <button className="btn btn-primary" onClick={() => award(1)}>{TEAM_NAMES[1]}</button>
              <button className="btn btn-green" onClick={() => award('both')}>Obaja +1</button>
              <button className="btn" onClick={() => award(null)}>Nikto</button>
            </div>
          )}
          <div className="divider" />
          <div className="group">
            <button className="btn btn-ghost" onClick={() => advance(scores)}>Preskočiť →</button>
            <button className="btn btn-green" onClick={() => advance(scores)} style={{ display: pos + 1 >= total ? 'inline-flex' : 'none' }}>🏁 Vyhodnotiť</button>
            <button className="btn btn-ghost" onClick={restart}>🔁 Reštartovať hru</button>
            {musicBtn}
          </div>
        </div>
        <p className="mod-note">Tímy sa rozhodnú VERÍM / NEVERÍM, moderátor odhalí pravdu a pridelí bod.</p>
      </div>
    </main>
  )
}

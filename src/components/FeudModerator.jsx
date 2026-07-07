import { useEffect, useRef, useState } from 'react'

// Samostatné moderátorské okno pre 5 proti 5 — CELÉ ovládanie hry.
// Synchronizované s hlavným oknom (projektor) cez BroadcastChannel.
export default function FeudModerator() {
  const [s, setS] = useState(null) // stav hry z hlavného okna
  const chanRef = useRef(null)

  useEffect(() => {
    const ch = new BroadcastChannel('lostdawgs-feud')
    chanRef.current = ch
    ch.onmessage = (e) => { if (e.data?.type === 'state') setS(e.data.state) }
    ch.postMessage({ type: 'hello' })
    const iv = setInterval(() => { if (!chanRef.current) return; ch.postMessage({ type: 'hello' }) }, 1500)
    return () => { clearInterval(iv); ch.close() }
  }, [])

  const send = (type, extra) => chanRef.current?.postMessage({ type, ...extra })

  const names = s?.teamNames || ['Tím 1', 'Tím 2']
  const scores = s?.scores || [0, 0]
  const revealedSet = new Set(s?.revealed || [])

  if (!s) {
    return (
      <div className="feud-mod-page">
        <div className="feud-mod-head"><span className="fm-title">🔎 Moderátor · 5 proti 5</span></div>
        <p className="fm-wait">Čakám na hru… Otvor v hlavnom okne <b>5 proti 5</b>.</p>
      </div>
    )
  }

  return (
    <div className="feud-mod-page">
      <div className="feud-mod-head">
        <span className="fm-title">🔎 Moderátor · 5 proti 5</span>
        <span className="fm-meta">
          Kolo {s.round}/{s.totalRounds} · násobič ×{s.mult} ·{' '}
          <b style={{ color: 'var(--t1)' }}>{names[0]} {scores[0]}</b> : <b style={{ color: 'var(--t2)' }}>{scores[1]} {names[1]}</b>
        </span>
      </div>

      {/* ---- INTRO (štart kola) ---- */}
      {s.phase === 'intro' && (
        <div className="fm-block" style={{ textAlign: 'center' }}>
          <div className="feud-intro-round" style={{ fontSize: 34 }}>Kolo {s.round} <span>/ {s.totalRounds}</span></div>
          <p className="fm-hint">Na hlavnej obrazovke je „Štart kola" (nech k nemu prídu hráči). Vieš ho spustiť aj odtiaľto:</p>
          <button className="btn btn-primary btn-xl" onClick={() => send('startRound')}>🎬 Štart kola {s.round}</button>
        </div>
      )}

      {/* ---- KONIEC ---- */}
      {s.phase === 'end' && (
        <div className="fm-block" style={{ textAlign: 'center' }}>
          <div className="fm-title" style={{ fontSize: 30, color: 'var(--green)' }}>
            {scores[0] === scores[1] ? '🤝 Remíza' : `🏆 ${scores[0] > scores[1] ? names[0] : names[1]}`}
          </div>
          <button className="btn btn-primary btn-lg" style={{ marginTop: 16 }} onClick={() => send('reset')}>🔁 Hrať znova</button>
        </div>
      )}

      {/* ---- HRA ---- */}
      {s.phase === 'play' && s.answers && (
        <>
          <div className="feud-mod-question">
            <span className="cat">{s.icon} {s.category}</span>
            {s.question}
          </div>

          <div className="fm-row-info">
            <span className="bank-pill">💰 Bank: {s.bank}{s.mult > 1 ? ` (×${s.mult})` : ''}{s.stealing ? ' 🧊' : ''}</span>
            <span className="fm-strikes">Krížiky: {'✕'.repeat(s.strikes) || '—'} ({s.strikes}/3)</span>
            {s.stealing && <span style={{ color: 'var(--green)', fontWeight: 800 }}>🪤 Krádež — {names[s.active]}</span>}
          </div>

          <p className="fm-hint">Klikni na odpoveď → odhalí sa na tabuli (projektore). Klik na odhalenú ju skryje a body sa odrátajú z banku.</p>
          <div className="mod-answers fm-answers">
            {s.answers.map((a, i) => (
              <button
                key={i}
                className={'mod-answer' + (revealedSet.has(i) ? ' done' : '')}
                onClick={() => send(revealedSet.has(i) ? 'hide' : 'reveal', { index: i })}
                title={revealedSet.has(i) ? 'Skryť odpoveď (odráta body z banku)' : 'Odhaliť odpoveď'}
              >
                <span className="pos">{i + 1}</span>
                <span className="txt">{a.text}</span>
                <span className="pts">{a.points}</span>
              </button>
            ))}
          </div>

          <div className="controls" style={{ marginTop: 20 }}>
            <div className="label">Ovládanie moderátora</div>

            <div className="group">
              <span className="fm-lbl">Na ťahu:</span>
              <button className={'btn' + (s.active === 0 ? ' btn-blue' : '')} onClick={() => send('setActive', { team: 0 })}>{names[0]}</button>
              <button className={'btn' + (s.active === 1 ? ' btn-primary' : '')} onClick={() => send('setActive', { team: 1 })}>{names[1]}</button>
            </div>

            <div className="divider" />

            <div className="group">
              <button className="btn" onClick={() => send('addStrike')} disabled={s.strikes >= 3}>✕ Pridať krížik ({s.strikes}/3)</button>
              <button className="btn btn-ghost" onClick={() => send('clearStrikes')}>Vynulovať krížiky</button>
              {s.strikes >= 3 && !s.stealing && <button className="btn btn-green" onClick={() => send('steal')}>🪤 Súper kradne</button>}
            </div>

            <div className="divider" />

            <div className="group">
              <span className="fm-lbl">Joker:</span>
              <button className="btn btn-ghost" onClick={() => send('useLifeline', { team: 0 })} disabled={s.lifelines?.[0] === 0}>🃏 {names[0]} ({s.lifelines?.[0]})</button>
              <button className="btn btn-ghost" onClick={() => send('useLifeline', { team: 1 })} disabled={s.lifelines?.[1] === 0}>🃏 {names[1]} ({s.lifelines?.[1]})</button>
            </div>

            <div className="divider" />

            <div className="group">
              <span className="fm-lbl">Prideliť bank kola:</span>
              <button className="btn btn-blue" onClick={() => send('assign', { team: 0 })}>→ {names[0]} (+{s.bank})</button>
              <button className="btn btn-primary" onClick={() => send('assign', { team: 1 })}>→ {names[1]} (+{s.bank})</button>
            </div>

            <div className="divider" />

            <div className="group">
              <span className="fm-lbl">Ručná úprava:</span>
              <button className="btn btn-ghost" onClick={() => send('adjust', { team: 0, delta: -5 })}>T1 −5</button>
              <button className="btn btn-ghost" onClick={() => send('adjust', { team: 0, delta: 5 })}>T1 +5</button>
              <button className="btn btn-ghost" onClick={() => send('adjust', { team: 1, delta: -5 })}>T2 −5</button>
              <button className="btn btn-ghost" onClick={() => send('adjust', { team: 1, delta: 5 })}>T2 +5</button>
              <button className="btn btn-ghost" onClick={() => send('reset')}>🔁 Reštart hry</button>
            </div>
          </div>
          {s.allRevealed && <p className="mod-note" style={{ marginTop: 8 }}>✅ Celá tabuľa odhalená — prideľ bank víťazovi kola.</p>}
        </>
      )}
    </div>
  )
}

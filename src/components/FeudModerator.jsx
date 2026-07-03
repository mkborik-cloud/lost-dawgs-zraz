import { useEffect, useRef, useState } from 'react'

// Samostatné moderátorské okno pre 5 proti 5 — synchronizované s hlavným oknom
// cez BroadcastChannel. Hlavné okno ide na projektor, toto na laptop moderátora.
export default function FeudModerator() {
  const [state, setState] = useState(null)
  const chanRef = useRef(null)

  useEffect(() => {
    const ch = new BroadcastChannel('lostdawgs-feud')
    chanRef.current = ch
    ch.onmessage = (e) => {
      if (e.data?.type === 'state') setState(e.data.state)
    }
    ch.postMessage({ type: 'hello' }) // vyžiadaj aktuálny stav
    // pre istotu ešte párkrát požiadaj, kým hlavné okno neodpovie
    const iv = setInterval(() => { if (!state) ch.postMessage({ type: 'hello' }) }, 1000)
    return () => { clearInterval(iv); ch.close() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function reveal(i) {
    chanRef.current?.postMessage({ type: 'reveal', index: i })
  }

  const revealedSet = new Set(state?.revealed || [])

  return (
    <div className="feud-mod-page">
      <div className="feud-mod-head">
        <span className="fm-title">🔎 Moderátor · 5 proti 5</span>
        {state ? (
          <span className="fm-meta">Kolo {state.round}/{state.totalRounds} · ×{state.mult} · {state.teamNames?.[0]} {state.scores?.[0]} : {state.scores?.[1]} {state.teamNames?.[1]}</span>
        ) : (
          <span className="fm-meta">Čakám na hru… (nechaj hlavné okno otvorené na 5 proti 5)</span>
        )}
      </div>

      {!state || !state.answers ? (
        <p className="fm-wait">Otvor v hlavnom okne <b>5 proti 5</b> a vyber otázku. Odpovede sa tu zobrazia.</p>
      ) : (
        <>
          <div className="feud-mod-question">
            <span className="cat">{state.icon} {state.category}</span>
            {state.question}
          </div>
          <p className="fm-hint">Klikni na odpoveď pre jej odhalenie na tabuli (projektore).</p>
          <div className="mod-answers fm-answers">
            {state.answers.map((a, i) => (
              <button
                key={i}
                className={'mod-answer' + (revealedSet.has(i) ? ' done' : '')}
                onClick={() => reveal(i)}
                title={revealedSet.has(i) ? 'Už odhalené' : 'Klikni pre odhalenie na tabuli'}
              >
                <span className="pos">{i + 1}</span>
                <span className="txt">{a.text}</span>
                <span className="pts">{a.points}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

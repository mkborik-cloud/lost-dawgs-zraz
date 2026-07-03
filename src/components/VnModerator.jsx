import { useModeratorClient } from '../utils/moderatorSync.js'

export default function VnModerator() {
  const [s, send] = useModeratorClient('lostdawgs-vn')

  if (!s) {
    return (
      <div className="feud-mod-page">
        <div className="feud-mod-head"><span className="fm-title">🔎 Moderátor · Verte / Neverte</span></div>
        <p className="fm-wait">Čakám na hru… Otvor v hlavnom okne <b>Verte alebo Neverte</b>.</p>
      </div>
    )
  }

  const names = s.teamNames || ['Tím 1', 'Tím 2']
  const scores = s.scores || [0, 0]
  const cur = s.cur

  return (
    <div className="feud-mod-page">
      <div className="feud-mod-head">
        <span className="fm-title">🔎 Moderátor · Verte / Neverte</span>
        <span className="fm-meta">
          Tvrdenie {s.pos + 1}/{s.total} ·{' '}
          <b style={{ color: 'var(--t1)' }}>{names[0]} {scores[0]}</b> : <b style={{ color: 'var(--t2)' }}>{scores[1]} {names[1]}</b>
        </span>
      </div>

      {s.phase === 'end' ? (
        <div className="fm-block" style={{ textAlign: 'center' }}>
          <div className="fm-title" style={{ fontSize: 30, color: 'var(--green)' }}>
            {scores[0] === scores[1] ? '🤝 Remíza' : `🏆 ${scores[0] > scores[1] ? names[0] : names[1]}`}
          </div>
          <div className="draft-actions" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button className="btn btn-lg" onClick={() => send('cont')}>← Pokračovať</button>
            <button className="btn btn-primary btn-lg" onClick={() => send('restart')}>🔁 Hrať znova</button>
          </div>
        </div>
      ) : !cur ? (
        <p className="fm-wait">Žiadne tvrdenia. Pridaj ich cez ⚙️ Nastavenia v hlavnom okne.</p>
      ) : (
        <>
          <div className="vn-card" style={{ marginBottom: 16 }}>
            <div className="vn-cat vn-cat-lg">{cur.icon} {cur.category}</div>
            <div className="vn-text">„{cur.text}"</div>
            <div className="mod-answer" style={{ marginTop: 10 }}>
              <div className="vn-truth" style={{ fontSize: 26, color: cur.truth ? 'var(--green)' : 'var(--red-bright)' }}>
                {cur.truth ? '✅ PRAVDA (VERÍM)' : '❌ BLUD (NEVERÍM)'}
              </div>
              <div className="vn-expl" style={{ marginTop: 6 }}>{cur.explanation}</div>
            </div>
            <div className={'fm-reveal-badge ' + (s.revealed ? 'on' : 'off')} style={{ marginTop: 10 }}>
              {s.revealed ? '👁️ Pravda odhalená na projektore' : '🙈 Skryté na projektore'}
            </div>
          </div>

          <div className="controls">
            <div className="label">Ovládanie moderátora</div>
            {!s.revealed ? (
              <button className="btn btn-primary btn-lg" onClick={() => send('reveal')}>👁️ Odhaliť pravdu (na projektore)</button>
            ) : (
              <div className="group">
                <span className="fm-lbl">Bod pre:</span>
                <button className="btn btn-blue" onClick={() => send('award', { which: 0 })}>{names[0]}</button>
                <button className="btn btn-primary" onClick={() => send('award', { which: 1 })}>{names[1]}</button>
                <button className="btn btn-green" onClick={() => send('award', { which: 'both' })}>Obaja +1</button>
                <button className="btn" onClick={() => send('award', { which: null })}>Nikto</button>
              </div>
            )}
            <div className="divider" />
            <div className="group">
              <button className="btn btn-ghost" onClick={() => send('skip')}>Preskočiť →</button>
              {s.isLast && <button className="btn btn-green" onClick={() => send('skip')}>🏁 Vyhodnotiť</button>}
              <button className="btn btn-ghost" onClick={() => send('restart')}>🔁 Reštartovať hru</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

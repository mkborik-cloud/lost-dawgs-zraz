import { useModeratorClient } from '../utils/moderatorSync.js'
import { AZ_ROWS } from '../data/azquiz.js'

const FREE = -1, BLOCKED = -2

export default function AzModerator() {
  const [s, send] = useModeratorClient('lostdawgs-az')

  if (!s) {
    return (
      <div className="feud-mod-page">
        <div className="feud-mod-head"><span className="fm-title">🔎 Moderátor · AZ Kvíz</span></div>
        <p className="fm-wait">Čakám na hru… Otvor v hlavnom okne <b>AZ Kvíz</b>.</p>
      </div>
    )
  }

  const teams = s.teams || [{ name: 'Tím 1', color: '#4d8df0' }, { name: 'Tím 2', color: '#f0404a' }]
  const counts = s.counts || [0, 0]
  const owner = s.owner || {}
  const m = s.modal

  return (
    <div className="feud-mod-page">
      <div className="feud-mod-head">
        <span className="fm-title">🔎 Moderátor · AZ Kvíz</span>
        <span className="fm-meta">
          {teams.map((t, i) => (
            <b key={i} style={{ color: t.color, marginRight: 10 }}>{t.name} {counts[i]}</b>
          ))}
        </span>
      </div>

      {/* SETUP */}
      {s.phase === 'setup' && (
        <div className="fm-block">
          <p className="section-label">Herný mód</p>
          <div className="group" style={{ marginBottom: 12 }}>
            <button className={'btn' + (s.mode === 'classic' ? ' btn-primary' : '')} onClick={() => send('setMode', { mode: 'classic' })}>Spoj 3 strany</button>
            <button className={'btn' + (s.mode === 'rychlovka' ? ' btn-primary' : '')} onClick={() => send('setMode', { mode: 'rychlovka' })}>Rýchlovka</button>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => send('start')}>Spustiť hru →</button>
        </div>
      )}

      {/* END */}
      {s.phase === 'end' && (
        <div className="fm-block" style={{ textAlign: 'center' }}>
          <div className="fm-title" style={{ fontSize: 30, color: teams[s.winner]?.color }}>🏆 {teams[s.winner]?.name}</div>
          <div className="draft-actions" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button className="btn btn-primary btn-lg" onClick={() => send('start')}>🔁 Nová hra</button>
            <button className="btn btn-lg" onClick={() => send('reset')}>Upraviť nastavenie</button>
          </div>
        </div>
      )}

      {/* PLAY */}
      {s.phase === 'play' && (
        <>
          <div className="az-turn" style={{ marginBottom: 12 }}>
            {teams.map((t, i) => (
              <button key={i} className={'turn-pill' + (s.turn === i ? ' active' : '')} style={s.turn === i ? { borderColor: t.color } : {}} onClick={() => send('setTurn', { team: i })}>
                <span className="dot" style={{ background: t.color }} />
                {t.name} <span style={{ color: 'var(--muted)', fontWeight: 700 }}>· {counts[i]}</span>
                {s.turn === i && <span style={{ color: t.color }}>← na ťahu</span>}
              </button>
            ))}
          </div>

          {/* OTÁZKA (modál) — moderátor vidí odpoveď */}
          {m ? (
            <div className="fm-block">
              <div className="q-cat">{m.icon} {m.label} · políčko {m.cell} · {m.difficulty === 'hard' ? '🔴 ťažká' : '🟢 ľahká'}</div>
              <div className="q-text" style={{ fontSize: 22 }}>{m.q}</div>
              <div className="az-timer" style={{ margin: '10px 0' }}>
                <div className="az-timer-num" style={{ fontSize: 30 }}>{s.timeLeft}<span>s</span></div>
                <div className="az-timer-bar"><div style={{ width: `${(s.timeLeft / s.answerTime) * 100}%` }} /></div>
              </div>
              <div className="q-answer"><span className="lab">Správna odpoveď</span>{m.a}</div>
              <div className="actions" style={{ marginTop: 12 }}>
                {!s.revealed && <button className="btn btn-primary" onClick={() => send('reveal')}>👁️ Čas vypršal (na projektore)</button>}
                <button className="btn btn-green" onClick={() => send('resolve', { correct: true })}>✔ Správne → {teams[s.turn]?.name}</button>
                <button className="btn btn-primary" onClick={() => send('resolve', { correct: false })}>✕ Zle → zablokovať</button>
                <button className="btn btn-ghost" onClick={() => send('close')}>Zrušiť</button>
              </div>
            </div>
          ) : (
            <>
              <p className="fm-hint">Klikni na voľné (číslo) alebo zablokované (✕) políčko a otvor otázku.</p>
              <div className="az-board mod-az">
                {AZ_ROWS.map((row, r) => (
                  <div className="az-row" key={r}>
                    {row.map((cell) => {
                      const o = owner[cell]
                      const cls = o === BLOCKED ? ' blocked' : o >= 0 ? ' owned' : ''
                      const bg = o >= 0 ? teams[o]?.color : undefined
                      return (
                        <button key={cell} className={'hex' + cls} onClick={() => send('openCell', { cell })} disabled={o >= 0}>
                          <span className="shape" style={bg ? { background: `linear-gradient(160deg, ${bg}, ${bg}cc)` } : {}}>
                            {o === FREE ? cell : o === BLOCKED ? <><span className="x">✕</span>{cell}</> : ''}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="controls" style={{ marginTop: 16 }}>
            <div className="divider" />
            <div className="group">
              <button className="btn btn-ghost" onClick={() => send('manualWin')}>Vyhlásiť víťaza (podľa počtu)</button>
              <button className="btn btn-ghost" onClick={() => send('reset')}>Nové nastavenie</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

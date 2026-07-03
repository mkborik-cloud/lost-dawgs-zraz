import { useModeratorClient } from '../utils/moderatorSync.js'

const DIFF_LABEL = { easy: 'ľahké', medium: 'stredné', hard: 'ťažké', ultra: 'ultra', fun: 'vtipné' }

export default function EmojiModerator() {
  const [s, send] = useModeratorClient('lostdawgs-emoji')

  if (!s) {
    return (
      <div className="feud-mod-page">
        <div className="feud-mod-head"><span className="fm-title">🔎 Moderátor · Emoji Boss</span></div>
        <p className="fm-wait">Čakám na hru… Otvor v hlavnom okne <b>Emoji Boss</b>.</p>
      </div>
    )
  }

  const names = s.teamNames || ['Tím 1', 'Tím 2']
  const scores = s.scores || [0, 0]
  const item = s.finalMode ? s.final : s.cur

  return (
    <div className="feud-mod-page">
      <div className="feud-mod-head">
        <span className="fm-title">🔎 Moderátor · Emoji Boss</span>
        <span className="fm-meta">
          Otázka {s.finalMode ? '★' : (s.pos + 1) + '/' + s.total} ·{' '}
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
            <button className="btn btn-primary btn-lg" onClick={() => send('reset')}>🔁 Reštartovať</button>
          </div>
        </div>
      ) : (
        <>
          {/* výber kategórie */}
          <div className="cat-chips">
            {(s.cats || []).map((c) => (
              <button key={c.id} className={'chip' + (s.catId === c.id && !s.finalMode ? ' active' : '')} onClick={() => send('pickCat', { id: c.id })}>
                {c.label}
                {c.difficulty && c.difficulty !== 'mixed' && <span className={'d diff-' + c.difficulty}>· {DIFF_LABEL[c.difficulty]}</span>}
              </button>
            ))}
            <button className={'chip' + (s.finalMode ? ' active' : '')} onClick={() => send('setFinal', { on: !s.finalMode })}>🏆 Finálna otázka</button>
          </div>

          {/* na ťahu */}
          {!s.finalMode && (
            <div className="az-turn" style={{ marginBottom: 14 }}>
              {names.map((nm, i) => (
                <button key={i} className={'turn-pill' + (s.turn === i ? ' active' : '')} style={s.turn === i ? { borderColor: i === 0 ? 'var(--t1)' : 'var(--t2)' } : {}} onClick={() => send('setTurn', { team: i })}>
                  <span className="dot" style={{ background: i === 0 ? 'var(--t1)' : 'var(--t2)' }} />
                  {nm}{s.turn === i && <span style={{ color: i === 0 ? 'var(--t1)' : 'var(--t2)' }}>← na ťahu</span>}
                </button>
              ))}
            </div>
          )}

          {/* emoji + odpoveď (moderátor vidí vždy) */}
          <div className="emoji-stage" style={{ minHeight: 200, padding: '30px 20px', gap: 16 }}>
            {s.finalMode && <div className="vn-cat" style={{ color: 'var(--gold)' }}>🏆 Finálna otázka rozstrelu</div>}
            {!s.finalMode && item && <div className="vn-cat">{item.cat} <span className={'diff-' + item.diff}>· {DIFF_LABEL[item.diff]}</span></div>}
            <div className="emoji-string" style={{ fontSize: 60 }}>{item ? item.emoji : '—'}</div>
            <div className="emoji-answer" style={{ fontSize: 30 }}>{item ? item.answer : 'Žiadne emoji v kategórii'}</div>
            <div className={'fm-reveal-badge ' + (s.revealed ? 'on' : 'off')}>{s.revealed ? '👁️ Odhalené na projektore' : '🙈 Skryté (na projektore ❓)'}</div>
          </div>

          <div className="controls" style={{ marginTop: 16 }}>
            <div className="label">Ovládanie moderátora</div>
            {!s.revealed ? (
              <button className="btn btn-primary btn-lg" onClick={() => send('reveal')} disabled={!s.finalMode && !s.cur}>👁️ Odhaliť odpoveď (na projektore)</button>
            ) : s.finalMode ? (
              <div className="group">
                <span className="fm-lbl">Bod pre:</span>
                <button className="btn btn-blue" onClick={() => send('awardFinal', { team: 0 })}>{names[0]}</button>
                <button className="btn btn-primary" onClick={() => send('awardFinal', { team: 1 })}>{names[1]}</button>
                <button className="btn" onClick={() => send('awardFinal', { team: null })}>Nikto</button>
                <button className="btn btn-ghost" onClick={() => send('setFinal', { on: false })}>← Späť do hry</button>
              </div>
            ) : (
              <div className="group">
                <span className="fm-lbl"><b style={{ color: s.turn === 0 ? 'var(--t1)' : 'var(--t2)' }}>{names[s.turn]}</b> na ťahu:</span>
                <button className="btn btn-green" onClick={() => send('resolveTurn', { correct: true })}>✔ Uhádol (+1)</button>
                <button className="btn" onClick={() => send('resolveTurn', { correct: false })}>✗ Neuhádol</button>
              </div>
            )}
            <div className="divider" />
            <div className="group">
              {!s.finalMode && <button className="btn btn-ghost" onClick={() => send('skip')}>Preskočiť →</button>}
              <button className="btn btn-green" onClick={() => send('finish')}>🏁 Ukončiť a vyhodnotiť</button>
              <button className="btn btn-ghost" onClick={() => send('reset')}>🔁 Reštartovať hru</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

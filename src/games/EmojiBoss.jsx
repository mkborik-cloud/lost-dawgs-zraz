import { useMemo, useState } from 'react'
import { EMOJI_FINAL } from '../data/emoji.js'

const DIFF_LABEL = { easy: 'ľahké', medium: 'stredné', hard: 'ťažké', ultra: 'ultra', fun: 'vtipné' }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function EmojiBoss({ teams, report, clearResult, categories }) {
  const EMOJI_CATEGORIES = categories
  const TEAM_NAMES = teams.map((t) => t.name)
  const MEMBERS = teams.map((t) => t.members || [])
  const [scores, setScores] = useState([0, 0])
  const [catId, setCatId] = useState('all')
  const [queue, setQueue] = useState(() => shuffle(allItems()))
  const [pos, setPos] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [finalMode, setFinalMode] = useState(false)
  const [phase, setPhase] = useState('play') // play | end

  function allItems() {
    return EMOJI_CATEGORIES.flatMap((c) => c.items.map((it) => ({ ...it, cat: c.label, diff: c.difficulty })))
  }

  function buildQueue(id) {
    if (id === 'all') return shuffle(allItems())
    const c = EMOJI_CATEGORIES.find((x) => x.id === id)
    return shuffle(c.items.map((it) => ({ ...it, cat: c.label, diff: c.difficulty })))
  }

  function pickCat(id) {
    setCatId(id); setQueue(buildQueue(id)); setPos(0); setRevealed(false); setFinalMode(false)
  }

  const cur = finalMode ? null : queue[pos]
  const total = queue.length

  function award(team) {
    if (team != null) setScores((s) => { const n = [...s]; n[team]++; return n })
    next()
  }

  function next() {
    setRevealed(false)
    setPos((p) => (total ? (p + 1) % total : 0)) // wrap around — appka beží dokola
  }

  function reset() { setScores([0, 0]); pickCat('all'); setPhase('play'); clearResult() }

  function finish() {
    const w = scores[0] === scores[1] ? 'tie' : scores[0] > scores[1] ? 0 : 1
    report(w); setPhase('end')
  }

  const catList = [{ id: 'all', label: 'Všetko / náhodne', difficulty: 'mixed' }, ...EMOJI_CATEGORIES]

  /* ---------- END ---------- */
  if (phase === 'end') {
    const winner = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1
    return (
      <main className="page">
        <div className="vn-wrap">
          <h1 style={{ fontSize: 52 }}>Koniec hry</h1>
          <div className="vn-card">
            <div className="vn-cat">Víťaz Emoji Boss</div>
            <div className="vn-verdict ok" style={{ fontSize: 54, color: winner == null ? 'var(--gold)' : winner === 0 ? 'var(--t1)' : 'var(--t2)' }}>
              {winner == null ? '🤝 Remíza!' : `🏆 ${TEAM_NAMES[winner]}`}
            </div>
            <div style={{ display: 'flex', gap: 40, marginTop: 10 }}>
              <div><div className="vn-cat">{TEAM_NAMES[0]}</div><div className="pts" style={{ fontSize: 44, color: 'var(--t1)', fontWeight: 900 }}>{scores[0]}</div></div>
              <div><div className="vn-cat">{TEAM_NAMES[1]}</div><div className="pts" style={{ fontSize: 44, color: 'var(--t2)', fontWeight: 900 }}>{scores[1]}</div></div>
            </div>
          </div>
          <div className="draft-actions" style={{ marginTop: 24 }}>
            <button className="btn btn-lg" onClick={() => setPhase('play')}>← Pokračovať v hre</button>
            <button className="btn btn-primary btn-xl" onClick={reset}>🔁 Reštartovať hru</button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="page-head">
        <h1>🧩 Emoji Boss</h1>
        <span className="pill">World of Warcraft</span>
      </div>
      <p className="page-sub">Moderátor ukáže reťazec emoji, tímy hádajú nahlas. Klikni „Odhaliť" a prideľ bod.</p>

      <div className="scorebar">
        <div className="team-score t1">
          <div className="ts-info">
            <span className="name" style={{ color: 'var(--t1)' }}>{TEAM_NAMES[0]}</span>
            {MEMBERS[0].length > 0 && <span className="members">{MEMBERS[0].join(' · ')}</span>}
          </div>
          <span className="pts">{scores[0]}</span>
        </div>
        <div className="mid">
          <span className="vs">OTÁZKA</span>
          <span style={{ fontSize: 28, fontWeight: 900 }}>{finalMode ? '★' : pos + 1}<span style={{ color: 'var(--muted)', fontSize: 16 }}>{finalMode ? '' : '/' + total}</span></span>
        </div>
        <div className="team-score t2">
          <span className="pts">{scores[1]}</span>
          <div className="ts-info">
            <span className="name" style={{ color: 'var(--t2)' }}>{TEAM_NAMES[1]}</span>
            {MEMBERS[1].length > 0 && <span className="members">{MEMBERS[1].join(' · ')}</span>}
          </div>
        </div>
      </div>

      <div className="cat-chips">
        {catList.map((c) => (
          <button
            key={c.id}
            className={'chip' + (catId === c.id && !finalMode ? ' active' : '')}
            onClick={() => pickCat(c.id)}
          >
            {c.label}
            {c.difficulty && c.difficulty !== 'mixed' && (
              <span className={'d diff-' + c.difficulty}>· {DIFF_LABEL[c.difficulty]}</span>
            )}
          </button>
        ))}
        <button className={'chip' + (finalMode ? ' active' : '')} onClick={() => { setFinalMode(true); setRevealed(false) }}>
          🏆 Finálna otázka
        </button>
      </div>

      {finalMode ? (
        <div className="emoji-stage">
          <div className="vn-cat" style={{ color: 'var(--gold)' }}>Finálna otázka rozstrelu</div>
          <div className="emoji-string">{EMOJI_FINAL.emoji}</div>
          <div style={{ fontSize: 22, fontWeight: 700, maxWidth: 620 }}>{EMOJI_FINAL.question}</div>
          {revealed ? (
            <div className="emoji-answer">
              {EMOJI_FINAL.answer}
              <small>{EMOJI_FINAL.note}</small>
            </div>
          ) : (
            <div className="emoji-hidden">❓ ❓ ❓</div>
          )}
        </div>
      ) : cur ? (
        <div className="emoji-stage">
          <div className="vn-cat">
            {cur.cat} <span className={'diff-' + cur.diff}>· {DIFF_LABEL[cur.diff]}</span>
          </div>
          <div className="emoji-string">{cur.emoji}</div>
          {revealed
            ? <div className="emoji-answer">{cur.answer}</div>
            : <div className="emoji-hidden">❓ ❓ ❓</div>}
        </div>
      ) : (
        <div className="emoji-stage">
          <div className="emoji-hidden">Žiadne emoji v tejto kategórii. Pridaj ich cez ⚙️ Nastavenia.</div>
        </div>
      )}

      <div className="controls">
        <div className="label">Ovládanie moderátora</div>
        {!revealed ? (
          <button className="btn btn-primary btn-lg" onClick={() => setRevealed(true)} disabled={!finalMode && !cur}>👁️ Odhaliť odpoveď</button>
        ) : (
          <div className="group">
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>Bod pre:</span>
            <button className="btn btn-blue" onClick={() => award(0)}>{TEAM_NAMES[0]}</button>
            <button className="btn btn-primary" onClick={() => award(1)}>{TEAM_NAMES[1]}</button>
            <button className="btn" onClick={() => award(null)}>Nikto</button>
            {finalMode && <button className="btn btn-ghost" onClick={() => { setFinalMode(false); setRevealed(false) }}>← Späť do hry</button>}
          </div>
        )}
        <div className="divider" />
        <div className="group">
          {!finalMode && <button className="btn btn-ghost" onClick={next}>Preskočiť →</button>}
          <button className="btn btn-green" onClick={finish}>🏁 Ukončiť a vyhodnotiť</button>
          <button className="btn btn-ghost" onClick={reset}>🔁 Reštartovať hru</button>
        </div>
      </div>
    </main>
  )
}

import { useState } from 'react'

const TABS = [
  { key: 'feud', icon: '📺', label: '5 proti 5' },
  { key: 'emoji', icon: '🧩', label: 'Emoji Boss' },
  { key: 'az', icon: '🔺', label: 'AZ Kvíz' },
  { key: 'vn', icon: '🤔', label: 'Verte / Neverte' },
]

const EMOJI_DIFFS = ['easy', 'medium', 'hard', 'ultra', 'fun']
const DIFF_LABEL = { easy: 'ľahké', medium: 'stredné', hard: 'ťažké', ultra: 'ultra', fun: 'vtipné' }

/* ---------------- FAMILY FEUD ---------------- */
function FeudEditor({ list, onChange }) {
  const setQ = (i, patch) => onChange(list.map((q, idx) => (idx === i ? { ...q, ...patch } : q)))
  const removeQ = (i) => onChange(list.filter((_, idx) => idx !== i))
  const addQ = () => onChange([...list, { category: 'Nová kategória', icon: '❓', question: 'Nová otázka?', answers: [{ text: 'Odpoveď', points: 10 }] }])
  const setAns = (qi, ai, patch) => setQ(qi, { answers: list[qi].answers.map((a, idx) => (idx === ai ? { ...a, ...patch } : a)) })
  const removeAns = (qi, ai) => setQ(qi, { answers: list[qi].answers.filter((_, idx) => idx !== ai) })
  const addAns = (qi) => setQ(qi, { answers: [...list[qi].answers, { text: 'Nová odpoveď', points: 5 }] })

  return (
    <div className="cfg-list">
      {list.map((q, qi) => (
        <div className="cfg-card" key={qi}>
          <div className="cfg-row">
            <input className="cfg-input cfg-icon" value={q.icon || ''} onChange={(e) => setQ(qi, { icon: e.target.value })} title="Ikona" />
            <input className="cfg-input" value={q.category} onChange={(e) => setQ(qi, { category: e.target.value })} placeholder="Kategória" />
            <button className="cfg-del" onClick={() => removeQ(qi)} title="Odstrániť otázku">✕</button>
          </div>
          <input className="cfg-input cfg-q" value={q.question} onChange={(e) => setQ(qi, { question: e.target.value })} placeholder="Otázka" />
          <div className="cfg-answers">
            {q.answers.map((a, ai) => (
              <div className="cfg-ans" key={ai}>
                <input className="cfg-input" value={a.text} onChange={(e) => setAns(qi, ai, { text: e.target.value })} placeholder="Odpoveď" />
                <input className="cfg-num" type="number" value={a.points} onChange={(e) => setAns(qi, ai, { points: Number(e.target.value) })} title="Body" />
                <button className="cfg-del sm" onClick={() => removeAns(qi, ai)}>✕</button>
              </div>
            ))}
            <button className="cfg-add sm" onClick={() => addAns(qi)}>+ odpoveď</button>
          </div>
        </div>
      ))}
      <button className="cfg-add" onClick={addQ}>+ Pridať otázku</button>
    </div>
  )
}

/* ---------------- EMOJI BOSS ---------------- */
function EmojiEditor({ list, onChange }) {
  const setCat = (ci, patch) => onChange(list.map((c, idx) => (idx === ci ? { ...c, ...patch } : c)))
  const removeCat = (ci) => onChange(list.filter((_, idx) => idx !== ci))
  const addCat = () => onChange([...list, { id: 'cat_' + Date.now(), label: 'Nová kategória', difficulty: 'medium', items: [] }])
  const setItem = (ci, ii, patch) => setCat(ci, { items: list[ci].items.map((it, idx) => (idx === ii ? { ...it, ...patch } : it)) })
  const removeItem = (ci, ii) => setCat(ci, { items: list[ci].items.filter((_, idx) => idx !== ii) })
  const addItem = (ci) => setCat(ci, { items: [...list[ci].items, { emoji: '❓', answer: 'Nová odpoveď' }] })

  return (
    <div className="cfg-list">
      {list.map((c, ci) => (
        <div className="cfg-card" key={ci}>
          <div className="cfg-row">
            <input className="cfg-input" value={c.label} onChange={(e) => setCat(ci, { label: e.target.value })} placeholder="Názov kategórie" />
            <select className="cfg-select" value={c.difficulty} onChange={(e) => setCat(ci, { difficulty: e.target.value })}>
              {EMOJI_DIFFS.map((d) => <option key={d} value={d}>{DIFF_LABEL[d]}</option>)}
            </select>
            <button className="cfg-del" onClick={() => removeCat(ci)} title="Odstrániť kategóriu">✕</button>
          </div>
          <div className="cfg-answers">
            {c.items.map((it, ii) => (
              <div className="cfg-ans" key={ii}>
                <input className="cfg-input cfg-emoji" value={it.emoji} onChange={(e) => setItem(ci, ii, { emoji: e.target.value })} placeholder="Emoji" />
                <input className="cfg-input" value={it.answer} onChange={(e) => setItem(ci, ii, { answer: e.target.value })} placeholder="Odpoveď" />
                <button className="cfg-del sm" onClick={() => removeItem(ci, ii)}>✕</button>
              </div>
            ))}
            <button className="cfg-add sm" onClick={() => addItem(ci)}>+ emoji</button>
          </div>
        </div>
      ))}
      <button className="cfg-add" onClick={addCat}>+ Pridať kategóriu</button>
    </div>
  )
}

/* ---------------- AZ KVÍZ ---------------- */
function AzEditor({ list, onChange }) {
  const setCat = (ci, patch) => onChange(list.map((c, idx) => (idx === ci ? { ...c, ...patch } : c)))
  const setQ = (ci, qi, patch) => setCat(ci, { questions: list[ci].questions.map((q, idx) => (idx === qi ? { ...q, ...patch } : q)) })
  const removeQ = (ci, qi) => setCat(ci, { questions: list[ci].questions.filter((_, idx) => idx !== qi) })
  const addQ = (ci) => setCat(ci, { questions: [...list[ci].questions, { q: 'Nová otázka?', a: 'Odpoveď', difficulty: 'easy' }] })

  return (
    <div className="cfg-list">
      {list.map((c, ci) => (
        <div className="cfg-card" key={ci}>
          <div className="cfg-row">
            <input className="cfg-input cfg-icon" value={c.icon || ''} onChange={(e) => setCat(ci, { icon: e.target.value })} title="Ikona" />
            <input className="cfg-input" value={c.label} onChange={(e) => setCat(ci, { label: e.target.value })} placeholder="Kategória" />
            <span className="cfg-count">{c.questions.length} otázok</span>
          </div>
          <div className="cfg-answers">
            {c.questions.map((q, qi) => (
              <div className="cfg-ans az" key={qi}>
                <input className="cfg-input" value={q.q} onChange={(e) => setQ(ci, qi, { q: e.target.value })} placeholder="Otázka" />
                <input className="cfg-input" value={q.a} onChange={(e) => setQ(ci, qi, { a: e.target.value })} placeholder="Odpoveď" />
                <select className="cfg-select" value={q.difficulty} onChange={(e) => setQ(ci, qi, { difficulty: e.target.value })}>
                  <option value="easy">🟢 ľahká</option>
                  <option value="hard">🔴 ťažká</option>
                </select>
                <button className="cfg-del sm" onClick={() => removeQ(ci, qi)}>✕</button>
              </div>
            ))}
            <button className="cfg-add sm" onClick={() => addQ(ci)}>+ otázka</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------------- VERTE / NEVERTE ---------------- */
function VnEditor({ list, onChange }) {
  const setS = (i, patch) => onChange(list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const removeS = (i) => onChange(list.filter((_, idx) => idx !== i))
  const addS = () => onChange([...list, { category: 'Nová kategória', icon: '❓', truth: true, text: 'Nové tvrdenie.', explanation: 'Vysvetlenie.' }])

  return (
    <div className="cfg-list">
      {list.map((s, i) => (
        <div className="cfg-card" key={i}>
          <div className="cfg-row">
            <input className="cfg-input cfg-icon" value={s.icon || ''} onChange={(e) => setS(i, { icon: e.target.value })} title="Ikona" />
            <input className="cfg-input" value={s.category} onChange={(e) => setS(i, { category: e.target.value })} placeholder="Kategória" />
            <select className="cfg-select" value={s.truth ? '1' : '0'} onChange={(e) => setS(i, { truth: e.target.value === '1' })}>
              <option value="1">✅ Pravda</option>
              <option value="0">❌ Blud</option>
            </select>
            <button className="cfg-del" onClick={() => removeS(i)}>✕</button>
          </div>
          <input className="cfg-input cfg-q" value={s.text} onChange={(e) => setS(i, { text: e.target.value })} placeholder="Tvrdenie" />
          <input className="cfg-input" value={s.explanation} onChange={(e) => setS(i, { explanation: e.target.value })} placeholder="Vysvetlenie" />
        </div>
      ))}
      <button className="cfg-add" onClick={addS}>+ Pridať tvrdenie</button>
    </div>
  )
}

export default function Settings({ data, setData, resetData, onClose }) {
  const [tab, setTab] = useState('feud')
  const update = (key) => (arr) => setData((d) => ({ ...d, [key]: arr }))

  const counts = {
    feud: data.feud.length,
    emoji: data.emoji.reduce((n, c) => n + c.items.length, 0),
    az: data.az.reduce((n, c) => n + c.questions.length, 0),
    vn: data.vn.length,
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-head">
          <h2>⚙️ Nastavenia otázok</h2>
          <span className="settings-note">Zmeny sa ukladajú automaticky a prejavia sa po reštarte danej hry.</span>
          <div style={{ flex: 1 }} />
          <button className="btn-back" onClick={onClose}>Zavrieť ✕</button>
        </div>

        <div className="settings-tabs">
          {TABS.map((t) => (
            <button key={t.key} className={'settings-tab' + (tab === t.key ? ' active' : '')} onClick={() => setTab(t.key)}>
              {t.icon} {t.label} <span className="st-num">{counts[t.key]}</span>
            </button>
          ))}
        </div>

        <div className="settings-toolbar">
          <span className="settings-count">{counts[tab]} {tab === 'emoji' ? 'emoji' : tab === 'az' ? 'otázok' : tab === 'vn' ? 'tvrdení' : 'otázok'} celkovo</span>
          <button
            className="btn btn-ghost"
            onClick={() => { if (confirm('Naozaj obnoviť pôvodné otázky pre túto hru? Tvoje zmeny sa stratia.')) resetData(tab) }}
          >
            ↺ Obnoviť pôvodné
          </button>
        </div>

        <div className="settings-body">
          {tab === 'feud' && <FeudEditor list={data.feud} onChange={update('feud')} />}
          {tab === 'emoji' && <EmojiEditor list={data.emoji} onChange={update('emoji')} />}
          {tab === 'az' && <AzEditor list={data.az} onChange={update('az')} />}
          {tab === 'vn' && <VnEditor list={data.vn} onChange={update('vn')} />}
        </div>
      </div>
    </div>
  )
}

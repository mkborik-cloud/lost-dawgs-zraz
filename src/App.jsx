import { useEffect, useState } from 'react'
import Home from './components/Home.jsx'
import TeamDraft from './components/TeamDraft.jsx'
import Settings from './components/Settings.jsx'
import FamilyFeud from './games/FamilyFeud.jsx'
import EmojiBoss from './games/EmojiBoss.jsx'
import AzQuiz from './games/AzQuiz.jsx'
import VerteNeverte from './games/VerteNeverte.jsx'
import { CAPTAINS } from './data/players.js'
import { FEUD_QUESTIONS } from './data/familyFeud.js'
import { EMOJI_CATEGORIES } from './data/emoji.js'
import { AZ_CATEGORIES } from './data/azquiz.js'
import { VN_STATEMENTS } from './data/verteNeverte.js'

const DEFAULTS = { feud: FEUD_QUESTIONS, emoji: EMOJI_CATEGORIES, az: AZ_CATEGORIES, vn: VN_STATEMENTS }
const STORAGE_KEY = 'lostdawgs-gamedata-v1'

function loadGameData() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) {
      const parsed = JSON.parse(s)
      // doplň chýbajúce kľúče z defaultov (kvôli budúcim zmenám)
      return { ...structuredClone(DEFAULTS), ...parsed }
    }
  } catch {}
  return structuredClone(DEFAULTS)
}

function freshTeams() {
  return CAPTAINS.map((name, i) => ({ name, captain: name, members: [], color: i === 0 ? 't1' : 't2' }))
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draftKey, setDraftKey] = useState(0) // zmena => remount TeamDraft (čistý stav losovania)

  // Editovateľné banky otázok (cez ⚙️ Nastavenia), uložené v localStorage
  const [gameData, setGameData] = useState(loadGameData)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData)) } catch {}
  }, [gameData])
  const resetData = (key) => setGameData((d) => ({ ...d, [key]: structuredClone(DEFAULTS[key]) }))
  // Zdieľané tímy naprieč všetkými hrami. Kapitáni sú pevní (Fudy = Tím 1, Myrell = Tím 2),
  // členov doplní losovanie v Rozdelení tímov.
  const [teams, setTeams] = useState(freshTeams)
  const drafted = teams.some((t) => t.members.length > 0)
  // Reset rozdelenia tímov — vyčistí členov a remountne losovaciu obrazovku
  const resetTeams = () => { setTeams(freshTeams()); setDraftKey((k) => k + 1) }

  // Výsledky disciplín: pre každú hru 0 = Tím 1 (Fudy), 1 = Tím 2 (Myrell), 'tie' = remíza, null = nehrané
  const [results, setResults] = useState({ feud: null, emoji: null, az: null, vn: null })
  const report = (key) => (winner) => setResults((r) => ({ ...r, [key]: winner }))
  const clearResult = (key) => () => setResults((r) => ({ ...r, [key]: null }))

  const go = (s) => { setScreen(s); window.scrollTo(0, 0) }

  return (
    <div className="app">
      <header className="topbar">
        <img className="logo" src="/logo.png" alt="Lost Dawgs" />
        <div className="title">LOST DAWGS <span>· Zraz 2026 Showdown</span></div>
        <div className="spacer" />
        {screen !== 'home' && drafted && (
          <div className="topbar-teams" title="Vylosované tímy">
            <span className="t t1">🔵 {teams[0].name}</span>
            <span className="vs">vs</span>
            <span className="t t2">🔴 {teams[1].name}</span>
          </div>
        )}
        {screen !== 'home' && (
          <button className="btn-back" onClick={() => go('home')}>← Späť na hub</button>
        )}
      </header>

      {/* Všetky obrazovky ostávajú namountované — prepína sa len viditeľnosť,
          takže rozohraná hra si pamätá presný stav aj po návrate do hubu. */}
      <div style={{ display: screen === 'home' ? 'block' : 'none' }}>
        <Home go={go} teams={teams} drafted={drafted} results={results} resetTeams={resetTeams} />
      </div>
      <div style={{ display: screen === 'draft' ? 'block' : 'none' }}>
        <TeamDraft key={draftKey} setTeams={setTeams} />
      </div>
      <div style={{ display: screen === 'feud' ? 'block' : 'none' }}>
        <FamilyFeud teams={teams} report={report('feud')} clearResult={clearResult('feud')} questions={gameData.feud} />
      </div>
      <div style={{ display: screen === 'emoji' ? 'block' : 'none' }}>
        <EmojiBoss teams={teams} report={report('emoji')} clearResult={clearResult('emoji')} categories={gameData.emoji} />
      </div>
      <div style={{ display: screen === 'az' ? 'block' : 'none' }}>
        <AzQuiz teams={teams} report={report('az')} clearResult={clearResult('az')} categories={gameData.az} />
      </div>
      <div style={{ display: screen === 'vn' ? 'block' : 'none' }}>
        <VerteNeverte teams={teams} report={report('vn')} clearResult={clearResult('vn')} statements={gameData.vn} />
      </div>

      <footer className="footer">
        Lost Dawgs · Zraz 2026 Showdown — ovláda moderátor na veľkej obrazovke 🐺
      </footer>

      <button className="settings-fab" onClick={() => setSettingsOpen(true)} title="Nastavenia otázok">⚙️</button>
      {settingsOpen && (
        <Settings data={gameData} setData={setGameData} resetData={resetData} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}

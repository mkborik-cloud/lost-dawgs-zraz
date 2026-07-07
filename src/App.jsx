import { useEffect, useState } from 'react'
import Home from './components/Home.jsx'
import FeudRules from './components/FeudRules.jsx'
import TeamDraft from './components/TeamDraft.jsx'
import Settings from './components/Settings.jsx'
import EmoteBackground from './components/EmoteBackground.jsx'
import FamilyFeud from './games/FamilyFeud.jsx'
import EmojiBoss from './games/EmojiBoss.jsx'
import AzQuiz from './games/AzQuiz.jsx'
import VerteNeverte from './games/VerteNeverte.jsx'
import { GAMESET_1, GAMESET_2, FEUD_QUESTIONS } from './data/familyFeud.js'
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
  // Tímy s generickými názvami; členov aj názvy doplní losovanie v Rozdelení tímov
  return [
    { name: 'Tím 1', members: [], color: 't1' },
    { name: 'Tím 2', members: [], color: 't2' },
  ]
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draftKey, setDraftKey] = useState(0) // zmena => remount TeamDraft (čistý stav losovania)
  const [gameKey, setGameKey] = useState(0) // zmena => remount všetkých hier (reset priebehu)

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
  const [feudGameset, setFeudGameset] = useState(null) // 1 or 2
  const [feudRulesOpen, setFeudRulesOpen] = useState(false)
  // Moderátorské okno pre 5 proti 5 — dá sa otvoriť už pri výbere gamesetu, pred štartom hry
  const openFeudModerator = () =>
    window.open(window.location.pathname + '?mod=feud', 'feud-moderator', 'width=580,height=840')
  const [results, setResults] = useState({ feud: null, emoji: null, az: null, vn: null })
  const report = (key) => (winner) => setResults((r) => ({ ...r, [key]: winner }))
  const clearResult = (key) => () => setResults((r) => ({ ...r, [key]: null }))

  // Reset celej hry — tímy, výsledky disciplín aj priebeh všetkých hier (#7)
  const resetAll = () => {
    setTeams(freshTeams())
    setResults({ feud: null, emoji: null, az: null, vn: null })
    setFeudGameset(null)
    setDraftKey((k) => k + 1)
    setGameKey((k) => k + 1)
    setSettingsOpen(false)
    setScreen('home')
    window.scrollTo(0, 0)
  }

  const go = (s) => {
    // Intercept feud → show gameset selector first
    const dest = s === 'feud' ? 'feud-select' : s
    setScreen(dest); window.scrollTo(0, 0)
  }
  const startFeud = (gs) => { setFeudGameset(gs); setScreen('feud'); window.scrollTo(0, 0) }

  return (
    <>
    <EmoteBackground />
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
        <Home go={go} teams={teams} drafted={drafted} results={results} resetTeams={resetTeams} resetAll={resetAll} />
      </div>
      <div style={{ display: screen === 'draft' ? 'block' : 'none' }}>
        <TeamDraft key={draftKey} setTeams={setTeams} />
      </div>
      <div style={{ display: screen === 'feud-select' ? 'block' : 'none' }}>
        <main className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, paddingTop: 48 }}>
          <img src="/5-proti-5.png" alt="5 proti 5" style={{ maxWidth: 680, width: '95%', borderRadius: 20 }} />
          <p style={{ color: 'var(--muted)', fontSize: 18, margin: 0 }}>Vyber sadu otázok pre túto partiu:</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-xl" style={{ fontSize: 22, padding: '20px 48px' }} onClick={() => startFeud(1)}>
              🟦 Gameset 1
            </button>
            <button className="btn btn-blue btn-xl" style={{ fontSize: 22, padding: '20px 48px' }} onClick={() => startFeud(2)}>
              🟥 Gameset 2
            </button>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-lg" onClick={() => setFeudRulesOpen(true)}>📜 Pravidlá</button>
            <button className="btn btn-green btn-lg" onClick={openFeudModerator}>🔎 Moderátorský panel</button>
          </div>
          {feudRulesOpen && <FeudRules onClose={() => setFeudRulesOpen(false)} />}
        </main>
      </div>
      <div style={{ display: screen === 'feud' ? 'block' : 'none' }}>
        <FamilyFeud
          key={`${gameKey}-${feudGameset}`}
          teams={teams}
          report={report('feud')}
          clearResult={clearResult('feud')}
          questions={feudGameset === 2 ? GAMESET_2 : GAMESET_1}
          goHome={() => go('home')}
        />
      </div>
      <div style={{ display: screen === 'emoji' ? 'block' : 'none' }}>
        <EmojiBoss key={gameKey} teams={teams} report={report('emoji')} clearResult={clearResult('emoji')} categories={gameData.emoji} />
      </div>
      <div style={{ display: screen === 'az' ? 'block' : 'none' }}>
        <AzQuiz key={gameKey} teams={teams} report={report('az')} clearResult={clearResult('az')} categories={gameData.az} />
      </div>
      <div style={{ display: screen === 'vn' ? 'block' : 'none' }}>
        <VerteNeverte key={gameKey} teams={teams} report={report('vn')} clearResult={clearResult('vn')} statements={gameData.vn} active={screen === 'vn'} />
      </div>

      <footer className="footer">
        Lost Dawgs · Zraz 2026 Showdown
      </footer>

      <button className="settings-fab" onClick={() => setSettingsOpen(true)} title="Nastavenia otázok">⚙️</button>
      {settingsOpen && (
        <Settings data={gameData} setData={setGameData} resetData={resetData} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
    </>
  )
}

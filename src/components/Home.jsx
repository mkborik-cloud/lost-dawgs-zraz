const GAMES = [
  {
    key: 'feud', n: '01', emoji: '📺', title: '5 proti 5',
    tag: 'Family Feud',
    desc: 'Dva tímy hádajú najčastejšie odpovede z ankety. Krížiky, kradnutie bodov, 9 kôl s násobičmi.',
    accent: 'var(--red)', soft: 'rgba(240,64,74,0.16)', glow: 'rgba(240,64,74,0.5)',
  },
  {
    key: 'emoji', n: '02', emoji: '🧩', title: 'Emoji Boss',
    tag: 'World of Warcraft',
    desc: 'Reťazec emoji → uhádni bossa, zónu, expanziu či postavu. Od základov až po rozstrel.',
    accent: '#c77dff', soft: 'rgba(199,125,255,0.16)', glow: 'rgba(199,125,255,0.5)',
  },
  {
    key: 'az', n: '03', emoji: '🔺', title: 'AZ Kvíz',
    tag: '28 políčok · 9 kategórií',
    desc: 'Trojuholníková doska. Tímy odpovedajú a snažia sa prepojiť svoje strany súvislou reťazou.',
    accent: '#4d8df0', soft: 'rgba(77,141,240,0.16)', glow: 'rgba(77,141,240,0.5)',
  },
  {
    key: 'vn', n: '04', emoji: '🤔', title: 'Verte / Neverte',
    tag: '36 tvrdení',
    desc: 'Pravda alebo blud? Konšpirácie, Zem, história a slávne osobnosti — s vysvetlením.',
    accent: 'var(--gold)', soft: 'rgba(245,197,24,0.16)', glow: 'rgba(245,197,24,0.45)',
  },
]

function SideTeam({ team, teamIndex, results, side }) {
  const wins = GAMES.filter((g) => results[g.key] === teamIndex).length
  return (
    <div className={'side-team ' + team.color + ' ' + side}>
      <div className="st-head">
        <span className="crown">👑</span>
        <span className="st-name">{team.name}</span>
        <span className="st-points" title="Vyhraté disciplíny">{wins}</span>
      </div>
      <div className="st-members">
        {team.members.join(' · ')}
      </div>
      <div className="st-results">
        {GAMES.map((g) => {
          const r = results[g.key]
          const state = r == null ? 'none' : r === 'tie' ? 'tie' : r === teamIndex ? 'win' : 'loss'
          const mark = state === 'win' ? '✓' : state === 'loss' ? '✗' : state === 'tie' ? '=' : '–'
          return (
            <span className={'res-badge ' + state} key={g.key} title={g.title}>
              <span className="rb-ico">{g.emoji}</span><span className="rb-mark">{mark}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function Home({ go, teams, drafted, results, resetTeams }) {
  return (
    <main className="hub">
      <section className="hero">
        {drafted ? (
          <div className="hero-row">
            <SideTeam team={teams[0]} teamIndex={0} results={results} side="left" />
            <div className="hero-logo">
              <img className="crest" src="/logo.png" alt="Lost Dawgs crest" />
              <div className="kicker">Zraz 2026 · Showdown</div>
            </div>
            <SideTeam team={teams[1]} teamIndex={1} results={results} side="right" />
          </div>
        ) : (
          <div className="hero-logo">
            <img className="crest" src="/logo.png" alt="Lost Dawgs crest" />
            <div className="kicker">Zraz 2026 · Showdown</div>
          </div>
        )}
      </section>

      <div className="card-draft" onClick={() => go('draft')} role="button">
        <span className="big">🎲</span>
        <div>
          <h3>Rozdelenie tímov</h3>
          <p>Kapitáni Fudy a Myrell, zvyšok sa vylosuje náhodne. {drafted ? 'Klikni pre úpravu / nové losovanie.' : 'Začni tu.'}</p>
        </div>
        <div className="spacer" />
        {drafted && (
          <button
            className="btn btn-lg"
            onClick={(e) => { e.stopPropagation(); if (confirm('Naozaj resetovať rozdelenie tímov? Vylosované zostavy sa vymažú.')) resetTeams() }}
          >
            ↺ Resetovať rozdelenie
          </button>
        )}
        <button className="btn btn-primary btn-lg" onClick={(e) => { e.stopPropagation(); go('draft') }}>
          {drafted ? 'Upraviť tímy →' : 'Losovať tímy →'}
        </button>
      </div>

      <p className="section-label">Disciplíny</p>
      <div className="grid grid-disc">
        {GAMES.map((g) => (
          <button
            key={g.key}
            className="card-game"
            onClick={() => go(g.key)}
            style={{ '--accent': g.accent, '--accent-soft': g.soft, '--red-glow': g.glow }}
          >
            <span className="num">{g.n}</span>
            <span className="emoji">{g.emoji}</span>
            <h3>{g.title}</h3>
            <p>{g.desc}</p>
            <span className="tag" style={{ '--accent': g.accent, '--accent-soft': g.soft }}>{g.tag}</span>
          </button>
        ))}
      </div>
    </main>
  )
}

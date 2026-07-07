// Pravidlá 5 proti 5 — modal na obrazovke výberu gamesetu (pred štartom hry)
export default function FeudRules({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal feud-rules" onClick={(e) => e.stopPropagation()}>
        <div className="q-cat">📜 Pravidlá · 5 proti 5</div>

        <h3>Priebeh hry</h3>
        <ul>
          <li>Ten, kto sa skôr prihlási (alebo buchne po stole), odpovedá prvý.</li>
          <li>Ak trafí úplne najčastejšiu odpoveď z tabuľky, jeho tím získava výhodu a rozhoduje sa, či chce hrať, alebo prenechá hru súperom.</li>
          <li>Ak hrajúci tím nazbiera tri krížiky (3× zlá odpoveď) skôr, ako odhalí celú tabuľku, hra sa na moment preruší a šancu dostáva súper. <b>Režim: Kradnutie hry</b></li>
        </ul>

        <h3>Bodovanie a počet kôl</h3>
        <ul>
          <li>Hrá sa <b>8 kôl</b>.</li>
          <li>Kolá 1–3: body štandardne (1 človek z ankety = 1 bod).</li>
          <li>Kolá 4–6: body <b>×2</b> · Kolá 7–8: body <b>×3</b> — nech je napínavo až do konca.</li>
          <li>Tím s najvyšším počtom bodov na konci vyhráva.</li>
        </ul>

        <h3>Kradnutie</h3>
        <ul>
          <li>Pri <b>2 krížikoch</b> hrajúceho tímu sa súper môže začať radiť medzi sebou.</li>
          <li>Pri <b>treťom krížiku</b> sa hra presúva k súperovi — ten kradne otázku.</li>
          <li>Súper po dohode zvolí <b>jednu odpoveď</b>. Ak sa nachádza v tabuľke, pripisuje si nahrané body.</li>
          <li>Uhádnutá odpoveď pri krádeži sa už do bodov nepripisuje — bank je zmrazený. 🧊</li>
        </ul>

        <div className="actions">
          <button className="btn btn-primary btn-lg" onClick={onClose}>Rozumiem ✔</button>
        </div>
      </div>
    </div>
  )
}

# 🐺 Lost Dawgs — Zraz 2026 Showdown

Webová párty appka pre náš **Lost Dawgs** zraz. Slúži ako jedno miesto, kde sa najprv
rozdelia tímy a potom sa hrajú rôzne disciplíny — všetko ovláda **moderátor na veľkej
obrazovke (TV / projektor)**, miestnosť hádza a reaguje.

Appka je celá v **slovenčine**, navrhnutá na živé hranie (žiadne prihlasovanie, žiadny backend).

---

## 🎮 Čo appka obsahuje

### 🎲 Rozdelenie tímov
Kapitáni sú pevne dané — **Fudy** (Tím 1) a **Myrell** (Tím 2). Ostatní hráči sa rozdelia
náhodne, striedavo do oboch tímov, s efektnou **slot-machine animáciou** (rolovanie mien,
zacvaknutie vybraného hráča, syntetizovaný zvuk automatu a fanfára na konci — dá sa stíšiť).
Pred losovaním sa dá ktorýkoľvek hráč vyradiť. Vylosované tímy sa potom **používajú vo
všetkých hrách** (mená kapitánov, rostery aj skóre disciplín).

### 📺 5 proti 5 (Family Feud)
Dva tímy hádajú najčastejšie odpovede z ankety. Otáčacia tabuľa so skrytými odpoveďami,
body, **krížiky (max 3)**, kradnutie banku, **9 kôl s násobičmi** (×1 → ×4) a celkový víťaz.
Plné ovládanie pre moderátora (odhalenie polí, krížiky, prepínanie tímu, pridelenie banku,
ručná úprava skóre).

### 🧩 Emoji Boss (World of Warcraft)
Moderátor ukáže reťazec emoji, tímy hádajú bossa / zónu / expanziu / postavu. Kategórie
podľa obtiažnosti (od základov cez „Think Longer" až po **rozstrel**), odhalenie odpovede,
prideľovanie bodov a finálna rozhodovacia otázka.

### 🔺 AZ Kvíz
Trojuholníková doska s **28 šesťuholníkmi (honeycomb)** a 9 kategóriami. Tímy si vyberajú
políčka, dostávajú otázky a snažia sa **súvislou reťazou spojiť všetky tri strany
trojuholníka** (ľavú, pravú aj spodnú). Po otvorení políčka beží **30 s časomiera** —
odpoveď sa odhalí po čase alebo skôr cez tlačidlo. Módy: *Spoj 3 strany* a *Rýchlovka*
(najviac políčok). Automatická detekcia výhry.

### 🤔 Verte / Neverte
Tímová hra s tvrdeniami (konšpirácie, planéta Zem, história, slávne osobnosti). Tímy sa
rozhodnú **VERÍM / NEVERÍM**, moderátor odhalí pravdu + krátke vysvetlenie a pridelí bod
(Fudy / Myrell / obaja / nikto). Na konci celkový víťaz.

---

## ✨ Ďalšie funkcie

- **Spoločné tímy naprieč hrami** — na úvodke sú tímy po stranách loga (Fudy vľavo, Myrell
  vpravo) s rostermi a **prehľadom výsledkov disciplín** (kto ktorú vyhral / prehral) + počet
  vyhratých disciplín.
- **Ukladanie priebehu** — rozohraná hra si pamätá presný stav aj po návrate do hubu.
- **Reset** — každú hru aj rozdelenie tímov sa dá kedykoľvek resetovať.
- **⚙️ Editor otázok** — plávajúce tlačidlo vpravo dole otvorí nastavenia, kde sa dajú
  otázky **pridávať, upravovať a mazať** po sekciách pre každú hru. Zmeny sa **ukladajú do
  prehliadača (localStorage)** a prežijú aj refresh. Tlačidlo „Obnoviť pôvodné" vráti
  originálnu banku.
- **Dizajn pre TV** — veľké, čitateľné písmo a značkové farby Lost Dawgs (čierna, koralovo-
  červená `#f0404a`, biela).

---

## 🛠️ Technológie

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) (čisté JSX, bez routera —
  navigácia cez stav v `App.jsx`)
- Žiadny backend, žiadna databáza — všetko beží v prehliadači
- Zvuky losovania sú **syntetizované cez Web Audio API** (žiadne audio súbory)
- Banky otázok sú prepísané zo zadania (`Assets/Appka Zraz.pdf`)

## 🚀 Spustenie

```bash
npm install      # inštalácia závislostí
npm run dev      # vývojový server (predvolene http://localhost:5180)
npm run build    # produkčný build do dist/
npm run preview  # náhľad produkčného buildu
```

## 📁 Štruktúra projektu

```
.
├─ index.html
├─ vite.config.js
├─ public/                 # logo a obrázky (crest, wordmark)
└─ src/
   ├─ main.jsx             # vstupný bod
   ├─ App.jsx              # navigácia, zdieľaný stav tímov, výsledkov a banky otázok
   ├─ styles.css           # kompletný štýl (značková tmavá téma)
   ├─ components/
   │  ├─ Home.jsx          # hub: logo, tímy, výsledky disciplín, dlaždice hier
   │  ├─ TeamDraft.jsx     # losovanie tímov (slot animácia + zvuk)
   │  └─ Settings.jsx      # editor otázok (CRUD + localStorage)
   ├─ games/
   │  ├─ FamilyFeud.jsx    # 5 proti 5
   │  ├─ EmojiBoss.jsx     # Emoji Boss
   │  ├─ AzQuiz.jsx        # AZ Kvíz
   │  └─ VerteNeverte.jsx  # Verte / Neverte
   └─ data/                # banky otázok a hráči
      ├─ players.js
      ├─ familyFeud.js
      ├─ emoji.js
      ├─ azquiz.js
      └─ verteNeverte.js
```

---

🐺 *Lost Dawgs · Zraz 2026 Showdown — ovláda moderátor na veľkej obrazovke.*

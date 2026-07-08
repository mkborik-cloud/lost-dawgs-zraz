// AZ Kvíz — simulačné testy: 10 celých hier na mód, kontrola opakovania otázok
// a čudných stavov v hernom kole. Spusti: npm test
import test from 'node:test'
import assert from 'node:assert/strict'
import { AZ_CATEGORIES, AZ_ROWS, AZ_SIDES, AZ_NEIGHBORS } from '../src/data/azquiz.js'
import { FREE, BLOCKED, assignCategories, pickQuestion, checkWin } from '../src/games/azQuizLogic.js'

const SIMULATIONS = 10
const NUM_TEAMS = 2
const TOTAL_QUESTIONS = AZ_CATEGORIES.reduce((n, c) => n + c.questions.length, 0)

// deterministický RNG (mulberry32), aby sa prípadné zlyhanie dalo zreprodukovať
function makeRng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ---------- sanita banky otázok ---------- */

test('banka otázok: žiadne duplicitné otázky', () => {
  const seen = new Map()
  for (const cat of AZ_CATEGORIES) {
    for (const { q } of cat.questions) {
      const key = q.trim().toLowerCase()
      assert.ok(!seen.has(key), `duplicitná otázka "${q}" v kategórii "${cat.label}" (prvýkrát v "${seen.get(key)}")`)
      seen.set(key, cat.label)
    }
  }
})

test('banka otázok: každá otázka má text, odpoveď a platnú obtiažnosť', () => {
  for (const cat of AZ_CATEGORIES) {
    assert.ok(cat.id && cat.label, 'kategória musí mať id a label')
    assert.ok(cat.questions.length > 0, `kategória "${cat.label}" nemá žiadne otázky`)
    for (const { q, a, difficulty } of cat.questions) {
      assert.ok(q && q.trim(), `prázdna otázka v "${cat.label}"`)
      assert.ok(a && String(a).trim(), `otázka "${q}" nemá odpoveď`)
      assert.ok(['easy', 'hard'].includes(difficulty), `otázka "${q}" má neplatnú obtiažnosť "${difficulty}"`)
    }
  }
})

test('banka otázok: dosť otázok na celú dosku (28 políčok)', () => {
  assert.ok(TOTAL_QUESTIONS >= 28, `iba ${TOTAL_QUESTIONS} otázok — doska má 28 políčok`)
  const ids = AZ_CATEGORIES.map((c) => c.id)
  assert.equal(new Set(ids).size, ids.length, 'duplicitné id kategórií')
})

/* ---------- sanita dosky ---------- */

test('doska: 28 unikátnych políčok, symetrické susednosti, strany sedia', () => {
  const cells = AZ_ROWS.flat()
  assert.equal(cells.length, 28)
  assert.equal(new Set(cells).size, 28)
  const cellSet = new Set(cells)
  for (const [c, nbs] of Object.entries(AZ_NEIGHBORS)) {
    for (const nb of nbs) {
      assert.ok(cellSet.has(nb), `sused ${nb} políčka ${c} nie je na doske`)
      assert.ok(AZ_NEIGHBORS[nb].includes(Number(c)), `susednosť ${c}↔${nb} nie je symetrická`)
    }
  }
  for (const side of Object.values(AZ_SIDES)) {
    for (const c of side) assert.ok(cellSet.has(c), `políčko strany ${c} nie je na doske`)
  }
})

/* ---------- simulácia celej hry ---------- */

// Zrkadlí priebeh kola v AzQuiz.jsx: tím na ťahu otvorí políčko, dostane otázku,
// odpovie (náhodne, ~70 % úspešnosť), políčko sa obsadí alebo zablokuje.
function simulateGame(mode, rng) {
  const cellCat = assignCategories(AZ_CATEGORIES, rng)

  // každé políčko dostalo kategóriu a rozdelenie je rovnomerné (round-robin)
  const catCounts = {}
  for (let c = 1; c <= 28; c++) {
    assert.ok(AZ_CATEGORIES.some((cat) => cat.id === cellCat[c]), `políčko ${c} má neznámu kategóriu "${cellCat[c]}"`)
    catCounts[cellCat[c]] = (catCounts[cellCat[c]] || 0) + 1
  }
  const counts = Object.values(catCounts)
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `kategórie nie sú rozdelené rovnomerne: ${JSON.stringify(catCounts)}`)

  const owner = Object.fromEntries([...Array(28)].map((_, i) => [i + 1, FREE]))
  const used = new Set()
  const usedTexts = new Set()
  let turn = 0
  let winner = null
  let rounds = 0

  while (winner == null) {
    rounds++
    assert.ok(rounds <= TOTAL_QUESTIONS + 1, `hra sa nezastavila ani po ${TOTAL_QUESTIONS} otázkach`)

    // hrateľné políčka = voľné + zablokované (rovnako ako openCell: owner >= 0 sa nedá)
    const clickable = Object.keys(owner).map(Number).filter((c) => owner[c] < 0)
    assert.ok(clickable.length > 0, 'niet hrateľného políčka, ale hra nemá víťaza')
    const cell = clickable[Math.floor(rng() * clickable.length)]

    const catId = cellCat[cell]
    const catHadUnused = AZ_CATEGORIES.find((c) => c.id === catId).questions.some((_, i) => !used.has(catId + ':' + i))
    const pick = pickQuestion(AZ_CATEGORIES, catId, used, rng)

    if (!pick) {
      // banka vyčerpaná — smie nastať len keď je naozaj všetkých 72 otázok použitých
      assert.equal(used.size, TOTAL_QUESTIONS, 'pickQuestion vrátil null, hoci ostávajú nepoužité otázky')
      return { winner: null, rounds, used, exhausted: true }
    }

    // otázka sa nesmie opakovať — ani indexom, ani textom
    const key = pick.cat.id + ':' + pick.i
    assert.ok(!used.has(key), `otázka ${key} sa zopakovala v kole ${rounds}`)
    assert.ok(!usedTexts.has(pick.q.q), `text otázky "${pick.q.q}" padol druhýkrát v kole ${rounds}`)
    // otázka patrí pridelenej kategórii, kým v nej niečo ostáva
    if (catHadUnused) assert.equal(pick.cat.id, catId, `políčko ${cell} malo dostať otázku z "${catId}", dostalo z "${pick.cat.id}"`)

    used.add(key)
    usedTexts.add(pick.q.q)

    // vyhodnotenie ako resolve(): správne → tím obsadí, zle → zablokované (dá sa hrať znova)
    const correct = rng() < 0.7
    owner[cell] = correct ? turn : BLOCKED
    winner = checkWin(owner, mode, NUM_TEAMS)
    if (winner == null) turn = (turn + 1) % NUM_TEAMS
  }

  // víťaz musí byť platný tím a jeho výhra overiteľná zo stavu dosky
  assert.ok(winner === 0 || winner === 1, `neplatný víťaz: ${winner}`)
  if (mode === 'classic') {
    assert.equal(checkWin(owner, 'classic', NUM_TEAMS), winner, 'víťaz nesedí so stavom dosky')
  } else {
    assert.ok(Object.values(owner).every((v) => v !== FREE), 'rýchlovka skončila, ale na doske ostali voľné políčka')
  }
  return { winner, rounds, used, exhausted: false }
}

for (const mode of ['classic', 'rychlovka']) {
  test(`simulácia: ${SIMULATIONS} hier v móde "${mode}" bez opakovaných otázok a čudných stavov`, () => {
    for (let sim = 0; sim < SIMULATIONS; sim++) {
      const rng = makeRng(1000 * sim + (mode === 'classic' ? 1 : 2))
      const result = simulateGame(mode, rng)
      assert.ok(!result.exhausted, `simulácia ${sim}: banka otázok sa vyčerpala bez víťaza (po ${result.rounds} kolách)`)
      assert.ok(result.rounds >= 7, `simulácia ${sim}: hra skončila podozrivo rýchlo (${result.rounds} kôl)`)
    }
  })
}

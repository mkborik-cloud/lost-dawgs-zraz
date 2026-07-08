// AZ Kvíz — čistá herná logika (zdieľaná komponentom aj testami)
import { AZ_SIDES, AZ_NEIGHBORS } from '../data/azquiz.js'

export const FREE = -1
export const BLOCKED = -2

export function shuffle(arr, rng = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Súvislá zložka tímu sa musí dotýkať všetkých požadovaných strán
export function teamConnects(owner, team, sidesNeeded) {
  const cells = Object.keys(owner).map(Number).filter((c) => owner[c] === team)
  const set = new Set(cells)
  const seen = new Set()
  for (const start of cells) {
    if (seen.has(start)) continue
    const stack = [start]; seen.add(start); const comp = new Set([start])
    while (stack.length) {
      const c = stack.pop()
      for (const nb of AZ_NEIGHBORS[c]) {
        if (set.has(nb) && !seen.has(nb)) { seen.add(nb); stack.push(nb); comp.add(nb) }
      }
    }
    if (sidesNeeded.every((side) => side.some((s) => comp.has(s)))) return true
  }
  return false
}

// priraď kategórie rovnomerne (round-robin), aby sa v jednej kategórii nevyčerpali otázky
export function assignCategories(categories, rng = Math.random) {
  const shuffledCats = shuffle(categories.map((c) => c.id), rng)
  const assign = shuffle([...Array(28)].map((_, i) => shuffledCats[i % shuffledCats.length]), rng)
  const map = {}
  for (let c = 1; c <= 28; c++) map[c] = assign[c - 1]
  return map
}

// najprv nepoužité otázky z pridelenej kategórie; ak sú vyčerpané, požičaj z inej (bez opakovania)
export function pickQuestion(categories, catId, used, rng = Math.random) {
  const cat = categories.find((c) => c.id === catId)
  const isUsed = (cid, i) => used.has(cid + ':' + i)
  let candidates = cat.questions.map((q, i) => ({ cat, q, i })).filter((x) => !isUsed(catId, x.i))
  if (candidates.length === 0) {
    candidates = categories.flatMap((c) => c.questions.map((q, i) => ({ cat: c, q, i })).filter((x) => !isUsed(c.id, x.i)))
  }
  if (candidates.length === 0) return null // všetky otázky vyčerpané
  return candidates[Math.floor(rng() * candidates.length)]
}

export function checkWin(owner, mode, numTeams) {
  if (mode === 'classic' || mode === 'duel') {
    // víťaz musí súvislou reťazou spojiť VŠETKY 3 strany trojuholníka (ľavú, pravú aj spodnú)
    for (let t = 0; t < numTeams; t++) {
      if (teamConnects(owner, t, [AZ_SIDES.left, AZ_SIDES.right, AZ_SIDES.bottom])) return t
    }
  } else {
    // rýchlovka: skončí keď je všetko obsadené
    const allFilled = Object.values(owner).every((v) => v !== FREE)
    if (allFilled) {
      const counts = [...Array(numTeams)].map((_, t) => Object.values(owner).filter((v) => v === t).length)
      return counts.indexOf(Math.max(...counts))
    }
  }
  return null
}

import { useEffect, useRef } from 'react'

// Emotikony z Assets/Emotes (skopírované do public/emotes)
const EMOTES = [
  'EZ.webp', 'MaegoW.png', 'Really2.png', 'dawg.webp', 'fragyW2.png', 'fudyFuckYou.png',
  'fudyPodelafka.png', 'fudySmile.png', 'keltaCmuk.png', 'keltaW.png', 'maegoPog.png',
  'ok.webp', 'omegalul.webp', 'rumbuKEK.png', 'rumbuKEK2.png', 'rumbuSalute.png',
  'tomkoDawg.png', 'tomkoHehe.png', 'tomkoMoody.png', 'tomkoSleep.png', 'tomkoZvira.png',
  'xdd.webp', 'zemlaKEK.png', 'zemlavianky.png',
].map((f) => '/emotes/' + f)

const COUNT = 7        // koľko emotikonov naraz (vždy ≥ 4 aj počas obmieňania)
const OPACITY = 0.26   // jemné pozadie, nech nerušia text
const SPEED_MIN = 0.35 // beztiažové plachtenie — pomalý pohyb
const SPEED_MAX = 1.05

const rnd = (min, max) => min + Math.random() * (max - min)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export default function EmoteBackground() {
  const containerRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let W = window.innerWidth, H = window.innerHeight
    const onResize = () => { W = window.innerWidth; H = window.innerHeight }
    window.addEventListener('resize', onResize)

    const parts = []

    function spawn(fromTop) {
      const size = rnd(64, 120)
      const el = document.createElement('img')
      el.src = pick(EMOTES)
      el.className = 'emote-particle'
      el.decoding = 'async'
      el.style.width = size + 'px'
      el.style.opacity = '0'
      container.appendChild(el)
      requestAnimationFrame(() => { el.style.opacity = String(OPACITY) }) // plynulé objavenie
      const speed = rnd(SPEED_MIN, SPEED_MAX)
      const ang = rnd(0, Math.PI * 2)
      return {
        el, size,
        x: rnd(0, Math.max(1, W - size)),
        y: rnd(0, Math.max(1, H - size)),
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        rot: rnd(0, 360),
        vrot: rnd(-0.45, 0.45), // pomalá rotácia
        born: performance.now(),
      }
    }

    for (let i = 0; i < COUNT; i++) parts.push(spawn())

    // obmieňanie — každých ~5 s vymeň najstarší emotikon za nový
    const recycle = setInterval(() => {
      let idx = 0
      for (let i = 1; i < parts.length; i++) if (parts[i].born < parts[idx].born) idx = i
      const old = parts[idx]
      old.el.style.opacity = '0'
      setTimeout(() => { old.el.remove(); parts[idx] = spawn() }, 700)
    }, 5000)

    // beztiažové plachtenie — konštantná rýchlosť, elastický odraz od všetkých okrajov
    function tick() {
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot
        const maxX = W - p.size, maxY = H - p.size
        if (p.x <= 0) { p.x = 0; p.vx = Math.abs(p.vx) }
        else if (p.x >= maxX) { p.x = maxX; p.vx = -Math.abs(p.vx) }
        if (p.y <= 0) { p.y = 0; p.vy = Math.abs(p.vy) }
        else if (p.y >= maxY) { p.y = maxY; p.vy = -Math.abs(p.vy) }
        p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearInterval(recycle)
      window.removeEventListener('resize', onResize)
      parts.forEach((p) => p.el.remove())
    }
  }, [])

  return <div className="emote-bg" ref={containerRef} aria-hidden="true" />
}

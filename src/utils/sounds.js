// Decode MP3 into an AudioBuffer at module load so playback is instant.
let _ctx = null
let _buffer = null

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  return _ctx
}

fetch('/buzzer.mp3')
  .then((r) => r.arrayBuffer())
  .then((ab) => getCtx().decodeAudioData(ab))
  .then((buf) => { _buffer = buf })
  .catch(() => {})

export function playBuzzer() {
  if (!_buffer) return
  try {
    const ctx = getCtx()
    // Resume in case browser suspended the context before a user gesture
    if (ctx.state === 'suspended') ctx.resume()
    const src = ctx.createBufferSource()
    src.buffer = _buffer
    src.connect(ctx.destination)
    src.start(0)
  } catch (e) {}
}

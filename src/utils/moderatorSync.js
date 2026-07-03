import { useEffect, useRef, useState } from 'react'

// Klient (moderátorské okno na laptope): prijíma stav a posiela príkazy.
export function useModeratorClient(channelName) {
  const [state, setState] = useState(null)
  const chanRef = useRef(null)
  useEffect(() => {
    const ch = new BroadcastChannel(channelName)
    chanRef.current = ch
    ch.onmessage = (e) => { if (e.data?.type === 'state') setState(e.data.state) }
    ch.postMessage({ type: 'hello' })
    const iv = setInterval(() => ch.postMessage({ type: 'hello' }), 1500)
    return () => { clearInterval(iv); ch.close() }
  }, [channelName])
  const send = (type, extra) => chanRef.current?.postMessage({ type, ...extra })
  return [state, send]
}

// Host (hlavné okno na projektore): vysiela stav a prijíma príkazy z moderátorského okna.
// channelName – jedinečný názov kanála pre danú hru
// payload     – aktuálny stav hry (posiela sa moderátorskému oknu)
// handlers    – { commandType: (data) => void } príkazy z moderátorského okna
// deps        – pole závislostí; pri ich zmene sa stav prevysiela
export function useModeratorHost(channelName, payload, handlers, deps) {
  const chanRef = useRef(null)
  const payloadRef = useRef(payload)
  payloadRef.current = payload
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const ch = new BroadcastChannel(channelName)
    chanRef.current = ch
    ch.onmessage = (e) => {
      const d = e.data
      if (!d) return
      if (d.type === 'hello') { ch.postMessage({ type: 'state', state: payloadRef.current }); return }
      const fn = handlersRef.current[d.type]
      if (fn) fn(d)
    }
    return () => { ch.close(); chanRef.current = null }
  }, [channelName])

  useEffect(() => {
    chanRef.current?.postMessage({ type: 'state', state: payloadRef.current })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// Otvorí moderátorské okno pre danú hru (nová plocha — na laptop)
export function openModeratorWindow(game) {
  window.open(window.location.pathname + '?mod=' + game, game + '-moderator', 'width=620,height=880')
}

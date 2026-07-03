import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import FeudModerator from './components/FeudModerator.jsx'
import EmojiModerator from './components/EmojiModerator.jsx'
import AzModerator from './components/AzModerator.jsx'
import VnModerator from './components/VnModerator.jsx'
import './styles.css'

// Samostatné moderátorské okno (otvorené cez window.open ?mod=<hra>)
const mod = new URLSearchParams(window.location.search).get('mod')
const MODERATORS = {
  feud: FeudModerator,
  emoji: EmojiModerator,
  az: AzModerator,
  vn: VnModerator,
}
const ModComp = mod ? MODERATORS[mod] : null

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {ModComp ? <ModComp /> : <App />}
  </React.StrictMode>,
)

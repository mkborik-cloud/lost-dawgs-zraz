import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import FeudModerator from './components/FeudModerator.jsx'
import './styles.css'

// Samostatné moderátorské okno (otvorené cez window.open ?mod=feud)
const isFeudMod = new URLSearchParams(window.location.search).get('mod') === 'feud'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isFeudMod ? <FeudModerator /> : <App />}
  </React.StrictMode>,
)

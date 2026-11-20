import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ensureAudioRunning } from './audio'
import './index.css'
import App from './App.tsx'

ensureAudioRunning()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

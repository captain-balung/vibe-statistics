import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App.tsx'
import { AiProvider } from './context/AiContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AiProvider>
        <App />
      </AiProvider>
    </HashRouter>
  </StrictMode>,
)

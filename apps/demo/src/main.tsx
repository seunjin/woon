import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SeumProvider } from 'seum'
import './style.css'
import { App } from './App'

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SeumProvider>
      <App />
    </SeumProvider>
  </StrictMode>,
)

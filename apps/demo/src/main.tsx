import { ModalRoot } from '@woon-ui/dialog'
import { Toaster } from '@woon-ui/toast'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@woon-ui/react/css'
import './style.css'
import { App } from './App'

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <App />
      <ModalRoot zIndex={1000} />
      <Toaster position="bottom-right" />
    </>
  </StrictMode>,
)

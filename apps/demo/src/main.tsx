import { SeumProvider } from '@woon/core'
import { dialogPlugin } from '@woon/core/dialog'
import { toastPlugin } from '@woon/core/toast'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'seum/css'
import './style.css'
import { App } from './App'

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SeumProvider
      plugins={[dialogPlugin({ zIndex: 1000 }), toastPlugin({ position: 'bottom-right' })]}
    >
      <App />
    </SeumProvider>
  </StrictMode>,
)

import { dialogPlugin } from '@woon-ui/dialog'
import { WoonProvider } from '@woon-ui/react'
import { toastPlugin } from '@woon-ui/toast'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@woon-ui/react/css'
import './style.css'
import { App } from './App'

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WoonProvider
      plugins={[dialogPlugin({ zIndex: 1000 }), toastPlugin({ position: 'bottom-right' })]}
    >
      <App />
    </WoonProvider>
  </StrictMode>,
)

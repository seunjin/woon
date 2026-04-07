import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { type SeumConfig, SeumProvider } from 'seum'
import { Toaster } from 'seum/toast'
import 'seum/css/toast'
import './style.css'
import { App } from './App'
import { Alert } from './seum/ui/Alert'
import { Confirm } from './seum/ui/Confirm'

const seumConfig: SeumConfig = {
  defaults: { confirm: Confirm, alert: Alert },
  baseZIndex: 1000,
}

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SeumProvider config={seumConfig}>
      <App />
    </SeumProvider>
    <Toaster
      position="bottom-right"
      renderQueue={({ count }) => (
        <div data-seum-toast style={{ justifyContent: 'center', opacity: 0.7 }}>
          {count}개 알림 대기 중
        </div>
      )}
    />
  </StrictMode>,
)

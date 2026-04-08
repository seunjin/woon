import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SeumProvider } from 'seum'
import { dialogPlugin } from 'seum/dialog'
import { toastPlugin } from 'seum/toast'
import 'seum/css/toast'
import './style.css'
import { App } from './App'
import { Alert } from './seum/ui/Alert'
import { Confirm } from './seum/ui/Confirm'
import { Toast } from './seum/ui/Toast'

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SeumProvider
      plugins={[
        dialogPlugin({ defaults: { confirm: Confirm, alert: Alert } }),
        toastPlugin({ position: 'bottom-right', defaultRender: Toast }),
      ]}
      baseZIndex={1000}
    >
      <App />
    </SeumProvider>
  </StrictMode>,
)

import type { Preview } from '@storybook/react-vite'
import { WoonProvider } from '@woon-ui/core'
import { DialogRuntime } from '@woon-ui/dialog'
import { Toaster } from '@woon-ui/toast'
import { AlertSurface } from '../src/woon/alert'
import { ConfirmSurface } from '../src/woon/confirm'
import '@woon-ui/react/css'
import '../src/preview.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <WoonProvider renderers={{ alert: AlertSurface, confirm: ConfirmSurface }}>
        <Story />
        <DialogRuntime zIndex={1000} />
        <Toaster position="bottom-right" />
      </WoonProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
}

export default preview

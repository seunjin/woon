import type { Preview } from '@storybook/react-vite'
import { WoonProvider } from '@woon-ui/core'
import { AlertSurface } from '../src/woon/alert'
import { ConfirmSurface } from '../src/woon/confirm'
import '../src/preview.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <WoonProvider renderers={{ alert: AlertSurface, confirm: ConfirmSurface }}>
        <Story />
      </WoonProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
}

export default preview

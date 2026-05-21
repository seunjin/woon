import type { Preview } from '@storybook/react-vite'
import { DialogRuntime } from '@woon-ui/dialog'
import { Toaster } from '@woon-ui/toast'
import '@woon-ui/react/css'
import '../src/preview.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <>
        <Story />
        <DialogRuntime zIndex={1000} />
        <Toaster position="bottom-right" />
      </>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
}

export default preview

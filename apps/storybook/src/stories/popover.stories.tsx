import type { Meta, StoryObj } from '@storybook/react-vite'
import { Popover } from '@woon-ui/popover'

const meta = {
  title: 'Components/Popover',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SIDES = ['bottom', 'top', 'left', 'right'] as const
const ALIGNS = ['start', 'center', 'end'] as const

function PopoverMatrix() {
  return (
    <div className="woon-story woon-story-wide">
      {SIDES.map((side) => (
        <div key={side} className="woon-story-group">
          <p className="woon-story-label">{side}</p>
          <div className="woon-story-actions">
            {ALIGNS.map((align) => (
              <Popover.Root key={align}>
                <Popover.Trigger>
                  {side} / {align}
                </Popover.Trigger>
                <Popover.Content side={side} align={align}>
                  <p style={{ margin: 0 }}>
                    {side} · {align}
                  </p>
                </Popover.Content>
              </Popover.Root>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export const SideAlignMatrix: Story = {
  render: () => <PopoverMatrix />,
}

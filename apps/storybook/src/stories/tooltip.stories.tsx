import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip } from '@woon-ui/tooltip'

const meta = {
  title: 'Components/Tooltip',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SIDES = ['top', 'bottom', 'left', 'right'] as const
const ALIGNS = ['start', 'center', 'end'] as const

function SideAlignMatrixStory() {
  return (
    <div className="woon-story woon-story-wide">
      {SIDES.map((side) => (
        <div key={side} className="woon-story-group">
          <p className="woon-story-label">{side}</p>
          <div className="woon-story-actions">
            {ALIGNS.map((align) => (
              <Tooltip.Root key={align} side={side} align={align} delay={0}>
                <Tooltip.Trigger>
                  {side} / {align}
                </Tooltip.Trigger>
                <Tooltip.Content>
                  {side} · {align}
                </Tooltip.Content>
              </Tooltip.Root>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ArrowStory() {
  return (
    <div className="woon-story">
      <div className="woon-story-actions">
        {SIDES.map((side) => (
          <Tooltip.Root key={side} side={side} delay={0} sideOffset={12}>
            <Tooltip.Trigger>{side} + arrow</Tooltip.Trigger>
            <Tooltip.Content>
              {side} 툴팁
              <Tooltip.Arrow fill="#18181b" />
            </Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>
    </div>
  )
}

function RoundedArrowStory() {
  return (
    <div className="woon-story">
      <div className="woon-story-actions">
        {SIDES.map((side) => (
          <Tooltip.Root key={side} side={side} delay={0} sideOffset={12}>
            <Tooltip.Trigger>{side} + rounded</Tooltip.Trigger>
            <Tooltip.Content>
              {side} 툴팁
              <Tooltip.Arrow fill="#18181b" tipRadius={3} />
            </Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>
    </div>
  )
}

function BorderedArrowStory() {
  return (
    <div className="woon-story">
      <div className="woon-story-actions">
        {SIDES.map((side) => (
          <Tooltip.Root key={side} side={side} delay={0} sideOffset={12}>
            <Tooltip.Trigger>{side} + border</Tooltip.Trigger>
            <Tooltip.Content
              style={{
                background: '#fff',
                color: '#18181b',
                border: '1px solid #e4e4e7',
              }}
            >
              {side} 툴팁
              <Tooltip.Arrow fill="#fff" stroke="#e4e4e7" strokeWidth={1} tipRadius={2} />
            </Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>
    </div>
  )
}

function DelayStory() {
  return (
    <div className="woon-story">
      <div className="woon-story-actions">
        <Tooltip.Root delay={0}>
          <Tooltip.Trigger>즉시</Tooltip.Trigger>
          <Tooltip.Content>delay=0</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root delay={500}>
          <Tooltip.Trigger>500ms</Tooltip.Trigger>
          <Tooltip.Content>delay=500 (기본값)</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root delay={1000}>
          <Tooltip.Trigger>1000ms</Tooltip.Trigger>
          <Tooltip.Content>delay=1000</Tooltip.Content>
        </Tooltip.Root>
      </div>
    </div>
  )
}

export const SideAlignMatrix: Story = {
  render: () => <SideAlignMatrixStory />,
}

export const Arrow: Story = {
  render: () => <ArrowStory />,
}

export const RoundedArrow: Story = {
  render: () => <RoundedArrowStory />,
}

export const BorderedArrow: Story = {
  render: () => <BorderedArrowStory />,
}

export const Delay: Story = {
  render: () => <DelayStory />,
}

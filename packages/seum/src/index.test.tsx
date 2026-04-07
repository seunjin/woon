import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SeumProvider } from './index'
import type { DialogFlowStep } from './overlay/dialog'
import { alert, confirm, Dialog, useDialog } from './overlay/dialog'

interface TestHarnessProps {
  animated?: boolean
  overlay?: boolean
}

function TestHarness({ animated = false, overlay = true }: TestHarnessProps) {
  const { open } = useDialog()

  return (
    <button
      type="button"
      onClick={() => {
        open(
          ({ close }) => (
            <Dialog.Root>
              {overlay && <Dialog.Overlay data-testid="overlay" />}
              <Dialog.Content
                data-testid="content"
                style={
                  animated
                    ? {
                        animationDuration: '200ms',
                        animationName: 'fade-out',
                      }
                    : undefined
                }
              >
                <button type="button" onClick={close}>
                  close
                </button>
              </Dialog.Content>
            </Dialog.Root>
          ),
          { overlay },
        )
      }}
    >
      open
    </button>
  )
}

function ResultHarness() {
  const { open } = useDialog()

  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          const result = await open<void, boolean>(({ resolve, close }) => (
            <>
              <Dialog.Overlay />
              <Dialog.Content>
                <button type="button" onClick={close}>
                  cancel
                </button>
                <button type="button" onClick={() => resolve(true)}>
                  confirm
                </button>
              </Dialog.Content>
            </>
          )).result

          const node = document.querySelector('[data-testid="result"]')
          if (!node) return
          node.textContent =
            result.status === 'dismissed' ? 'dismissed' : `resolved:${String(result.value)}`
        }}
      >
        open result
      </button>
      <div data-testid="result" />
    </div>
  )
}

type StepState = { phase: 'confirm' | 'loading' }

function UpdateHarness() {
  const { open } = useDialog()

  return (
    <button
      type="button"
      onClick={() => {
        const handle = open<StepState, void>(
          ({ data }) => (
            <>
              <Dialog.Overlay />
              <Dialog.Content data-testid="stateful-content">{data.phase}</Dialog.Content>
            </>
          ),
          { initialData: { phase: 'confirm' } },
        )

        window.setTimeout(() => {
          handle.update({ phase: 'loading' })
        }, 20)
      }}
    >
      open stateful
    </button>
  )
}

type FlowState = { step: DialogFlowStep; message: string }

function FlowHarness() {
  const { open } = useDialog()

  return (
    <button
      type="button"
      onClick={() => {
        const handle = open<FlowState, void>(
          ({ data }) => (
            <>
              <Dialog.Overlay />
              <Dialog.Content data-testid="flow-content">
                {data.step}:{data.message}
              </Dialog.Content>
            </>
          ),
          { initialData: { step: 'confirm', message: 'ready' } },
        )

        window.setTimeout(() => {
          handle.update({ step: 'loading', message: 'working' })
        }, 20)
      }}
    >
      open flow
    </button>
  )
}

function PresetHarness() {
  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          await alert({
            title: 'saved',
            description: 'done',
          })

          const node = document.querySelector('[data-testid="alert-result"]')
          if (!node) return
          node.textContent = 'closed'
        }}
      >
        open alert
      </button>
      <button
        type="button"
        onClick={async () => {
          const result = await confirm({
            title: 'delete?',
            description: 'danger',
            confirmLabel: 'delete',
            cancelLabel: 'cancel',
            onConfirm: async () => {
              await new Promise((resolve) => {
                window.setTimeout(resolve, 20)
              })
            },
            success: {
              title: 'done',
              confirmLabel: 'ok',
            },
          })

          const node = document.querySelector('[data-testid="confirm-result"]')
          if (!node) return
          node.textContent = result.status
        }}
      >
        open confirm
      </button>
      <button
        type="button"
        onClick={async () => {
          const result = await confirm({
            title: 'archive?',
            description: 'safe',
            confirmLabel: 'archive',
            cancelLabel: 'cancel',
          })

          const node = document.querySelector('[data-testid="confirm-cancel-result"]')
          if (!node) return
          node.textContent = result.status
        }}
      >
        open confirm cancel
      </button>
      <div data-testid="alert-result" />
      <div data-testid="confirm-result" />
      <div data-testid="confirm-cancel-result" />
    </div>
  )
}

describe('SeumProvider dialog state transitions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      return window.setTimeout(() => callback(performance.now()), 16)
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      window.clearTimeout(id)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('switches to closed state before unmounting', async () => {
    render(
      <SeumProvider>
        <TestHarness />
      </SeumProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'open' }))
    fireEvent.click(screen.getByRole('button', { name: 'close' }))

    expect(screen.getByTestId('overlay')).toHaveAttribute('data-state', 'closed')
    expect(screen.getByTestId('content')).toHaveAttribute('data-state', 'closed')

    await act(async () => {
      vi.advanceTimersByTime(32)
    })

    expect(screen.queryByTestId('overlay')).not.toBeInTheDocument()
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('waits for exit duration before unmounting animated dialogs', async () => {
    render(
      <SeumProvider>
        <TestHarness animated />
      </SeumProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'open' }))
    fireEvent.click(screen.getByRole('button', { name: 'close' }))

    expect(screen.getByTestId('content')).toHaveAttribute('data-state', 'closed')

    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByTestId('content')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(82)
    })

    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('skips rendering the overlay element when overlay option is false', () => {
    render(
      <SeumProvider>
        <TestHarness overlay={false} />
      </SeumProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'open' }))

    expect(screen.queryByTestId('overlay')).not.toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('resolves dismissed result when a dialog closes without resolve', async () => {
    render(
      <SeumProvider>
        <ResultHarness />
      </SeumProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'open result' }))
    fireEvent.click(screen.getByRole('button', { name: 'cancel' }))

    await act(async () => {
      vi.advanceTimersByTime(32)
    })

    expect(screen.getByTestId('result')).toHaveTextContent('dismissed')
  })

  it('updates dialog data without replacing the mounted dialog instance', async () => {
    render(
      <SeumProvider>
        <UpdateHarness />
      </SeumProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'open stateful' }))

    const content = screen.getByTestId('stateful-content')

    expect(content).toHaveTextContent('confirm')

    await act(async () => {
      vi.advanceTimersByTime(20)
    })

    expect(screen.getByTestId('stateful-content')).toBe(content)
    expect(screen.getByTestId('stateful-content')).toHaveTextContent('loading')
  })

  it('updates flow step and data without reopening the dialog', async () => {
    render(
      <SeumProvider>
        <FlowHarness />
      </SeumProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'open flow' }))

    const content = screen.getByTestId('flow-content')

    expect(content).toHaveTextContent('confirm:ready')

    await act(async () => {
      vi.advanceTimersByTime(20)
    })

    expect(screen.getByTestId('flow-content')).toBe(content)
    expect(screen.getByTestId('flow-content')).toHaveTextContent('loading:working')
  })

  it('resolves alert and confirm presets through their opinionated flows', async () => {
    render(
      <SeumProvider>
        <PresetHarness />
      </SeumProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'open alert' }))
    fireEvent.click(screen.getByRole('button', { name: '확인' }))

    await act(async () => {
      vi.advanceTimersByTime(32)
    })

    expect(screen.getByTestId('alert-result')).toHaveTextContent('closed')

    fireEvent.click(screen.getByRole('button', { name: 'open confirm' }))
    fireEvent.click(screen.getByRole('button', { name: 'delete' }))

    await act(async () => {
      vi.advanceTimersByTime(20)
    })

    expect(screen.getByText('done')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'ok' }))

    await act(async () => {
      vi.advanceTimersByTime(32)
    })

    expect(screen.getByTestId('confirm-result')).toHaveTextContent('confirmed')

    fireEvent.click(screen.getByRole('button', { name: 'open confirm cancel' }))
    fireEvent.click(screen.getByRole('button', { name: 'cancel' }))

    await act(async () => {
      vi.advanceTimersByTime(32)
    })

    expect(screen.getByTestId('confirm-cancel-result')).toHaveTextContent('cancelled')
  })
})

import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SeumProvider } from './index'
import { Dialog, useDialog } from './overlay/dialog'

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
            <>
              <Dialog.Overlay data-testid="overlay" />
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
            </>
          ),
          { overlay },
        )
      }}
    >
      open
    </button>
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
})

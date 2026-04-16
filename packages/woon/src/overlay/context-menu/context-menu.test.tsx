import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContextMenu } from './index'

function TestMenu({
  onSelect,
  disabled = false,
}: {
  onSelect?: (item: string) => void
  disabled?: boolean
}) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div style={{ width: 200, height: 200 }}>우클릭 영역</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={() => onSelect?.('copy')}>복사</ContextMenu.Item>
        <ContextMenu.Item onSelect={() => onSelect?.('paste')}>붙여넣기</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item disabled={disabled} onSelect={() => onSelect?.('delete')}>
          삭제
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

function triggerContextMenu(element: HTMLElement, x = 100, y = 100) {
  fireEvent.contextMenu(element, { clientX: x, clientY: y })
}

describe('ContextMenu', () => {
  describe('열기 / 닫기', () => {
    it('우클릭 시 메뉴가 열린다', async () => {
      render(<TestMenu />)
      expect(screen.queryByRole('menu')).toBeNull()

      triggerContextMenu(screen.getByText('우클릭 영역'))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
    })

    it('ESC 키로 메뉴가 닫힌다', async () => {
      render(<TestMenu />)
      triggerContextMenu(screen.getByText('우클릭 영역'))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('menu')).toBeNull()
    })

    it('외부 클릭으로 메뉴가 닫힌다', async () => {
      render(
        <div>
          <TestMenu />
          <button type="button">외부 버튼</button>
        </div>,
      )
      triggerContextMenu(screen.getByText('우클릭 영역'))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      await userEvent.click(screen.getByRole('button', { name: '외부 버튼' }))
      expect(screen.queryByRole('menu')).toBeNull()
    })
  })

  describe('항목 선택', () => {
    it('항목 클릭 시 onSelect가 호출되고 메뉴가 닫힌다', async () => {
      const onSelect = vi.fn()
      render(<TestMenu onSelect={onSelect} />)

      triggerContextMenu(screen.getByText('우클릭 영역'))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      await userEvent.click(screen.getByRole('menuitem', { name: '복사' }))

      expect(onSelect).toHaveBeenCalledWith('copy')
      expect(screen.queryByRole('menu')).toBeNull()
    })

    it('disabled 항목은 클릭해도 onSelect가 호출되지 않는다', async () => {
      const onSelect = vi.fn()
      render(<TestMenu onSelect={onSelect} disabled />)

      triggerContextMenu(screen.getByText('우클릭 영역'))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      const deleteItem = screen.getByRole('menuitem', { name: '삭제' })
      expect(deleteItem).toHaveAttribute('aria-disabled')
      // pointer-events: none이므로 클릭이 도달하지 않음
      expect(onSelect).not.toHaveBeenCalledWith('delete')
    })
  })

  describe('키보드 내비게이션', () => {
    it('ArrowDown으로 항목을 하이라이트한다', async () => {
      render(<TestMenu />)
      triggerContextMenu(screen.getByText('우클릭 영역'))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      const menu = screen.getByRole('menu')
      const items = screen.getAllByRole('menuitem')
      expect(items[0]).not.toHaveAttribute('data-highlighted')

      fireEvent.keyDown(menu, { key: 'ArrowDown' })
      expect(items[0]).toHaveAttribute('data-highlighted')
    })

    it('Enter 키로 하이라이트된 항목을 선택한다', async () => {
      const onSelect = vi.fn()
      render(<TestMenu onSelect={onSelect} />)

      triggerContextMenu(screen.getByText('우클릭 영역'))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      const menu = screen.getByRole('menu')
      const items = screen.getAllByRole('menuitem')

      fireEvent.keyDown(menu, { key: 'ArrowDown' })
      expect(items[0]).toHaveAttribute('data-highlighted')

      // biome-ignore lint/style/noNonNullAssertion: items[0] is guaranteed by the preceding ArrowDown assertion
      fireEvent.keyDown(items[0]!, { key: 'Enter' })

      expect(onSelect).toHaveBeenCalledWith('copy')
      expect(screen.queryByRole('menu')).toBeNull()
    })
  })

  describe('ARIA', () => {
    it('콘텐츠에 role="menu"가 있다', async () => {
      render(<TestMenu />)
      triggerContextMenu(screen.getByText('우클릭 영역'))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
    })

    it('항목에 role="menuitem"이 있다', async () => {
      render(<TestMenu />)
      triggerContextMenu(screen.getByText('우클릭 영역'))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      const items = screen.getAllByRole('menuitem')
      expect(items).toHaveLength(3)
    })
  })

  describe('구조 컴포넌트', () => {
    it('Separator가 role="separator"로 렌더된다', async () => {
      render(<TestMenu />)
      triggerContextMenu(screen.getByText('우클릭 영역'))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      expect(screen.getByRole('separator')).toBeInTheDocument()
    })

    it('Label이 렌더된다', async () => {
      render(
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <div>영역</div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Label>편집</ContextMenu.Label>
            <ContextMenu.Item>복사</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>,
      )
      triggerContextMenu(screen.getByText('영역'))
      await waitFor(() => expect(screen.getByText('편집')).toBeInTheDocument())
    })

    it('Group이 role="group"으로 렌더된다', async () => {
      render(
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <div>영역</div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Group>
              <ContextMenu.Item>항목</ContextMenu.Item>
            </ContextMenu.Group>
          </ContextMenu.Content>
        </ContextMenu.Root>,
      )
      triggerContextMenu(screen.getByText('영역'))
      await waitFor(() => expect(screen.getByRole('group')).toBeInTheDocument())
    })
  })

  describe('제어 컴포넌트 (controlled)', () => {
    it('open prop으로 상태를 제어할 수 있다', async () => {
      const { rerender } = render(
        <ContextMenu.Root open={false}>
          <ContextMenu.Trigger>
            <div>영역</div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Item>항목</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>,
      )
      expect(screen.queryByRole('menu')).toBeNull()

      rerender(
        <ContextMenu.Root open={true}>
          <ContextMenu.Trigger>
            <div>영역</div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Item>항목</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>,
      )
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
    })

    it('onOpenChange가 호출된다', async () => {
      const onOpenChange = vi.fn()
      render(
        <ContextMenu.Root onOpenChange={onOpenChange}>
          <ContextMenu.Trigger>
            <div>영역</div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Item>항목</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>,
      )
      triggerContextMenu(screen.getByText('영역'))
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })
  })
})

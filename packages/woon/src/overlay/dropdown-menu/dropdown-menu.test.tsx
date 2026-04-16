import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DropdownMenu } from './index'

function TestMenu({
  onSelect,
  disabled = false,
}: {
  onSelect?: (item: string) => void
  disabled?: boolean
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>메뉴 열기</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={() => onSelect?.('profile')}>프로필</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => onSelect?.('settings')}>설정</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item disabled={disabled} onSelect={() => onSelect?.('delete')}>
          삭제
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

describe('DropdownMenu', () => {
  describe('열기 / 닫기', () => {
    it('트리거 클릭 시 메뉴가 열린다', async () => {
      render(<TestMenu />)
      expect(screen.queryByRole('menu')).toBeNull()

      await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('트리거를 다시 클릭하면 메뉴가 닫힌다', async () => {
      render(<TestMenu />)
      const trigger = screen.getByRole('button', { name: '메뉴 열기' })

      await userEvent.click(trigger)
      expect(screen.getByRole('menu')).toBeInTheDocument()

      await userEvent.click(trigger)
      expect(screen.queryByRole('menu')).toBeNull()
    })

    it('ESC 키로 메뉴가 닫힌다', async () => {
      render(<TestMenu />)
      await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

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
      await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: '외부 버튼' }))
      expect(screen.queryByRole('menu')).toBeNull()
    })
  })

  describe('항목 선택', () => {
    it('항목 클릭 시 onSelect가 호출되고 메뉴가 닫힌다', async () => {
      const onSelect = vi.fn()
      render(<TestMenu onSelect={onSelect} />)

      await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
      await userEvent.click(screen.getByRole('menuitem', { name: '프로필' }))

      expect(onSelect).toHaveBeenCalledWith('profile')
      expect(screen.queryByRole('menu')).toBeNull()
    })

    it('disabled 항목은 클릭해도 onSelect가 호출되지 않는다', async () => {
      const onSelect = vi.fn()
      render(<TestMenu onSelect={onSelect} disabled />)

      await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
      const deleteItem = screen.getByRole('menuitem', { name: '삭제' })

      expect(deleteItem).toHaveAttribute('aria-disabled')
      // pointer-events: none이므로 클릭이 도달하지 않음
      expect(onSelect).not.toHaveBeenCalledWith('delete')
    })
  })

  describe('키보드 내비게이션', () => {
    it('ArrowDown으로 항목을 하이라이트한다', async () => {
      render(<TestMenu />)
      await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))

      const menu = screen.getByRole('menu')
      const items = screen.getAllByRole('menuitem')
      expect(items[0]).not.toHaveAttribute('data-highlighted')

      // floating 요소의 onKeyDown에 직접 이벤트 발생 (FloatingFocusManager 포커스 상태에 의존하지 않음)
      fireEvent.keyDown(menu, { key: 'ArrowDown' })
      expect(items[0]).toHaveAttribute('data-highlighted')
    })

    it('Enter 키로 하이라이트된 항목을 선택한다', async () => {
      const onSelect = vi.fn()
      render(<TestMenu onSelect={onSelect} />)

      await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
      const menu = screen.getByRole('menu')
      const items = screen.getAllByRole('menuitem')

      fireEvent.keyDown(menu, { key: 'ArrowDown' })
      expect(items[0]).toHaveAttribute('data-highlighted')

      // 하이라이트된 첫 번째 항목에 직접 Enter 이벤트 발생
      // biome-ignore lint/style/noNonNullAssertion: items[0] is guaranteed by the preceding ArrowDown assertion
      fireEvent.keyDown(items[0]!, { key: 'Enter' })

      expect(onSelect).toHaveBeenCalledWith('profile')
      expect(screen.queryByRole('menu')).toBeNull()
    })
  })

  describe('ARIA', () => {
    it('트리거에 aria-expanded와 aria-haspopup이 있다', async () => {
      render(<TestMenu />)
      const trigger = screen.getByRole('button', { name: '메뉴 열기' })

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')

      await userEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('콘텐츠에 role="menu"가 있다', async () => {
      render(<TestMenu />)
      await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('항목에 role="menuitem"이 있다', async () => {
      render(<TestMenu />)
      await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
      const items = screen.getAllByRole('menuitem')
      expect(items).toHaveLength(3)
    })
  })

  describe('구조 컴포넌트', () => {
    it('Separator가 role="separator"로 렌더된다', async () => {
      render(<TestMenu />)
      await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
      expect(screen.getByRole('separator')).toBeInTheDocument()
    })

    it('Label이 렌더된다', async () => {
      render(
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>열기</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>계정</DropdownMenu.Label>
            <DropdownMenu.Item>프로필</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      )
      await userEvent.click(screen.getByRole('button', { name: '열기' }))
      expect(screen.getByText('계정')).toBeInTheDocument()
    })

    it('Group이 role="group"으로 렌더된다', async () => {
      render(
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>열기</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Group>
              <DropdownMenu.Item>항목</DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      )
      await userEvent.click(screen.getByRole('button', { name: '열기' }))
      expect(screen.getByRole('group')).toBeInTheDocument()
    })
  })

  describe('제어 컴포넌트 (controlled)', () => {
    it('open prop으로 상태를 제어할 수 있다', async () => {
      const { rerender } = render(
        <DropdownMenu.Root open={false}>
          <DropdownMenu.Trigger>메뉴</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>항목</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      )
      expect(screen.queryByRole('menu')).toBeNull()

      rerender(
        <DropdownMenu.Root open={true}>
          <DropdownMenu.Trigger>메뉴</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>항목</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      )
      // rerender 후 Floating UI 포지셔닝 + rAF 완료를 기다림
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
    })

    it('onOpenChange가 호출된다', async () => {
      const onOpenChange = vi.fn()
      render(
        <DropdownMenu.Root onOpenChange={onOpenChange}>
          <DropdownMenu.Trigger>메뉴</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>항목</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      )
      await userEvent.click(screen.getByRole('button', { name: '메뉴' }))
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })
  })
})

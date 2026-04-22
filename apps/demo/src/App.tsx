import { Combobox } from '@woon-ui/combobox'
import { ContextMenu } from '@woon-ui/context-menu'
import { confirm, useWoonDialogContext, alert as woonAlert } from '@woon-ui/dialog'
import { Drawer } from '@woon-ui/drawer'
import { DropdownMenu } from '@woon-ui/dropdown-menu'
import { Popover } from '@woon-ui/popover'
import { useDialog } from '@woon-ui/react'
import { Select } from '@woon-ui/select'
import { toast } from '@woon-ui/toast'
import { Tooltip } from '@woon-ui/tooltip'
import { useMemo, useState } from 'react'

const FRUITS = [
  { value: 'apple', label: '사과' },
  { value: 'banana', label: '바나나' },
  { value: 'cherry', label: '체리' },
  { value: 'grape', label: '포도' },
  { value: 'kiwi', label: '키위' },
  { value: 'mango', label: '망고' },
  { value: 'orange', label: '오렌지' },
  { value: 'peach', label: '복숭아' },
]

function ComboboxDemo() {
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => FRUITS.filter((f) => f.label.includes(query) || f.value.includes(query)),
    [query],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Combobox.Root
        value={value}
        onValueChange={setValue}
        inputValue={query}
        onInputValueChange={setQuery}
      >
        <Combobox.Input placeholder="과일 검색..." />
        <Combobox.Content>
          {filtered.map((f) => (
            <Combobox.Item key={f.value} value={f.value}>
              {f.label}
            </Combobox.Item>
          ))}
          {filtered.length === 0 && <Combobox.Empty>결과 없음</Combobox.Empty>}
        </Combobox.Content>
      </Combobox.Root>
      <span style={{ fontSize: 13, color: '#71717a' }}>
        선택된 값: {value || '없음'} / 입력: {query || '없음'}
      </span>
    </div>
  )
}

function ComboboxFreeFormDemo() {
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => FRUITS.filter((f) => f.label.includes(query) || f.value.includes(query)),
    [query],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Combobox.Root
        freeForm
        value={value}
        onValueChange={setValue}
        inputValue={query}
        onInputValueChange={setQuery}
      >
        <Combobox.Input placeholder="직접 입력하거나 선택..." />
        <Combobox.Content>
          {filtered.map((f) => (
            <Combobox.Item key={f.value} value={f.value}>
              {f.label}
            </Combobox.Item>
          ))}
          {filtered.length === 0 && <Combobox.Empty>결과 없음</Combobox.Empty>}
        </Combobox.Content>
      </Combobox.Root>
      <span style={{ fontSize: 13, color: '#71717a' }}>
        value: {value || '없음'} / inputValue: {query || '없음'}
      </span>
    </div>
  )
}

function SelectDemo() {
  const [value, setValue] = useState('')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder="과일을 선택하세요" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="apple">사과</Select.Item>
          <Select.Item value="banana">바나나</Select.Item>
          <Select.Item value="orange">오렌지</Select.Item>
          <Select.Item value="grape">포도</Select.Item>
          <Select.Item value="mango">망고</Select.Item>
        </Select.Content>
      </Select.Root>
      <span style={{ fontSize: 13, color: '#71717a' }}>선택된 값: {value || '없음'}</span>
    </div>
  )
}

function SelectGroupDemo() {
  const [value, setValue] = useState('')
  return (
    <Select.Root value={value} onValueChange={setValue}>
      <Select.Trigger>
        <Select.Value placeholder="음식을 선택하세요" />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>과일</Select.Label>
          <Select.Item value="apple">사과</Select.Item>
          <Select.Item value="banana">바나나</Select.Item>
          <Select.Item value="mango" disabled>
            망고 (품절)
          </Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.Label>채소</Select.Label>
          <Select.Item value="carrot">당근</Select.Item>
          <Select.Item value="broccoli">브로콜리</Select.Item>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  )
}

import { Modal } from './components/Modal'
import { SidePanel } from './components/SidePanel'
import { DialogPrimitive } from './woon/ui/Dialog'

// ─── 중첩 모달 ────────────────────────────────────────────────────────────────

function NestedModal({ depth }: { depth: number }) {
  const { close, closeAll } = useWoonDialogContext()
  const dialog = useDialog()

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>중첩 모달 {depth}단계</DialogPrimitive.Title>
        <DialogPrimitive.Description>ESC는 최상단만 닫습니다.</DialogPrimitive.Description>
        <div>
          <button
            type="button"
            onClick={() => dialog.open(() => <NestedModal depth={depth + 1} />)}
          >
            한 단계 더
          </button>
          <button type="button" onClick={closeAll}>
            모두 닫기
          </button>
          <button type="button" onClick={close}>
            이것만 닫기
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}

// ─── 값 반환 모달 ─────────────────────────────────────────────────────────────

function ResolveModal() {
  const { resolve } = useWoonDialogContext()

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>값 반환 테스트</DialogPrimitive.Title>
        <DialogPrimitive.Description>버튼에 따라 다른 값을 반환합니다.</DialogPrimitive.Description>
        <div>
          <DialogPrimitive.Close asChild>
            <button type="button">취소 (dismissed)</button>
          </DialogPrimitive.Close>
          <button type="button" onClick={() => resolve({ confirmed: true, value: 42 })}>
            확인 (resolved)
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export function App() {
  const dialog = useDialog()
  const [result, setResult] = useState<string>('')

  // ── Dialog ──

  function openBasic() {
    dialog.open(() => (
      <Modal title="기본 모달" description="useWoonDialogContext()로 close 접근." />
    ))
  }

  function openSidePanel() {
    dialog.open(() => (
      <SidePanel
        title="사이드 패널"
        description="Dialog.Root로 overlay=false, trapFocus=false, scrollLock=false."
      />
    ))
  }

  function openNested() {
    dialog.open(() => <NestedModal depth={1} />)
  }

  async function openResolve() {
    const handle = dialog.open<undefined, { confirmed: boolean; value: number } | undefined>(() => (
      <ResolveModal />
    ))
    const r = await handle.result
    setResult(JSON.stringify(r))
  }

  // ── confirm ──

  async function runConfirmBasic() {
    const r = await confirm({
      title: '변경사항을 저장할까요?',
      description: '저장하지 않으면 변경사항이 사라집니다.',
      confirmLabel: '저장',
      cancelLabel: '취소',
    })
    setResult(JSON.stringify(r))
  }

  async function runConfirmAsync() {
    const r = await confirm({
      title: '배포를 진행할까요?',
      description: '프로덕션에 즉시 반영됩니다.',
      confirmLabel: '배포',
      cancelLabel: '취소',
      onConfirm: async () => {
        await new Promise((res) => window.setTimeout(res, 1200))
      },
      loading: { title: '배포 중', confirmLabel: '처리 중...' },
      success: {
        title: '배포 완료',
        description: '프로덕션에 반영되었습니다.',
        confirmLabel: '확인',
      },
    })
    setResult(JSON.stringify(r))
  }

  async function runConfirmError() {
    const r = await confirm({
      title: '계정을 삭제할까요?',
      description: '이 작업은 되돌릴 수 없습니다.',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      tone: 'danger',
      onConfirm: async () => {
        await new Promise((_, rej) => window.setTimeout(() => rej(new Error('서버 오류')), 900))
      },
      loading: { title: '삭제 중', confirmLabel: '처리 중...' },
      error: (err) => ({
        title: '삭제 실패',
        description: err instanceof Error ? err.message : '다시 시도해주세요.',
        confirmLabel: '다시 시도',
        cancelLabel: '닫기',
      }),
    })
    setResult(JSON.stringify(r))
  }

  // ── alert ──

  async function runAlertBasic() {
    await woonAlert({ title: '저장되었습니다', confirmLabel: '확인' })
    setResult('alert closed')
  }

  async function runAlertDanger() {
    await woonAlert({
      title: '접근이 거부되었습니다',
      description: '권한이 없습니다.',
      confirmLabel: '확인',
      tone: 'danger',
    })
    setResult('alert closed')
  }

  // ── toast ──

  function toastBasic() {
    toast({ title: '파일이 저장되었습니다' })
  }

  function toastDanger() {
    toast({ title: '서버 연결에 실패했습니다' }, { tone: 'danger' })
  }

  function toastUndo() {
    toast(
      {
        title: '파일이 삭제되었습니다',
        action: { label: '실행 취소', onClick: () => {} },
      },
      { duration: Infinity },
    )
  }

  function toastUpdate() {
    const handle = toast({ title: '업로드 중...' }, { duration: Infinity })
    window.setTimeout(() => {
      handle.update({ title: '업로드 완료!' })
      window.setTimeout(() => handle.close(), 3000)
    }, 1500)
  }

  function toastStack() {
    for (let i = 1; i <= 5; i++) {
      window.setTimeout(() => toast({ title: `알림 ${i}번` }), i * 600)
    }
  }

  return (
    <div>
      <h1>Woon Demo</h1>
      <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>
        결과: <code>{result || '—'}</code>
      </p>

      <h2>Dialog</h2>
      <div className="section">
        <button type="button" onClick={openBasic}>
          기본 모달
        </button>
        <button type="button" onClick={openResolve}>
          값 반환
        </button>
        <button type="button" onClick={openNested}>
          중첩 모달
        </button>
        <button type="button" onClick={openSidePanel}>
          사이드 패널
        </button>
      </div>

      <h2>confirm()</h2>
      <div className="section">
        <button type="button" onClick={runConfirmBasic}>
          기본
        </button>
        <button type="button" onClick={runConfirmAsync}>
          비동기 + 성공
        </button>
        <button type="button" onClick={runConfirmError}>
          비동기 + 에러 재시도
        </button>
      </div>

      <h2>toast()</h2>
      <div className="section">
        <button type="button" onClick={toastBasic}>
          기본 (5초 자동 닫힘)
        </button>
        <button type="button" onClick={toastDanger}>
          Danger 톤
        </button>
        <button type="button" onClick={toastUndo}>
          Undo (영구 유지)
        </button>
        <button type="button" onClick={toastUpdate}>
          업로드 → 완료 업데이트
        </button>
        <button type="button" onClick={toastStack}>
          5개 한번에
        </button>
      </div>

      <h2>alert()</h2>
      <div className="section">
        <button type="button" onClick={runAlertBasic}>
          기본
        </button>
        <button type="button" onClick={runAlertDanger}>
          Danger 톤
        </button>
      </div>

      <h2>Popover — bottom</h2>
      <div className="section">
        {(['start', 'center', 'end'] as const).map((align) => (
          <Popover.Root key={align}>
            <Popover.Trigger>bottom / {align}</Popover.Trigger>
            <Popover.Content side="bottom" align={align}>
              <p style={{ margin: 0 }}>bottom · {align}</p>
            </Popover.Content>
          </Popover.Root>
        ))}
      </div>

      <h2>Popover — top</h2>
      <div className="section">
        {(['start', 'center', 'end'] as const).map((align) => (
          <Popover.Root key={align}>
            <Popover.Trigger>top / {align}</Popover.Trigger>
            <Popover.Content side="top" align={align}>
              <p style={{ margin: 0 }}>top · {align}</p>
            </Popover.Content>
          </Popover.Root>
        ))}
      </div>

      <h2>Popover — left</h2>
      <div className="section">
        {(['start', 'center', 'end'] as const).map((align) => (
          <Popover.Root key={align}>
            <Popover.Trigger>left / {align}</Popover.Trigger>
            <Popover.Content side="left" align={align}>
              <p style={{ margin: 0 }}>left · {align}</p>
            </Popover.Content>
          </Popover.Root>
        ))}
      </div>

      <h2>Popover — right</h2>
      <div className="section">
        {(['start', 'center', 'end'] as const).map((align) => (
          <Popover.Root key={align}>
            <Popover.Trigger>right / {align}</Popover.Trigger>
            <Popover.Content side="right" align={align}>
              <p style={{ margin: 0 }}>right · {align}</p>
            </Popover.Content>
          </Popover.Root>
        ))}
      </div>

      <h2>Tooltip — top</h2>
      <div className="section">
        {(['start', 'center', 'end'] as const).map((align) => (
          <Tooltip.Root key={align} side="top" align={align} delay={0}>
            <Tooltip.Trigger>top / {align}</Tooltip.Trigger>
            <Tooltip.Content>top · {align}</Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>

      <h2>Tooltip — bottom</h2>
      <div className="section">
        {(['start', 'center', 'end'] as const).map((align) => (
          <Tooltip.Root key={align} side="bottom" align={align} delay={0}>
            <Tooltip.Trigger>bottom / {align}</Tooltip.Trigger>
            <Tooltip.Content>bottom · {align}</Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>

      <h2>Tooltip — left</h2>
      <div className="section">
        {(['start', 'center', 'end'] as const).map((align) => (
          <Tooltip.Root key={align} side="left" align={align} delay={0}>
            <Tooltip.Trigger>left / {align}</Tooltip.Trigger>
            <Tooltip.Content>left · {align}</Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>

      <h2>Tooltip — right</h2>
      <div className="section">
        {(['start', 'center', 'end'] as const).map((align) => (
          <Tooltip.Root key={align} side="right" align={align} delay={0}>
            <Tooltip.Trigger>right / {align}</Tooltip.Trigger>
            <Tooltip.Content>right · {align}</Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>

      <h2>Tooltip — with Arrow</h2>
      <div className="section">
        {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
          <Tooltip.Root key={side} side={side} delay={0} sideOffset={12}>
            <Tooltip.Trigger>{side} + arrow</Tooltip.Trigger>
            <Tooltip.Content>
              {side} 툴팁
              <Tooltip.Arrow fill="#18181b" />
            </Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>

      <h2>Tooltip — Arrow rounded</h2>
      <div className="section">
        {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
          <Tooltip.Root key={side} side={side} delay={0} sideOffset={12}>
            <Tooltip.Trigger>{side} + rounded</Tooltip.Trigger>
            <Tooltip.Content>
              {side} 툴팁
              <Tooltip.Arrow fill="#18181b" tipRadius={3} />
            </Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>

      <h2>Tooltip — Arrow with border</h2>
      <div className="section">
        {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
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
              <Tooltip.Arrow
                fill="#fff"
                stroke="#e4e4e7"
                strokeWidth={1}
                tipRadius={2}
                style={{}}
              />
            </Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>

      <h2>Tooltip — delay</h2>
      <div className="section">
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

      {/* ─── DropdownMenu ───────────────────────────────────────────────────── */}

      <h2>DropdownMenu — 기본</h2>
      <div className="section">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>계정 메뉴</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>계정</DropdownMenu.Label>
            <DropdownMenu.Item onSelect={() => alert('프로필')}>프로필</DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => alert('설정')}>설정</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={() => alert('로그아웃')}>로그아웃</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      <h2>DropdownMenu — disabled 항목</h2>
      <div className="section">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>파일</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={() => alert('새 파일')}>새 파일</DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => alert('열기')}>열기</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item disabled>저장 (비활성)</DropdownMenu.Item>
            <DropdownMenu.Item disabled>다른 이름으로 저장 (비활성)</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      <h2>DropdownMenu — Group + Label</h2>
      <div className="section">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>편집</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Group>
              <DropdownMenu.Label>클립보드</DropdownMenu.Label>
              <DropdownMenu.Item onSelect={() => alert('잘라내기')}>잘라내기</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => alert('복사')}>복사</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => alert('붙여넣기')}>붙여넣기</DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              <DropdownMenu.Label>선택</DropdownMenu.Label>
              <DropdownMenu.Item onSelect={() => alert('전체 선택')}>전체 선택</DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      {/* ─── ContextMenu ────────────────────────────────────────────────────── */}

      <h2>ContextMenu — 기본</h2>
      <div className="section">
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <div
              style={{
                padding: '2rem',
                border: '2px dashed #e4e4e7',
                borderRadius: 8,
                color: '#71717a',
                userSelect: 'none',
              }}
            >
              여기서 우클릭 하세요
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Label>편집</ContextMenu.Label>
            <ContextMenu.Item onSelect={() => alert('복사')}>복사</ContextMenu.Item>
            <ContextMenu.Item onSelect={() => alert('붙여넣기')}>붙여넣기</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item onSelect={() => alert('삭제')}>삭제</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </div>

      <h2>ContextMenu — disabled 항목</h2>
      <div className="section">
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <div
              style={{
                padding: '2rem',
                border: '2px dashed #e4e4e7',
                borderRadius: 8,
                color: '#71717a',
                userSelect: 'none',
              }}
            >
              여기서 우클릭 하세요 (비활성 항목 포함)
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Item onSelect={() => alert('새 파일')}>새 파일</ContextMenu.Item>
            <ContextMenu.Item onSelect={() => alert('열기')}>열기</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item disabled>저장 (비활성)</ContextMenu.Item>
            <ContextMenu.Item disabled>다른 이름으로 저장 (비활성)</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </div>

      <h2>ContextMenu — Group + Label</h2>
      <div className="section">
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <div
              style={{
                padding: '2rem',
                border: '2px dashed #e4e4e7',
                borderRadius: 8,
                color: '#71717a',
                userSelect: 'none',
              }}
            >
              여기서 우클릭 하세요 (그룹 메뉴)
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Group>
              <ContextMenu.Label>클립보드</ContextMenu.Label>
              <ContextMenu.Item onSelect={() => alert('잘라내기')}>잘라내기</ContextMenu.Item>
              <ContextMenu.Item onSelect={() => alert('복사')}>복사</ContextMenu.Item>
              <ContextMenu.Item onSelect={() => alert('붙여넣기')}>붙여넣기</ContextMenu.Item>
            </ContextMenu.Group>
            <ContextMenu.Separator />
            <ContextMenu.Group>
              <ContextMenu.Label>선택</ContextMenu.Label>
              <ContextMenu.Item onSelect={() => alert('전체 선택')}>전체 선택</ContextMenu.Item>
            </ContextMenu.Group>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </div>

      <h2>COMBOBOX — 자동완성</h2>
      <div className="section">
        <ComboboxDemo />
      </div>

      <h2>COMBOBOX — freeForm</h2>
      <div className="section">
        <ComboboxFreeFormDemo />
      </div>

      <h2>SELECT</h2>
      <div className="section">
        <SelectDemo />
      </div>

      <h2>SELECT — 비활성/그룹/disabled</h2>
      <div className="section">
        <SelectGroupDemo />
        <Select.Root disabled>
          <Select.Trigger>
            <Select.Value placeholder="비활성 셀렉트" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="a">항목 A</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>

      {/* ─── Drawer ─────────────────────────────────────────────────────────── */}

      <h2>Drawer — right</h2>
      <div className="section">
        <button
          type="button"
          onClick={() =>
            dialog.open(() => (
              <Drawer.Root direction="right">
                <Drawer.Overlay />
                <Drawer.Content>
                  <Drawer.Title>오른쪽 Drawer</Drawer.Title>
                  <Drawer.Description>
                    Dialog overlay 시스템 위에서 동작하는 edge-attached surface입니다.
                  </Drawer.Description>
                  <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                    <input
                      defaultValue="Woon UI"
                      style={{
                        height: 40,
                        border: '1px solid #d4d4d8',
                        borderRadius: 10,
                        padding: '0 12px',
                      }}
                    />
                    <textarea
                      defaultValue="Drawer는 Dialog lifecycle을 그대로 사용합니다."
                      rows={5}
                      style={{
                        border: '1px solid #d4d4d8',
                        borderRadius: 10,
                        padding: 12,
                        resize: 'vertical',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Drawer.Close asChild>
                        <button type="button">닫기</button>
                      </Drawer.Close>
                      <button type="button">저장</button>
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Root>
            ))
          }
        >
          오른쪽 Drawer 열기
        </button>
      </div>

      <h2>Drawer — left / right / top</h2>
      <div className="section">
        {(['left', 'right', 'top'] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() =>
              dialog.open(() => (
                <Drawer.Root direction={direction} dragToClose>
                  <Drawer.Overlay />
                  <Drawer.Content
                    style={
                      direction === 'top'
                        ? { maxHeight: 'min(70dvh, 24rem)' }
                        : { width: 'min(24rem, 100dvw)' }
                    }
                  >
                    {direction === 'top' ? <Drawer.Handle /> : null}
                    <Drawer.Title>{direction} Drawer</Drawer.Title>
                    <Drawer.Description>
                      {direction === 'top'
                        ? '콘텐츠를 위로 끌어 닫을 수 있고, 스크롤은 맨 아래에서만 close drag로 전환됩니다.'
                        : direction === 'right'
                          ? '콘텐츠를 오른쪽 edge로 끌어 닫을 수 있고, 가로 스크롤은 시작점에서만 close drag로 전환됩니다.'
                          : '콘텐츠를 왼쪽 edge로 끌어 닫을 수 있고, 가로 스크롤은 끝까지 이동했을 때만 close drag로 전환됩니다.'}
                    </Drawer.Description>
                    <div style={{ display: 'grid', gap: 12, marginTop: 16, minHeight: 0 }}>
                      {direction === 'top' ? null : (
                        <div style={{ display: 'grid', gap: 6 }}>
                          <span style={{ fontSize: 13, color: '#52525b' }}>가로 스크롤 테스트</span>
                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              overflowX: 'auto',
                              paddingBottom: 4,
                            }}
                          >
                            {Array.from({ length: 8 }, (_, i) => `${direction} ${i + 1}`).map(
                              (item) => (
                                <button
                                  key={item}
                                  type="button"
                                  style={{
                                    flex: '0 0 auto',
                                    minWidth: 112,
                                    minHeight: 40,
                                    border: '1px solid #e4e4e7',
                                    borderRadius: 999,
                                    padding: '0 14px',
                                  }}
                                >
                                  {item}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'grid',
                          gap: 10,
                        }}
                      >
                        {(direction === 'top'
                          ? Array.from({ length: 12 }, (_, i) => `공지 ${i + 1}`)
                          : ['Overview', 'Analytics', 'Members', 'Settings']
                        ).map((item) => (
                          <button
                            key={item}
                            type="button"
                            style={{
                              textAlign: 'left',
                              border: '1px solid #e4e4e7',
                              borderRadius: 10,
                              padding: '10px 12px',
                            }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Drawer.Content>
                </Drawer.Root>
              ))
            }
          >
            {direction}
          </button>
        ))}
      </div>

      <h2>Drawer — bottom</h2>
      <div className="section">
        <button
          type="button"
          onClick={() =>
            dialog.open(() => (
              <Drawer.Root direction="bottom" dragToClose>
                <Drawer.Overlay />
                <Drawer.Content style={{ maxHeight: 'min(75dvh, 28rem)' }}>
                  <Drawer.Handle />
                  <Drawer.Title>모바일 액션 패널</Drawer.Title>
                  <Drawer.Description>
                    콘텐츠를 아래로 끌어 닫을 수 있고, 스크롤은 맨 위에서만 close drag로 전환됩니다.
                  </Drawer.Description>
                  <div style={{ display: 'grid', gap: 12, marginTop: 16, minHeight: 0 }}>
                    <div
                      data-woon-drawer-no-drag
                      style={{
                        display: 'grid',
                        gap: 6,
                        padding: 14,
                        borderRadius: 12,
                        background: '#fafafa',
                      }}
                    >
                      <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ fontSize: 13, color: '#52525b' }}>메모</span>
                        <textarea
                          rows={3}
                          defaultValue="data-woon-drawer-no-drag 안에서는 입력과 선택이 drag dismiss보다 우선합니다."
                          style={{
                            border: '1px solid #d4d4d8',
                            borderRadius: 10,
                            padding: 12,
                            resize: 'vertical',
                          }}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gap: 10, overflowY: 'auto', minHeight: 0 }}>
                      {Array.from({ length: 12 }, (_, i) => `액션 ${i + 1}`).map((label) => (
                        <button
                          key={label}
                          type="button"
                          style={{
                            textAlign: 'left',
                            border: '1px solid #e4e4e7',
                            borderRadius: 10,
                            padding: '12px 14px',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                      <Drawer.Close asChild>
                        <button type="button">닫기</button>
                      </Drawer.Close>
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Root>
            ))
          }
        >
          bottom Drawer 열기
        </button>
      </div>

      <h2>Drawer — top</h2>
      <div className="section">
        <button
          type="button"
          onClick={() =>
            dialog.open(() => (
              <Drawer.Root direction="top" dragToClose>
                <Drawer.Overlay />
                <Drawer.Content style={{ maxHeight: 'min(70dvh, 24rem)' }}>
                  <Drawer.Handle />
                  <Drawer.Title>상단 공지 패널</Drawer.Title>
                  <Drawer.Description>
                    콘텐츠를 위로 끌어 닫을 수 있고, 스크롤은 맨 아래에서만 close drag로 전환됩니다.
                  </Drawer.Description>
                  <div style={{ display: 'grid', gap: 12, marginTop: 16, minHeight: 0 }}>
                    <div style={{ display: 'grid', gap: 10, overflowY: 'auto', minHeight: 0 }}>
                      {Array.from({ length: 12 }, (_, i) => `공지 ${i + 1}`).map((label) => (
                        <button
                          key={label}
                          type="button"
                          style={{
                            textAlign: 'left',
                            border: '1px solid #e4e4e7',
                            borderRadius: 10,
                            padding: '12px 14px',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                      <Drawer.Close asChild>
                        <button type="button">닫기</button>
                      </Drawer.Close>
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Root>
            ))
          }
        >
          top Drawer 열기
        </button>
      </div>

      <h2>DropdownMenu — 방향 (side)</h2>
      <div className="section">
        {(['bottom', 'top', 'right', 'left'] as const).map((side) => (
          <DropdownMenu.Root key={side} side={side}>
            <DropdownMenu.Trigger>{side}</DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>항목 1</DropdownMenu.Item>
              <DropdownMenu.Item>항목 2</DropdownMenu.Item>
              <DropdownMenu.Item>항목 3</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ))}
      </div>
    </div>
  )
}

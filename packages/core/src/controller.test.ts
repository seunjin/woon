import { describe, expect, it, vi } from 'vitest'
import { createOverlayController } from './controller'

async function flushPromises() {
  for (let index = 0; index < 5; index++) {
    await Promise.resolve()
  }
}

describe('overlay confirm controller', () => {
  it('확인하면 true를 반환하고 닫힘 상태로 전환한다', async () => {
    const controller = createOverlayController()
    const result = controller.overlay.confirm({ title: '제목', confirmLabel: '확인' })

    controller.confirmCurrent()

    await expect(result).resolves.toBe(true)
    expect(controller.getSnapshot().status).toBe('closing')
    expect(controller.getSnapshot().open).toBe(false)
  })

  it('취소하면 false를 반환한다', async () => {
    const controller = createOverlayController()
    const result = controller.overlay.confirm({ title: '제목', confirmLabel: '확인' })

    controller.cancelCurrent()

    await expect(result).resolves.toBe(false)
  })

  it('요청을 순서대로 보여준다', async () => {
    const controller = createOverlayController()
    const first = controller.overlay.confirm({ title: '첫 번째', confirmLabel: '확인' })
    const second = controller.overlay.confirm({ title: '두 번째', confirmLabel: '확인' })

    expect(controller.getSnapshot().request?.title).toBe('첫 번째')
    controller.confirmCurrent()
    await expect(first).resolves.toBe(true)

    controller.completeClose()
    expect(controller.getSnapshot().request?.title).toBe('두 번째')
    controller.cancelCurrent()
    await expect(second).resolves.toBe(false)
  })

  it('같은 dedupeKey 요청은 동일한 Promise를 공유한다', async () => {
    const controller = createOverlayController()
    const first = controller.overlay.confirm({
      title: '첫 번째',
      confirmLabel: '확인',
      dedupeKey: 'delete-project',
    })
    const duplicate = controller.overlay.confirm({
      title: '중복',
      confirmLabel: '확인',
      dedupeKey: 'delete-project',
    })

    expect(duplicate).toBe(first)
    expect(controller.getSnapshot().request?.title).toBe('첫 번째')

    controller.confirmCurrent()
    await expect(duplicate).resolves.toBe(true)
  })

  it('비동기 onConfirm 동안 pending 상태가 되고 완료 후 닫힌다', async () => {
    const controller = createOverlayController()
    let complete!: () => void
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve
        }),
    )
    const result = controller.overlay.confirm({ title: '제목', confirmLabel: '확인', onConfirm })

    controller.confirmCurrent()
    await flushPromises()
    expect(controller.getSnapshot().status).toBe('pending')

    complete()
    await flushPromises()
    await expect(result).resolves.toBe(true)
    expect(controller.getSnapshot().status).toBe('closing')
  })

  it('비동기 실패 시 오류 상태를 제공하고 같은 작업을 재시도한다', async () => {
    const controller = createOverlayController()
    const error = new Error('서버 오류')
    const onConfirm = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce(undefined)
    const result = controller.overlay.confirm({ title: '제목', confirmLabel: '확인', onConfirm })

    controller.confirmCurrent()
    await flushPromises()
    expect(controller.getSnapshot()).toMatchObject({ status: 'error', error, open: true })

    controller.confirmCurrent()
    await flushPromises()
    await expect(result).resolves.toBe(true)
    expect(onConfirm).toHaveBeenCalledTimes(2)
  })

  it('pending 중에는 닫기와 취소를 차단한다', async () => {
    const controller = createOverlayController()
    const onConfirm = () => new Promise<void>(() => {})
    const result = controller.overlay.confirm({ title: '제목', confirmLabel: '확인', onConfirm })

    controller.confirmCurrent()
    await flushPromises()
    controller.requestClose()
    controller.cancelCurrent()

    expect(controller.getSnapshot().status).toBe('pending')
    expect(controller.getSnapshot().open).toBe(true)
    expect(await Promise.race([result, Promise.resolve('unsettled')])).toBe('unsettled')
  })

  it('dismiss block이면 외부 닫기 요청을 무시한다', () => {
    const controller = createOverlayController()
    controller.overlay.confirm({
      title: '제목',
      confirmLabel: '확인',
      dismiss: 'block',
    })

    controller.requestClose()

    expect(controller.getSnapshot().status).toBe('open')
  })
})

describe('overlay alert controller', () => {
  it('인지하면 Promise를 완료하고 닫힘 상태로 전환한다', async () => {
    const controller = createOverlayController()
    const result = controller.overlay.alert({ title: '저장이 완료되었습니다.' })

    expect(controller.getSnapshot()).toMatchObject({
      kind: 'alert',
      open: true,
      status: 'open',
    })

    controller.acknowledgeCurrent()

    await expect(result).resolves.toBeUndefined()
    expect(controller.getSnapshot()).toMatchObject({ open: false, status: 'closing' })
  })

  it('alert와 confirm 요청을 하나의 대기열에서 순서대로 보여준다', async () => {
    const controller = createOverlayController()
    const alertResult = controller.overlay.alert({ title: '먼저 안내' })
    const confirmResult = controller.overlay.confirm({ title: '다음 확인', confirmLabel: '계속' })

    expect(controller.getSnapshot()).toMatchObject({ kind: 'alert' })
    controller.acknowledgeCurrent()
    await expect(alertResult).resolves.toBeUndefined()

    controller.completeClose()
    expect(controller.getSnapshot()).toMatchObject({
      kind: 'confirm',
      request: { title: '다음 확인' },
    })

    controller.cancelCurrent()
    await expect(confirmResult).resolves.toBe(false)
  })

  it('같은 dedupeKey의 alert 요청은 동일한 Promise를 공유한다', async () => {
    const controller = createOverlayController()
    const first = controller.overlay.alert({ title: '첫 번째', dedupeKey: 'saved' })
    const duplicate = controller.overlay.alert({ title: '중복', dedupeKey: 'saved' })

    expect(duplicate).toBe(first)
    expect(controller.getSnapshot().request?.title).toBe('첫 번째')

    controller.requestClose()
    await expect(duplicate).resolves.toBeUndefined()
  })
})

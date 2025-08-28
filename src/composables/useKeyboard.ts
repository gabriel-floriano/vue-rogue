import { onMounted, onBeforeUnmount } from 'vue'

export type MoveHandler = (dx: number, dy: number) => void
export type VoidHandler = () => void

interface KeyboardOptions {
  onMove?: MoveHandler
  onRegenerate?: VoidHandler
}

export function useKeyboard(options: KeyboardOptions = {}) {
  const { onMove, onRegenerate } = options

  function handleKeyDown(e: KeyboardEvent) {
    const active = document.activeElement
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) {
      return
    }

    const key = e.key.toLowerCase()
    if (key === 'arrowup' || key === 'w') onMove?.(0, -1)
    else if (key === 'arrowdown' || key === 's') onMove?.(0, 1)
    else if (key === 'arrowleft' || key === 'a') onMove?.(-1, 0)
    else if (key === 'arrowright' || key === 'd') onMove?.(1, 0)
    else if (key === 'r') onRegenerate?.()
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}

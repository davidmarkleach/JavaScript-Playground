import * as React from 'react'

const TOAST_LIMIT = 3
const TOAST_DURATION = 4000

let count = 0
function nextId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return String(count)
}

let memoryState = { toasts: [] }
const listeners = new Set()

function setState(updater) {
  memoryState = updater(memoryState)
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return memoryState
}

/**
 * Marks a toast closed so Radix can play its exit animation, then drops it
 * from the store once the animation window has passed.
 */
function dismiss(toastId) {
  setState((state) => ({
    toasts: state.toasts.map((t) =>
      toastId === undefined || t.id === toastId ? { ...t, open: false } : t,
    ),
  }))

  window.setTimeout(() => {
    setState((state) => ({
      toasts: state.toasts.filter(
        (t) => !(toastId === undefined || t.id === toastId),
      ),
    }))
  }, 200)
}

function toast({ ...props }) {
  const id = nextId()

  setState((state) => ({
    toasts: [
      {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss(id)
        },
      },
      ...state.toasts,
    ].slice(0, TOAST_LIMIT),
  }))

  window.setTimeout(() => dismiss(id), props.duration ?? TOAST_DURATION)

  return { id, dismiss: () => dismiss(id) }
}

function useToast() {
  const state = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return {
    ...state,
    toast,
    dismiss,
  }
}

export { useToast, toast }

import { sanitizeCollection } from '@/lib/intentions'

export const STORAGE_KEY = 'if-then-intention-engine:v1'

/**
 * Reads persisted intentions. Storage access throws in private-mode and
 * sandboxed contexts, so every access is guarded and degrades to an empty
 * list rather than taking down the app.
 */
export function loadIntentions() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const { intentions } = sanitizeCollection(JSON.parse(raw))
    return intentions
  } catch {
    return []
  }
}

export function saveIntentions(intentions) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(intentions))
    return true
  } catch {
    return false
  }
}

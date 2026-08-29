/**
 * Domain rules for the IF-THEN Intention Engine.
 *
 * The engine encodes implementation-intentions psychology (Gollwitzer):
 * a goal is only actionable when it is bound to a concrete environmental
 * cue. Every record therefore carries BOTH an `trigger` (IF) and an
 * `action` (THEN). A record missing either half is not a weak intention —
 * it is not an intention at all, and is rejected at every entry point.
 */

export const ACTIVE_LIMIT = 7

export const STATUSES = ['active', 'completed', 'archived']

export const TRIGGER_TYPES = [
  {
    value: 'time',
    label: 'Time',
    hint: 'IF it is 7:00am on a weekday…',
  },
  {
    value: 'location',
    label: 'Location',
    hint: 'IF I sit down at my desk…',
  },
  {
    value: 'event',
    label: 'Event',
    hint: 'IF I finish my last meeting…',
  },
  {
    value: 'state',
    label: 'Inner state',
    hint: 'IF I notice I am procrastinating…',
  },
]

export const TRIGGER_TYPE_VALUES = TRIGGER_TYPES.map((t) => t.value)

const MAX_FIELD_LENGTH = 280

function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `itn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function cleanText(value) {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, ' ').slice(0, MAX_FIELD_LENGTH)
}

/** Builds a new intention, or throws if the IF/THEN contract is unmet. */
export function createIntention({ trigger, action, triggerType }) {
  const cleanTrigger = cleanText(trigger)
  const cleanAction = cleanText(action)

  if (!cleanTrigger) {
    throw new Error('An intention needs an IF — the cue that starts it.')
  }
  if (!cleanAction) {
    throw new Error('An intention needs a THEN — the step you will take.')
  }

  return {
    id: makeId(),
    trigger: cleanTrigger,
    action: cleanAction,
    triggerType: TRIGGER_TYPE_VALUES.includes(triggerType)
      ? triggerType
      : 'event',
    status: 'active',
    createdAt: new Date().toISOString(),
    completedAt: null,
  }
}

function validTimestamp(value, fallback) {
  if (typeof value !== 'string') return fallback
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? fallback : new Date(parsed).toISOString()
}

/**
 * Coerces an untrusted record (from localStorage or a pasted payload) into a
 * valid intention. Returns null when the record cannot be salvaged, so callers
 * can report exactly how many rows were skipped.
 */
export function normalizeIntention(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  // Accept the two shorthand key spellings a hand-written payload may use.
  const trigger = cleanText(raw.trigger ?? raw.if ?? raw.IF)
  const action = cleanText(raw.action ?? raw.then ?? raw.THEN)

  if (!trigger || !action) return null

  const createdAt = validTimestamp(raw.createdAt, new Date().toISOString())
  const status = STATUSES.includes(raw.status) ? raw.status : 'active'

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    trigger,
    action,
    triggerType: TRIGGER_TYPE_VALUES.includes(raw.triggerType)
      ? raw.triggerType
      : 'event',
    status,
    createdAt,
    completedAt:
      status === 'completed'
        ? validTimestamp(raw.completedAt, createdAt)
        : null,
  }
}

/** Drops entries sharing an id, keeping the first occurrence. */
export function dedupeById(intentions) {
  const seen = new Set()
  return intentions.filter((intention) => {
    if (seen.has(intention.id)) return false
    seen.add(intention.id)
    return true
  })
}

export function sanitizeCollection(value) {
  if (!Array.isArray(value)) return { intentions: [], skipped: 0 }

  const intentions = []
  let skipped = 0

  for (const raw of value) {
    const normalized = normalizeIntention(raw)
    if (normalized) intentions.push(normalized)
    else skipped += 1
  }

  return { intentions: dedupeById(intentions), skipped }
}

/**
 * Parses a pasted payload. Accepts either a bare JSON array or the wrapped
 * export envelope `{ version, intentions: [...] }`.
 */
export function parseImportPayload(text) {
  const trimmed = typeof text === 'string' ? text.trim() : ''
  if (!trimmed) {
    throw new Error('Paste a JSON payload first.')
  }

  let parsed
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error('That is not valid JSON. Check for a stray comma or quote.')
  }

  const candidate = Array.isArray(parsed) ? parsed : parsed?.intentions

  if (!Array.isArray(candidate)) {
    throw new Error(
      'Expected a JSON array, or an object with an "intentions" array.',
    )
  }

  const { intentions, skipped } = sanitizeCollection(candidate)

  if (!intentions.length) {
    throw new Error(
      'No usable intentions found — every entry needs both an IF and a THEN.',
    )
  }

  return { intentions, skipped }
}

export const EXPORT_VERSION = 1

export function serializeIntentions(intentions) {
  return JSON.stringify(
    {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      intentions,
    },
    null,
    2,
  )
}

export function countByStatus(intentions, status) {
  return intentions.reduce(
    (total, intention) => (intention.status === status ? total + 1 : total),
    0,
  )
}

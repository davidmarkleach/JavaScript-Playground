"use client"

import * as React from "react"
import {
  ArrowRightLeftIcon,
  BrainIcon,
  CheckIcon,
  Clock3Icon,
  CopyIcon,
  CornerDownRightIcon,
  DownloadIcon,
  EraserIcon,
  FootprintsIcon,
  ListChecksIcon,
  LockIcon,
  PlusIcon,
  ShieldAlertIcon,
  TargetIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UnlockIcon,
  UploadIcon,
  ZapIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

/* -------------------------------------------------------------------------- */
/*                                   Model                                    */
/* -------------------------------------------------------------------------- */

type CueType = "event" | "time" | "contingency"

type Intention = {
  id: string
  cueType: CueType
  trigger: string
  action: string
  done: boolean
  createdAt: number
  completedAt: number | null
}

type ListFilter = "all" | "armed" | "fired"

const STORAGE_KEY = "intention-engine:loops:v1"
const PAYLOAD_KIND = "intention-engine/loops"
const PAYLOAD_VERSION = 1

/**
 * The trigger has to be concrete enough to actually fire. Anything shorter than
 * this reads as a vague wish, so the THEN half of the loop stays locked.
 */
const MIN_TRIGGER_LENGTH = 4

/**
 * Destructive actions need a wider window than the default toast so the undo is
 * actually reachable.
 */
const UNDO_TOAST_DURATION = 12_000

const CUE_ORDER: readonly CueType[] = ["event", "time", "contingency"]

const CUE_CONFIG: Record<
  CueType,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    connector: string
    triggerLabel: string
    triggerPlaceholder: string
    actionPlaceholder: string
    coaching: string
  }
> = {
  event: {
    label: "Event",
    icon: FootprintsIcon,
    connector: "When",
    triggerLabel: "Which existing moment carries it?",
    triggerPlaceholder: "I pour my morning coffee",
    actionPlaceholder: "I write tomorrow's three priorities on the notepad",
    coaching: "Bolt the loop onto something that already happens without effort.",
  },
  time: {
    label: "Time",
    icon: Clock3Icon,
    connector: "At",
    triggerLabel: "Which clock time and place?",
    triggerPlaceholder: "7:15am, at the kitchen table",
    actionPlaceholder: "I read one chapter before opening my inbox",
    coaching: "Name the hour and the room. Ambiguity is what kills follow-through.",
  },
  contingency: {
    label: "Backup",
    icon: ShieldAlertIcon,
    connector: "If I miss",
    triggerLabel: "Which failure are you planning around?",
    triggerPlaceholder: "the 7:15am window and it is already past noon",
    actionPlaceholder: "I do the 10-minute version during my lunch break",
    coaching: "Decide the recovery route now, while you are still calm.",
  },
}

/* -------------------------------------------------------------------------- */
/*                          Serialisation / validation                        */
/* -------------------------------------------------------------------------- */

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `loop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function isCueType(value: unknown): value is CueType {
  return typeof value === "string" && value in CUE_CONFIG
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Accepts loosely shaped records from localStorage or a pasted payload and
 * returns a fully formed intention, or `null` when the record is unusable.
 */
function normalizeIntention(raw: unknown): Intention | null {
  if (!isRecord(raw)) return null

  const trigger = typeof raw.trigger === "string" ? raw.trigger.trim() : ""
  const action = typeof raw.action === "string" ? raw.action.trim() : ""
  if (!trigger || !action) return null

  const createdAt =
    typeof raw.createdAt === "number" && Number.isFinite(raw.createdAt)
      ? raw.createdAt
      : Date.now()
  const done = raw.done === true
  const completedAt =
    done && typeof raw.completedAt === "number" && Number.isFinite(raw.completedAt)
      ? raw.completedAt
      : done
        ? createdAt
        : null

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId(),
    cueType: isCueType(raw.cueType) ? raw.cueType : "event",
    trigger,
    action,
    done,
    createdAt,
    completedAt,
  }
}

function readIntentionArray(source: unknown): unknown[] | null {
  if (Array.isArray(source)) return source
  if (isRecord(source) && Array.isArray(source.intentions)) return source.intentions
  return null
}

/** Throws an `Error` whose message is safe to surface directly in a toast. */
function parsePayload(text: string): Intention[] {
  const trimmed = text.trim()
  if (!trimmed) throw new Error("Paste a payload first.")

  let decoded: unknown
  try {
    decoded = JSON.parse(trimmed)
  } catch {
    throw new Error("That is not valid JSON.")
  }

  const rows = readIntentionArray(decoded)
  if (!rows) {
    throw new Error("Expected an array of loops, or an object with an `intentions` array.")
  }

  const parsed = rows.map(normalizeIntention).filter((row): row is Intention => row !== null)
  if (parsed.length === 0) {
    throw new Error("No loop in that payload had both a trigger and a target step.")
  }

  return parsed
}

function serializePayload(intentions: Intention[]): string {
  return JSON.stringify(
    {
      kind: PAYLOAD_KIND,
      version: PAYLOAD_VERSION,
      exportedAt: new Date().toISOString(),
      intentions,
    },
    null,
    2,
  )
}

/* -------------------------------------------------------------------------- */
/*                          localStorage-backed store                         */
/* -------------------------------------------------------------------------- */

type LoopState = {
  /** `loading` until the browser cache has been read at least once. */
  status: "loading" | "ready"
  intentions: Intention[]
}

const LOADING_STATE: LoopState = { status: "loading", intentions: [] }

/**
 * `localStorage` is an external system, so the loops live in a small store that
 * React reads through `useSyncExternalStore`. That keeps the server-rendered
 * markup deterministic, survives refreshes, and syncs across open tabs.
 */
function createLoopStore() {
  let state: LoopState = LOADING_STATE
  const listeners = new Set<() => void>()

  function emit() {
    for (const listener of listeners) listener()
  }

  function readCache(): Intention[] {
    try {
      const cached = window.localStorage.getItem(STORAGE_KEY)
      if (!cached) return []
      const rows = readIntentionArray(JSON.parse(cached)) ?? []
      return rows.map(normalizeIntention).filter((row): row is Intention => row !== null)
    } catch {
      // A corrupt or unreadable cache must never stop the app from booting.
      return []
    }
  }

  function writeCache(intentions: Intention[]) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ intentions }))
    } catch {
      // Storage can be unavailable (private mode, quota). Stay in memory.
    }
  }

  function handleStorage(event: StorageEvent) {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    state = { status: "ready", intentions: readCache() }
    emit()
  }

  return {
    subscribe(listener: () => void) {
      if (state.status === "loading") {
        state = { status: "ready", intentions: readCache() }
      }
      if (listeners.size === 0) {
        window.addEventListener("storage", handleStorage)
      }
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          window.removeEventListener("storage", handleStorage)
        }
      }
    },
    getSnapshot(): LoopState {
      return state
    },
    getServerSnapshot(): LoopState {
      return LOADING_STATE
    },
    update(recipe: (current: Intention[]) => Intention[]) {
      const intentions = recipe(state.intentions)
      state = { status: "ready", intentions }
      writeCache(intentions)
      emit()
    },
  }
}

const loopStore = createLoopStore()

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Falls through to the legacy path below.
  }

  try {
    const scratch = document.createElement("textarea")
    scratch.value = text
    scratch.setAttribute("readonly", "")
    scratch.style.position = "fixed"
    scratch.style.opacity = "0"
    document.body.appendChild(scratch)
    scratch.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(scratch)
    return ok
  } catch {
    return false
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Engine                                    */
/* -------------------------------------------------------------------------- */

export function IfThenPlanner() {
  const { status, intentions } = React.useSyncExternalStore(
    loopStore.subscribe,
    loopStore.getSnapshot,
    loopStore.getServerSnapshot,
  )
  const hydrated = status === "ready"

  const [cueType, setCueType] = React.useState<CueType>("event")
  const [trigger, setTrigger] = React.useState("")
  const [action, setAction] = React.useState("")

  const [filter, setFilter] = React.useState<ListFilter>("all")
  const [transferOpen, setTransferOpen] = React.useState(false)
  const [importDraft, setImportDraft] = React.useState("")

  const actionRef = React.useRef<HTMLTextAreaElement>(null)

  const cue = CUE_CONFIG[cueType]
  const triggerReady = trigger.trim().length >= MIN_TRIGGER_LENGTH
  const actionReady = action.trim().length > 0
  const canCommit = triggerReady && actionReady

  const armedCount = intentions.filter((item) => !item.done).length
  const firedCount = intentions.length - armedCount
  const completion = intentions.length === 0 ? 0 : Math.round((firedCount / intentions.length) * 100)

  // Armed loops float to the top, newest first within each half.
  const ordered = React.useMemo(
    () =>
      [...intentions].sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1
        return b.createdAt - a.createdAt
      }),
    [intentions],
  )

  // Each panel filters for itself, because the tabs keep previously activated
  // panels mounted.
  function loopsFor(key: ListFilter) {
    if (key === "armed") return ordered.filter((item) => !item.done)
    if (key === "fired") return ordered.filter((item) => item.done)
    return ordered
  }

  function commitIntention() {
    if (!canCommit) {
      toast.error("The loop is still incomplete.", {
        description: triggerReady
          ? "Add the target step that the cue should launch."
          : "Name the environmental cue before anything else.",
      })
      return
    }

    const created: Intention = {
      id: createId(),
      cueType,
      trigger: trigger.trim(),
      action: action.trim(),
      done: false,
      createdAt: Date.now(),
      completedAt: null,
    }

    loopStore.update((current) => [created, ...current])
    setTrigger("")
    setAction("")
    toast.success("Loop armed.", {
      description: `${cue.connector} ${created.trigger} → ${created.action}`,
    })
  }

  function toggleIntention(id: string) {
    const target = intentions.find((item) => item.id === id)
    if (!target) return

    const nextDone = !target.done
    loopStore.update((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, done: nextDone, completedAt: nextDone ? Date.now() : null }
          : item,
      ),
    )

    const undo = () =>
      loopStore.update((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, done: target.done, completedAt: target.completedAt }
            : item,
        ),
      )

    if (nextDone) {
      toast.success("Loop fired.", {
        description: target.action,
        action: { label: "Undo", onClick: undo },
      })
    } else {
      toast("Loop re-armed.", {
        description: target.action,
        action: { label: "Undo", onClick: undo },
      })
    }
  }

  function deleteIntention(id: string) {
    const target = intentions.find((item) => item.id === id)
    if (!target) return

    loopStore.update((current) => current.filter((item) => item.id !== id))
    toast("Loop removed.", {
      description: target.action,
      duration: UNDO_TOAST_DURATION,
      action: {
        label: "Undo",
        onClick: () =>
          loopStore.update((current) =>
            current.some((item) => item.id === target.id) ? current : [target, ...current],
          ),
      },
    })
  }

  function clearFired() {
    const removed = intentions.filter((item) => item.done)
    if (removed.length === 0) {
      toast("Nothing to clear yet.")
      return
    }

    const snapshot = intentions
    loopStore.update((current) => current.filter((item) => !item.done))
    toast(`Cleared ${removed.length} fired ${removed.length === 1 ? "loop" : "loops"}.`, {
      duration: UNDO_TOAST_DURATION,
      action: { label: "Undo", onClick: () => loopStore.update(() => snapshot) },
    })
  }

  async function handleCopyExport() {
    const ok = await copyToClipboard(serializePayload(intentions))
    if (ok) {
      toast.success("Payload copied to your clipboard.")
    } else {
      toast.error("Copying was blocked.", {
        description: "Select the payload text and copy it manually.",
      })
    }
  }

  function handleImport(mode: "replace" | "merge") {
    let incoming: Intention[]
    try {
      incoming = parsePayload(importDraft)
    } catch (error) {
      toast.error("Import failed.", {
        description: error instanceof Error ? error.message : "Unknown payload error.",
      })
      return
    }

    const snapshot = intentions

    if (mode === "replace") {
      loopStore.update(() => incoming)
    } else {
      const seen = new Set(intentions.map((item) => item.id))
      const additions = incoming.filter((item) => !seen.has(item.id))
      if (additions.length === 0) {
        toast("Every loop in that payload is already here.")
        return
      }
      loopStore.update((current) => [...additions, ...current])
    }

    setImportDraft("")
    setTransferOpen(false)
    toast.success(
      mode === "replace"
        ? `Replaced your board with ${incoming.length} ${incoming.length === 1 ? "loop" : "loops"}.`
        : `Merged ${incoming.length} ${incoming.length === 1 ? "loop" : "loops"}.`,
      {
        duration: UNDO_TOAST_DURATION,
        action: { label: "Undo", onClick: () => loopStore.update(() => snapshot) },
      },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pt-6 pb-16">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BrainIcon className="size-5" />
            </span>
            <div>
              <h1 className="font-heading text-lg leading-tight font-semibold tracking-tight text-foreground">
                Intention Engine
              </h1>
              <p className="text-xs text-muted-foreground">
                If-Then planning, enforced.
              </p>
            </div>
          </div>

          <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="h-9 shrink-0"
                  aria-label="Import or export loops"
                />
              }
            >
              <ArrowRightLeftIcon />
              <span className="sr-only sm:not-sr-only">Transfer</span>
            </DialogTrigger>

            <TransferDialog
              intentions={intentions}
              importDraft={importDraft}
              onImportDraftChange={setImportDraft}
              onCopyExport={handleCopyExport}
              onImport={handleImport}
            />
          </Dialog>
        </div>

        <ProgressStrip
          armed={armedCount}
          fired={firedCount}
          completion={completion}
          hydrated={hydrated}
        />
      </header>

      {/* ------------------------------ Composer ------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="size-4 text-muted-foreground" />
            Build a loop
          </CardTitle>
          <CardDescription>
            The target step unlocks only once a real-world cue is in place.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Cue configuration
            </Label>
            <Tabs
              value={cueType}
              onValueChange={(value) => setCueType(value as CueType)}
            >
              <TabsList className="h-10 w-full">
                {CUE_ORDER.map((key) => {
                  const option = CUE_CONFIG[key]
                  const OptionIcon = option.icon
                  return (
                    <TabsTrigger key={key} value={key} className="gap-1.5">
                      <OptionIcon className="size-4" />
                      {option.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">{cue.coaching}</p>
          </div>

          <Separator />

          {/* IF ---------------------------------------------------------------- */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor="intention-trigger"
                className="font-heading text-sm font-semibold"
              >
                <Badge variant="secondary" className="font-mono">
                  IF
                </Badge>
                Trigger context
              </Label>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs",
                  triggerReady ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {triggerReady ? (
                  <UnlockIcon className="size-3.5" />
                ) : (
                  <LockIcon className="size-3.5" />
                )}
                {triggerReady ? "Cue set" : `${MIN_TRIGGER_LENGTH} chars min`}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/40 px-2.5 py-2">
              <span
                data-slot="cue-connector"
                className="shrink-0 text-sm font-medium text-muted-foreground"
              >
                {cue.connector}
              </span>
              <Input
                id="intention-trigger"
                value={trigger}
                onChange={(event) => setTrigger(event.target.value)}
                placeholder={cue.triggerPlaceholder}
                autoComplete="off"
                enterKeyHint="next"
                className="h-9 border-0 bg-transparent px-0 focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    if (triggerReady) actionRef.current?.focus()
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{cue.triggerLabel}</p>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <CornerDownRightIcon className="size-4" />
            <Separator className="flex-1" />
          </div>

          {/* THEN -------------------------------------------------------------- */}
          <div
            className={cn(
              "flex flex-col gap-2 transition-opacity",
              !triggerReady && "opacity-60",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor="intention-action"
                className="font-heading text-sm font-semibold"
              >
                <Badge
                  variant={triggerReady ? "default" : "outline"}
                  className="font-mono"
                >
                  THEN
                </Badge>
                Target step
              </Label>
              {!triggerReady && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <LockIcon className="size-3.5" />
                  Locked
                </span>
              )}
            </div>

            <Textarea
              id="intention-action"
              ref={actionRef}
              value={action}
              onChange={(event) => setAction(event.target.value)}
              disabled={!triggerReady}
              rows={2}
              placeholder={
                triggerReady
                  ? cue.actionPlaceholder
                  : "Locked until a trigger context exists."
              }
              aria-describedby="intention-action-hint"
              className="min-h-20 resize-none"
            />
            <p id="intention-action-hint" className="text-xs text-muted-foreground">
              {triggerReady
                ? "One concrete action. If it needs a decision later, it is not specific enough."
                : "This field stays locked so intentions cannot pile up without a cue."}
            </p>
          </div>

          <Button
            onClick={commitIntention}
            disabled={!canCommit}
            className="h-11 w-full"
          >
            <PlusIcon />
            Arm this loop
          </Button>
        </CardContent>
      </Card>

      {/* -------------------------------- Board ------------------------------- */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
            <ListChecksIcon className="size-4 text-muted-foreground" />
            Active loops
          </h2>
          {firedCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFired}>
              <EraserIcon />
              Clear fired
            </Button>
          )}
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as ListFilter)}>
          <TabsList className="h-10 w-full">
            <TabsTrigger value="all">All {intentions.length}</TabsTrigger>
            <TabsTrigger value="armed">Armed {armedCount}</TabsTrigger>
            <TabsTrigger value="fired">Fired {firedCount}</TabsTrigger>
          </TabsList>

          {(["all", "armed", "fired"] as const).map((key) => {
            const loops = loopsFor(key)
            return (
              <TabsContent key={key} value={key} className="mt-3 flex flex-col gap-2">
                {!hydrated ? (
                  <BoardSkeleton />
                ) : loops.length === 0 ? (
                  <EmptyBoard filter={key} />
                ) : (
                  loops.map((item) => (
                    <IntentionRow
                      key={item.id}
                      intention={item}
                      onToggle={toggleIntention}
                      onDelete={deleteIntention}
                    />
                  ))
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </section>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Pieces                                   */
/* -------------------------------------------------------------------------- */

function ProgressStrip({
  armed,
  fired,
  completion,
  hydrated,
}: {
  armed: number
  fired: number
  completion: number
  hydrated: boolean
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-muted/50 px-3 py-2.5 ring-1 ring-foreground/5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">
          {hydrated ? `${fired} of ${armed + fired} fired` : "Restoring your loops…"}
        </span>
        <span className="text-muted-foreground">{hydrated ? `${completion}%` : "—"}</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={completion}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Loops fired"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${hydrated ? completion : 0}%` }}
        />
      </div>
    </div>
  )
}

function IntentionRow({
  intention,
  onToggle,
  onDelete,
}: {
  intention: Intention
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const cue = CUE_CONFIG[intention.cueType]
  const CueIcon = cue.icon
  const checkboxId = `loop-${intention.id}`

  return (
    <Card
      size="sm"
      className={cn(
        "transition-colors",
        intention.done && "bg-muted/40 ring-foreground/5",
      )}
    >
      <CardContent className="flex items-start gap-3">
        {/* Base UI derives the accessible name from the `for`-matched label, so the
            screen reader announces the loop itself rather than a generic string. */}
        <Checkbox
          id={checkboxId}
          checked={intention.done}
          onCheckedChange={() => onToggle(intention.id)}
          className="mt-1 size-5"
        />

        <label htmlFor={checkboxId} className="min-w-0 flex-1 cursor-pointer">
          <span className="mb-1.5 flex items-center gap-1.5">
            <Badge variant="outline" className="gap-1">
              <CueIcon className="size-3" />
              {cue.label}
            </Badge>
            {intention.done && (
              <Badge variant="secondary" className="gap-1">
                <CheckIcon className="size-3" />
                Fired
              </Badge>
            )}
          </span>

          <span
            data-slot="loop-trigger"
            className={cn(
              "block text-xs break-words text-muted-foreground",
              intention.done && "line-through",
            )}
          >
            {/* The connector already reads as the condition, so prefixing a literal
                "IF" would stutter on the contingency cue. */}
            {cue.connector} {intention.trigger}
          </span>
          <span
            data-slot="loop-action"
            className={cn(
              "mt-0.5 flex items-start gap-1.5 text-sm break-words text-foreground",
              intention.done && "text-muted-foreground line-through decoration-2",
            )}
          >
            <TargetIcon className="mt-0.5 size-3.5 shrink-0 opacity-60" />
            <span>{intention.action}</span>
          </span>
        </label>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(intention.id)}
          aria-label="Delete this loop"
          className="-mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2Icon />
        </Button>
      </CardContent>
    </Card>
  )
}

function BoardSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {[0, 1].map((row) => (
        <div key={row} className="h-20 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}

function EmptyBoard({ filter }: { filter: ListFilter }) {
  const copy: Record<ListFilter, { title: string; body: string }> = {
    all: {
      title: "No loops yet",
      body: "Set a trigger context above to unlock your first target step.",
    },
    armed: {
      title: "Nothing armed",
      body: "Every loop has fired. Build the next one while the momentum lasts.",
    },
    fired: {
      title: "Nothing fired yet",
      body: "Tick a loop off once its cue has actually shown up.",
    },
  }
  const { title, body } = copy[filter]

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-input px-6 py-10 text-center">
      <TargetIcon className="size-5 text-muted-foreground" />
      <p className="font-heading text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{body}</p>
    </div>
  )
}

function TransferDialog({
  intentions,
  importDraft,
  onImportDraftChange,
  onCopyExport,
  onImport,
}: {
  intentions: Intention[]
  importDraft: string
  onImportDraftChange: (value: string) => void
  onCopyExport: () => void
  onImport: (mode: "replace" | "merge") => void
}) {
  // Recomputed on every open so `exportedAt` reflects the actual export moment.
  const payload = React.useMemo(() => serializePayload(intentions), [intentions])

  return (
    <DialogContent className="max-h-[90svh] gap-3 overflow-y-auto sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ArrowRightLeftIcon className="size-4" />
          Transfer payload
        </DialogTitle>
        <DialogDescription>
          Move your loops between devices as a plain JSON string.
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="export">
        <TabsList className="h-10 w-full">
          <TabsTrigger value="export" className="gap-1.5">
            <DownloadIcon className="size-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-1.5">
            <UploadIcon className="size-4" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="mt-3 flex flex-col gap-3">
          <Label htmlFor="transfer-export" className="text-xs text-muted-foreground">
            Your board as a payload
          </Label>
          <Textarea
            id="transfer-export"
            name="transfer-export"
            readOnly
            value={payload}
            onFocus={(event) => event.currentTarget.select()}
            className="h-48 resize-none overflow-y-auto font-mono text-xs"
          />
          <Button onClick={onCopyExport} className="h-11 w-full">
            <CopyIcon />
            Copy {intentions.length} {intentions.length === 1 ? "loop" : "loops"}
          </Button>
        </TabsContent>

        <TabsContent value="import" className="mt-3 flex flex-col gap-3">
          <Label htmlFor="transfer-import" className="text-xs text-muted-foreground">
            Paste a payload from another device
          </Label>
          <Textarea
            id="transfer-import"
            name="transfer-import"
            value={importDraft}
            onChange={(event) => onImportDraftChange(event.target.value)}
            placeholder='{ "intentions": [ { "cueType": "time", "trigger": "7:15am", "action": "Read one chapter" } ] }'
            className="h-48 resize-none overflow-y-auto font-mono text-xs"
          />
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
            Replacing overwrites every loop on this device. Merging keeps both sets and
            skips duplicates.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => onImport("merge")}
              className="h-11 flex-1"
            >
              <PlusIcon />
              Merge
            </Button>
            <Button
              variant="destructive"
              onClick={() => onImport("replace")}
              className="h-11 flex-1"
            >
              <UploadIcon />
              Replace all
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  )
}

export default IfThenPlanner

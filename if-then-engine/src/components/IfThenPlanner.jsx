import * as React from 'react'
import {
  Archive,
  ArrowRight,
  CalendarClock,
  Check,
  CircleAlert,
  Clock,
  Download,
  Brain,
  Lock,
  MapPin,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { loadIntentions, saveIntentions } from '@/lib/storage'
import {
  ACTIVE_LIMIT,
  TRIGGER_TYPES,
  countByStatus,
  createIntention,
  dedupeById,
  parseImportPayload,
  serializeIntentions,
} from '@/lib/intentions'

const TRIGGER_ICONS = {
  time: Clock,
  location: MapPin,
  event: Zap,
  state: Brain,
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

function TriggerTypePicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TRIGGER_TYPES.map((type) => {
        const Icon = TRIGGER_ICONS[type.value]
        const selected = value === type.value
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            aria-pressed={selected}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              selected
                ? 'border-trigger bg-trigger text-trigger-foreground'
                : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {type.label}
          </button>
        )
      })}
    </div>
  )
}

function IntentionRow({ intention, onComplete, onArchive, onRestore, onDelete }) {
  const Icon = TRIGGER_ICONS[intention.triggerType] ?? Zap
  const isCompleted = intention.status === 'completed'
  const isArchived = intention.status === 'archived'

  return (
    <li
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card transition-colors',
        (isCompleted || isArchived) && 'opacity-70',
      )}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md bg-trigger/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-trigger">
              <Icon className="h-3 w-3" />
              If
            </span>
            <p
              className={cn(
                'min-w-0 break-words text-sm font-semibold text-foreground',
                isCompleted && 'line-through',
              )}
            >
              {intention.trigger}
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary">
              <ArrowRight className="h-3 w-3" />
              Then
            </span>
            <p
              className={cn(
                'min-w-0 break-words text-sm text-muted-foreground',
                isCompleted && 'line-through',
              )}
            >
              {intention.action}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:flex-col sm:items-end lg:flex-row lg:items-center">
          <span className="mr-auto inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground sm:mr-0">
            <CalendarClock className="h-3 w-3" />
            {formatDate(intention.createdAt)}
          </span>

          <div className="flex items-center gap-1">
            {intention.status === 'active' ? (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onComplete(intention.id)}
                  aria-label={`Mark done: ${intention.action}`}
                >
                  <Check className="h-4 w-4" />
                  Done
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => onArchive(intention.id)}
                  aria-label={`Archive: ${intention.action}`}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRestore(intention.id)}
                aria-label={`Reactivate: ${intention.action}`}
              >
                <RotateCcw className="h-4 w-4" />
                Reactivate
              </Button>
            )}

            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(intention.id)}
              aria-label={`Delete: ${intention.action}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </li>
  )
}

function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-14 text-center">
      <Icon className="mb-3 h-8 w-8 text-muted-foreground/60" />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

export default function IfThenPlanner() {
  // Hydrate once, lazily: reading during the initial render avoids both a
  // blank first paint and the classic effect-order bug where an empty array
  // is flushed back over good stored data.
  const [intentions, setIntentions] = React.useState(loadIntentions)
  const [trigger, setTrigger] = React.useState('')
  const [action, setAction] = React.useState('')
  const [triggerType, setTriggerType] = React.useState('event')
  const [payload, setPayload] = React.useState('')
  const [portalOpen, setPortalOpen] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    saveIntentions(intentions)
  }, [intentions])

  const activeCount = React.useMemo(
    () => countByStatus(intentions, 'active'),
    [intentions],
  )
  const completedCount = React.useMemo(
    () => countByStatus(intentions, 'completed'),
    [intentions],
  )
  const archivedCount = React.useMemo(
    () => countByStatus(intentions, 'archived'),
    [intentions],
  )

  const atCapacity = activeCount >= ACTIVE_LIMIT
  const remaining = Math.max(ACTIVE_LIMIT - activeCount, 0)

  const byStatus = React.useCallback(
    (status) => intentions.filter((item) => item.status === status),
    [intentions],
  )

  function handleSubmit(event) {
    event.preventDefault()

    if (atCapacity) {
      toast({
        variant: 'destructive',
        title: 'Commitment slots are full',
        description: `Finish or archive one of your ${ACTIVE_LIMIT} active intentions before adding another.`,
      })
      return
    }

    let intention
    try {
      intention = createIntention({ trigger, action, triggerType })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Incomplete intention',
        description: error.message,
      })
      return
    }

    setIntentions((current) => [intention, ...current])
    setTrigger('')
    setAction('')
    toast({
      title: 'Intention anchored',
      description: 'Your cue is set. The behaviour now has a home.',
    })
  }

  function updateStatus(id, status) {
    setIntentions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              completedAt:
                status === 'completed' ? new Date().toISOString() : null,
            }
          : item,
      ),
    )
  }

  function handleDelete(id) {
    setIntentions((current) => current.filter((item) => item.id !== id))
  }

  async function handleExport() {
    const json = serializeIntentions(intentions)
    setPayload(json)

    try {
      await navigator.clipboard.writeText(json)
      toast({
        title: 'Copied to clipboard',
        description: `${intentions.length} intention${intentions.length === 1 ? '' : 's'} exported as JSON.`,
      })
    } catch {
      // Clipboard is blocked without a secure context or user gesture; the
      // payload is already in the textarea, so this is a soft failure.
      toast({
        title: 'Export ready',
        description: 'Clipboard was blocked — copy the payload below manually.',
      })
    }
  }

  function handleImport(mode) {
    let result
    try {
      result = parseImportPayload(payload)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: error.message,
      })
      return
    }

    const { intentions: incoming, skipped } = result

    setIntentions((current) =>
      mode === 'replace' ? incoming : dedupeById([...incoming, ...current]),
    )
    setPayload('')
    setPortalOpen(false)

    toast({
      title: mode === 'replace' ? 'Library replaced' : 'Intentions merged',
      description:
        `${incoming.length} imported` +
        (skipped ? ` · ${skipped} skipped (missing IF or THEN)` : ''),
    })
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-2">
        <CardHeader className="bg-muted/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5 text-primary" />
                Forge an intention
              </CardTitle>
              <CardDescription>
                A task without a cue is a wish. Bind every step to something
                your environment will actually do.
              </CardDescription>
            </div>

            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold',
                atCapacity
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary',
              )}
            >
              {atCapacity ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {activeCount} / {ACTIVE_LIMIT} slots used
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="trigger-input"
                  className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-trigger"
                >
                  <span className="grid h-5 w-5 place-items-center rounded bg-trigger text-[10px] text-trigger-foreground">
                    1
                  </span>
                  If — trigger context
                </Label>
                <Input
                  id="trigger-input"
                  value={trigger}
                  onChange={(event) => setTrigger(event.target.value)}
                  placeholder="I pour my first coffee"
                  disabled={atCapacity}
                  maxLength={280}
                />
                <TriggerTypePicker
                  value={triggerType}
                  onChange={setTriggerType}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="action-input"
                  className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary"
                >
                  <span className="grid h-5 w-5 place-items-center rounded bg-primary text-[10px] text-primary-foreground">
                    2
                  </span>
                  Then — actionable step
                </Label>
                <Input
                  id="action-input"
                  value={action}
                  onChange={(event) => setAction(event.target.value)}
                  placeholder="I write one paragraph of the proposal"
                  disabled={atCapacity}
                  maxLength={280}
                />
                <p className="text-xs text-muted-foreground">
                  {
                    TRIGGER_TYPES.find((type) => type.value === triggerType)
                      ?.hint
                  }
                </p>
              </div>
            </div>

            {atCapacity ? (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  You are holding {ACTIVE_LIMIT} live commitments — the point
                  at which follow-through collapses. Complete or archive one to
                  free a slot.
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={atCapacity} size="lg">
                <Plus className="h-4 w-4" />
                Anchor intention
              </Button>
              <p className="text-xs text-muted-foreground">
                {remaining} slot{remaining === 1 ? '' : 's'} left
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs defaultValue="active" className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="active">
                Active
                <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold">
                  {activeCount}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Done
                <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold">
                  {completedCount}
                </span>
              </TabsTrigger>
              <TabsTrigger value="archived">
                Archived
                <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold">
                  {archivedCount}
                </span>
              </TabsTrigger>
            </TabsList>

            <Dialog open={portalOpen} onOpenChange={setPortalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4" />
                  Data portal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Export / import intentions</DialogTitle>
                  <DialogDescription>
                    Move your library between devices as a plain JSON array.
                    Entries missing an IF or a THEN are rejected on import.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleExport}
                    className="w-full"
                  >
                    <Download className="h-4 w-4" />
                    Generate payload &amp; copy ({intentions.length})
                  </Button>

                  <Textarea
                    value={payload}
                    onChange={(event) => setPayload(event.target.value)}
                    placeholder='[{ "trigger": "I close my laptop", "action": "I pack my gym bag" }]'
                    className="min-h-[220px] font-mono text-xs"
                    spellCheck={false}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleImport('merge')}
                  >
                    Merge into library
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleImport('replace')}
                  >
                    Replace library
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="active">
            {activeCount ? (
              <ul className="space-y-3">
                {byStatus('active').map((intention) => (
                  <IntentionRow
                    key={intention.id}
                    intention={intention}
                    onComplete={(id) => updateStatus(id, 'completed')}
                    onArchive={(id) => updateStatus(id, 'archived')}
                    onRestore={(id) => updateStatus(id, 'active')}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Target}
                title="No live intentions"
                body="Add your first IF-THEN pair above. Start with a cue that already happens every day."
              />
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedCount ? (
              <ul className="space-y-3">
                {byStatus('completed').map((intention) => (
                  <IntentionRow
                    key={intention.id}
                    intention={intention}
                    onComplete={(id) => updateStatus(id, 'completed')}
                    onArchive={(id) => updateStatus(id, 'archived')}
                    onRestore={(id) => updateStatus(id, 'active')}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Check}
                title="Nothing completed yet"
                body="Finished intentions land here so you can see which cues actually fire."
              />
            )}
          </TabsContent>

          <TabsContent value="archived">
            {archivedCount ? (
              <ul className="space-y-3">
                {byStatus('archived').map((intention) => (
                  <IntentionRow
                    key={intention.id}
                    intention={intention}
                    onComplete={(id) => updateStatus(id, 'completed')}
                    onArchive={(id) => updateStatus(id, 'archived')}
                    onRestore={(id) => updateStatus(id, 'active')}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Archive}
                title="Archive is empty"
                body="Archiving frees a commitment slot without pretending the work got done."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

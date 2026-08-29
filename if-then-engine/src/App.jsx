import * as React from 'react'
import { BrainCircuit, Github, Moon, Sun } from 'lucide-react'

import IfThenPlanner from '@/components/IfThenPlanner'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'

const THEME_KEY = 'if-then-intention-engine:theme'

function readInitialTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  } catch {
    return 'light'
  }
}

export default function App() {
  const [theme, setTheme] = React.useState(readInitialTheme)

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      // A blocked storage write must not break theming.
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="container flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-extrabold leading-tight tracking-tight">
                IF-THEN Intention Engine
              </h1>
              <p className="text-xs text-muted-foreground">
                Implementation intentions, not task hoarding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/davidmarkleach/JavaScript-Playground"
                target="_blank"
                rel="noreferrer"
                aria-label="View the source on GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <section className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Every task needs a cue that fires it.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Research on implementation intentions is blunt: a goal paired with a
            concrete situational trigger gets acted on far more often than the
            same goal written as a bare to-do. This engine refuses to store the
            bare version — and caps how many commitments you can hold at once.
          </p>
        </section>

        <IfThenPlanner />
      </main>

      <footer className="border-t py-6">
        <div className="container text-xs text-muted-foreground">
          Stored locally in your browser. Use the data portal to move your
          library between devices.
        </div>
      </footer>

      <Toaster />
    </div>
  )
}

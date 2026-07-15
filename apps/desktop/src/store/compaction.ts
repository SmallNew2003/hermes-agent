import { atom, computed } from 'nanostores'

import { $activeSessionId } from './session'

// Per-session flag while auto-compaction runs mid-turn. Without it the
// transcript looks like it reset; per-session so a background chat can't
// clobber the foreground view.
const keyFor = (sessionId: string | null | undefined): string => sessionId ?? ''

export const $compactingSessions = atom<Record<string, true>>({})

export const $compactionActive = computed(
  [$compactingSessions, $activeSessionId],
  (sessions, activeId) => keyFor(activeId) in sessions
)

export function setSessionCompacting(sessionId: string | null | undefined, active: boolean): void {
  const key = keyFor(sessionId)
  const sessions = $compactingSessions.get()

  if (active) {
    if (key in sessions) {
      return
    }

    $compactingSessions.set({ ...sessions, [key]: true })

    return
  }

  if (!(key in sessions)) {
    return
  }

  const next = { ...sessions }
  delete next[key]
  $compactingSessions.set(next)
}

// Manual `/compress` runs as a dedicated RPC (session.compress), not as a
// turn — so the auto-compaction flag above (driven by gateway status.update
// events mid-turn) never lights up. Track manual compression on its own flag
// so the two paths can't clobber each other: the auto path's message.start /
// message.complete / error cleanup must not clear a manual compress in flight.
export const $compressingSessions = atom<Record<string, true>>({})

export const $compressActive = computed(
  [$compressingSessions, $activeSessionId],
  (sessions, activeId) => keyFor(activeId) in sessions
)

export function setSessionCompressing(sessionId: string | null | undefined, active: boolean): void {
  const key = keyFor(sessionId)
  const sessions = $compressingSessions.get()

  if (active) {
    if (key in sessions) {
      return
    }

    $compressingSessions.set({ ...sessions, [key]: true })

    return
  }

  if (!(key in sessions)) {
    return
  }

  const next = { ...sessions }
  delete next[key]
  $compressingSessions.set(next)
}

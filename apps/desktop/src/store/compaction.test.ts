import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  $compactingSessions,
  $compactionActive,
  $compressActive,
  $compressingSessions,
  setSessionCompacting,
  setSessionCompressing
} from './compaction'
import { $activeSessionId } from './session'

describe('compaction store', () => {
  beforeEach(() => {
    $compactingSessions.set({})
    $activeSessionId.set(null)
  })

  afterEach(() => {
    $compactingSessions.set({})
    $activeSessionId.set(null)
  })

  it('tracks compaction per session independently', () => {
    setSessionCompacting('session-a', true)
    setSessionCompacting('session-b', true)

    expect($compactingSessions.get()).toEqual({ 'session-a': true, 'session-b': true })
  })

  it('exposes only the active session via the focus-scoped view', () => {
    setSessionCompacting('session-a', true)

    expect($compactionActive.get()).toBe(false)

    $activeSessionId.set('session-a')
    expect($compactionActive.get()).toBe(true)

    $activeSessionId.set('session-b')
    expect($compactionActive.get()).toBe(false)
  })

  it('clears a session without disturbing the others', () => {
    setSessionCompacting('session-a', true)
    setSessionCompacting('session-b', true)

    setSessionCompacting('session-a', false)

    expect($compactingSessions.get()).toEqual({ 'session-b': true })
  })

  it('is a no-op when clearing an unknown session', () => {
    setSessionCompacting('session-a', true)
    const before = $compactingSessions.get()

    setSessionCompacting('session-missing', false)

    expect($compactingSessions.get()).toBe(before)
  })
})

describe('compress store', () => {
  beforeEach(() => {
    $compressingSessions.set({})
    $activeSessionId.set(null)
  })

  afterEach(() => {
    $compressingSessions.set({})
    $activeSessionId.set(null)
  })

  it('exposes only the active session via the focus-scoped view', () => {
    setSessionCompressing('session-a', true)

    expect($compressActive.get()).toBe(false)

    $activeSessionId.set('session-a')
    expect($compressActive.get()).toBe(true)

    $activeSessionId.set('session-b')
    expect($compressActive.get()).toBe(false)
  })

  it('clears a session without disturbing the others', () => {
    setSessionCompressing('session-a', true)
    setSessionCompressing('session-b', true)

    setSessionCompressing('session-a', false)

    expect($compressingSessions.get()).toEqual({ 'session-b': true })
  })

  it('is a no-op when clearing an unknown session', () => {
    setSessionCompressing('session-a', true)
    const before = $compressingSessions.get()

    setSessionCompressing('session-missing', false)

    expect($compressingSessions.get()).toBe(before)
  })

  it('is independent of the auto-compaction flag', () => {
    $compactingSessions.set({})
    setSessionCompressing('session-a', true)

    // Manual compress must not light up the auto-compaction view, and vice versa.
    expect($compactingSessions.get()).toEqual({})

    setSessionCompacting('session-a', true)
    setSessionCompressing('session-a', false)

    // Clearing manual compress must leave auto-compaction untouched.
    expect($compactingSessions.get()).toEqual({ 'session-a': true })
  })
})

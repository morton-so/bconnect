'use client'

import { useState } from 'react'
import { useWatch, type Control, type FieldValues } from 'react-hook-form'

interface ServerErrorMapping<T extends FieldValues> {
  field?: keyof T & string
  message: string
}

interface Snapshot<T extends FieldValues> extends ServerErrorMapping<T> {
  values: T
}

export interface UseServerErrorResult<T extends FieldValues> {
  capture: (error: unknown, submitted: T) => void
  fieldError: (field: keyof T & string) => string | undefined
  formError: string | undefined
  reset: () => void
}

export function useServerError<T extends FieldValues>(
  control: Control<T>,
  mapError: (error: unknown) => ServerErrorMapping<T>
): UseServerErrorResult<T> {
  const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null)

  const current = useWatch({ control }) as T

  let live: Snapshot<T> | null = null
  if (snapshot) {
    const unchanged = snapshot.field
      ? current?.[snapshot.field] === snapshot.values[snapshot.field]
      : JSON.stringify(current) === JSON.stringify(snapshot.values)
    if (unchanged) live = snapshot
  }

  return {
    capture: (error, submitted) => {
      setSnapshot({ ...mapError(error), values: submitted })
    },
    fieldError: (field) => (live?.field === field ? live.message : undefined),
    formError: live && !live.field ? live.message : undefined,
    reset: () => setSnapshot(null),
  }
}

export function passthroughError<T extends FieldValues>(
  field?: keyof T & string
): (error: unknown) => ServerErrorMapping<T> {
  return (error) => ({
    ...(field && { field }),
    message: (error as Error).message,
  })
}

export function isApiErrorShape(error: unknown): error is { message: string; code: string } {
  if (typeof error !== 'object' || error === null) return false
  const e = error as { name?: unknown; message?: unknown; code?: unknown }
  return e.name === 'ApiError' && typeof e.message === 'string' && typeof e.code === 'string'
}

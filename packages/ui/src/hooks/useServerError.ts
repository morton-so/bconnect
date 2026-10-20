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

type ServerErrorMessages = Partial<Record<string, string>>

const SESSION_EXPIRED = '로그인이 만료되었습니다. 다시 로그인해주세요.'

const SERVER_ERROR_MESSAGES: ServerErrorMessages = {
  C005: '이미 삭제되었거나 존재하지 않는 항목입니다.',
  C007: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  C009: '로그인이 필요합니다.',
  A002: '잠시 후 인증번호를 다시 요청해주세요.',
  A008: SESSION_EXPIRED,
  A009: SESSION_EXPIRED,
  A010: SESSION_EXPIRED,
  A011: '유효하지 않은 인증 요청입니다.',
  AT004: '파일 업로드가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.',
}

export function serverErrorMessage(error: unknown, messages?: ServerErrorMessages): string {
  if (isApiErrorShape(error)) {
    return messages?.[error.code] ?? SERVER_ERROR_MESSAGES[error.code] ?? error.message
  }
  return (error as Error).message
}

export function passthroughError<T extends FieldValues>(
  field?: keyof T & string,
  messages?: ServerErrorMessages
): (error: unknown) => ServerErrorMapping<T> {
  return (error) => ({
    ...(field && { field }),
    message: serverErrorMessage(error, messages),
  })
}

export function isApiErrorShape(error: unknown): error is { message: string; code: string } {
  if (typeof error !== 'object' || error === null) return false
  const e = error as { name?: unknown; message?: unknown; code?: unknown }
  return e.name === 'ApiError' && typeof e.message === 'string' && typeof e.code === 'string'
}

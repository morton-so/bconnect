'use client'

import { useEffect, useState } from 'react'

function calculateRemainingSeconds(expiresAt: string | null, now: number): number {
  if (!expiresAt) return 0
  const target = new Date(expiresAt).getTime()
  if (Number.isNaN(target)) return 0
  return Math.max(0, Math.floor((target - now) / 1000))
}

function formatRemainingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export interface UseOtpTimerResult {
  remainingSeconds: number
  formatted: string
  expired: boolean
}

/**
 * OTP 만료 시각 (ISO string) 을 받아 초 단위 카운트다운을 1초 간격으로 갱신하고, 만료 시 타이머를 멈춘다.
 * `expiresAt` 변경 시 자동 리셋 — `key` prop trick 불필요.
 *
 * - `remainingSeconds`: 남은 초 (만료 시 0)
 * - `formatted`: `m:ss` 형식 (`0:42`)
 * - `expired`: `remainingSeconds === 0`
 */
export function useOtpTimer(expiresAt: string | null): UseOtpTimerResult {
  const [now, setNow] = useState(() => Date.now())
  const remainingSeconds = calculateRemainingSeconds(expiresAt, now)
  const expired = remainingSeconds <= 0

  useEffect(() => {
    if (expired) return
    const tick = () => setNow(Date.now())
    // 타이머가 멈춘 동안 now 도 멈춰 있으므로 재시작 즉시 현재 시각으로 맞춘다
    const timeout = setTimeout(tick)
    const id = setInterval(tick, 1000)
    return () => {
      clearTimeout(timeout)
      clearInterval(id)
    }
  }, [expired])

  return {
    remainingSeconds,
    formatted: formatRemainingTime(remainingSeconds),
    expired,
  }
}

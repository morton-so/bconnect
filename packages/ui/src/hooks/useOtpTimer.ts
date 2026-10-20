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

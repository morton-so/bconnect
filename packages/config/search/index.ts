import { getChoseong } from 'es-hangul'

/**
 * 한글 초성 + 부분 문자열 매칭
 */
export function matchHangul(target: string, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const t = target.toLowerCase()
  if (t.includes(q)) return true
  return getChoseong(t).includes(getChoseong(q))
}

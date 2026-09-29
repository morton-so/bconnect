import { z } from 'zod'

export const EXPERIENCE_MIN = 0
export const EXPERIENCE_FILTER_MAX = 10 // 필터 상한

export type ExperienceRange = [number, number]
export const FULL_EXPERIENCE_RANGE: ExperienceRange = [EXPERIENCE_MIN, EXPERIENCE_FILTER_MAX]

export const EXPERIENCE_THUMB_LABELS = ['최소 경력', '최대 경력']

export const isFullExperienceRange = ([min, max]: ExperienceRange) =>
  min <= EXPERIENCE_MIN && max >= EXPERIENCE_FILTER_MAX

export const formatExperienceRange = ([min, max]: ExperienceRange) => {
  if (max >= EXPERIENCE_FILTER_MAX) return `${min}년 이상`
  if (min === max) return `${min}년`
  return `${min}~${max}년`
}

export const formatExperienceYears = (years: number) =>
  years >= EXPERIENCE_FILTER_MAX ? `${EXPERIENCE_FILTER_MAX}년 이상` : `${years}년`

export const experienceSchema = z.number({ error: '경력을 입력해주세요' }).int()

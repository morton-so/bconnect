'use client'

import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs'

export function useStorageParams() {
  return useQueryStates({
    file: parseAsString,
    view: parseAsStringEnum<'gallery' | 'list'>(['gallery', 'list']).withDefault('gallery'),
  })
}

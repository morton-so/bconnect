/**
 * @figma-todo 액션 메뉴 드로어 디자인 미정
 */
'use client'

import type { ReactNode } from 'react'
import { Drawer, DrawerContent, DrawerTitle } from './shadcn/drawer'
import { cn } from '../lib/utils'

export interface ActionDrawerItem {
  label: string
  /** 좌측 아이콘 (필수) — 모든 액션은 아이콘을 가진다. currentColor 면 강조색(파랑/빨강) 자동 전파. */
  icon: ReactNode
  onSelect: () => void
  /** 되돌리기 어려운 액션 — 빨강 */
  destructive?: boolean
  /** 긍정/주요 액션 — 파랑. destructive 와 함께 주면 destructive 가 우선. */
  primary?: boolean
  disabled?: boolean
}

interface ActionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  items: ActionDrawerItem[]
}

export function ActionDrawer({ open, onOpenChange, title, items }: ActionDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerTitle className={cn('px-4 py-3 text-m-16 text-gray-900', !title && 'sr-only')}>
          {title ?? '작업 선택'}
        </DrawerTitle>
        <div className="flex flex-col pb-[env(safe-area-inset-bottom)]">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                onOpenChange(false)
                item.onSelect()
              }}
              className={cn(
                'flex cursor-pointer items-center gap-3 px-4 py-4 text-left text-m-16 transition-colors hover:bg-gray-50',
                'disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent',
                item.destructive
                  ? 'text-destructive'
                  : item.primary
                    ? 'text-primary'
                    : 'text-gray-900'
              )}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

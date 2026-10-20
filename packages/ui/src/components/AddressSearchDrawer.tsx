/**
 * @figma-todo 주소 검색 드로어 디자인 미정
 */
'use client'

import { AddressSearchEmbed, type AddressSearchResult } from './AddressSearchEmbed'
import { Drawer, DrawerContent, DrawerTitle } from './shadcn/drawer'

export type { AddressSearchResult }

interface AddressSearchDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: AddressSearchResult) => void
}

export function AddressSearchDrawer({ open, onOpenChange, onComplete }: AddressSearchDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined} className="pb-[env(safe-area-inset-bottom)]">
        <DrawerTitle className="px-4 py-3 text-m-16 text-gray-900">주소 검색</DrawerTitle>
        {open && (
          <AddressSearchEmbed
            onComplete={(data) => {
              onComplete(data)
              onOpenChange(false)
            }}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

/**
 * @figma-todo 푸시 알림 권한 토스트. 디자인 미정
 */
'use client'

import {
  Button,
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  NotificationIcon,
} from '@bconnect/ui'
import { useNotificationSoftAsk } from './use-notification-soft-ask'

export function NotificationPrompt() {
  const { open, accept, dismiss } = useNotificationSoftAsk()

  return (
    <Drawer open={open} onOpenChange={(next) => !next && dismiss()}>
      <DrawerContent aria-describedby="notif-softask-desc">
        <div className="flex flex-col items-center gap-3 px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-50">
            <NotificationIcon size={24} className="text-primary" />
          </span>
          <DrawerTitle className="text-sb-16 text-gray-900">알림을 켜시겠어요?</DrawerTitle>
          <DrawerDescription id="notif-softask-desc" className="text-r-14 text-gray-500">
            새 채팅 메시지와 매칭 소식을 놓치지 않게 알려드려요.
          </DrawerDescription>
          <div className="mt-2 flex w-full flex-col gap-2">
            <Button variant="primary" size="full" onClick={accept}>
              알림 받기
            </Button>
            <Button variant="text" size="full" onClick={dismiss}>
              나중에
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

'use client'

import { NotificationsView, resolveReferenceHref } from '@bconnect/features'
import type { Notification } from '@bconnect/api-client'
import { TopBar } from '@bconnect/ui'
import { REFERENCE_PATHS } from '@/lib/notification-routes'

function resolveHref(n: Notification): string | undefined {
  return resolveReferenceHref(REFERENCE_PATHS, n.referenceType, n.referenceId)
}

export function CareerNotificationsView() {
  return (
    <NotificationsView
      renderShell={({ title, titleCount, rightSlot, children }) => (
        <div className="flex flex-col">
          <TopBar
            variant="default"
            title={title}
            titleCount={titleCount}
            rightSlot={rightSlot}
            backHref="/"
          />
          {children}
        </div>
      )}
      resolveHref={resolveHref}
    />
  )
}

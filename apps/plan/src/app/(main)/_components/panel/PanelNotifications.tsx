'use client'

import { NotificationsView, PanelAside, resolveReferenceHref } from '@bconnect/features'
import type { Notification } from '@bconnect/api-client'
import { usePanelNav, type PanelSegment } from '@/hooks/usePanelNav'
import { REFERENCE_PANEL_SEGMENTS } from '@/lib/notification-routes'

export function PanelNotifications() {
  const { closeHref, close, panelHref } = usePanelNav()

  const resolveHref = (n: Notification): string | undefined => {
    const segment = resolveReferenceHref(REFERENCE_PANEL_SEGMENTS, n.referenceType, n.referenceId)
    return segment ? panelHref(segment as PanelSegment) : undefined
  }

  return (
    <PanelAside label="알림">
      <NotificationsView closeHref={closeHref} onClose={close} resolveHref={resolveHref} />
    </PanelAside>
  )
}

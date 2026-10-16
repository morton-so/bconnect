/**
 * @figma-todo 확인 다이얼로그 디자인 미정
 */
'use client'

import { AlertDialog } from 'radix-ui'
import { Button } from './Button'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => onOpenChange(false)}
        />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 focus:outline-none">
          <AlertDialog.Title className="text-sb-16 text-gray-900">{title}</AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="mt-2 text-r-14 text-gray-600">
              {description}
            </AlertDialog.Description>
          )}
          <div className="mt-5 flex justify-end gap-1">
            <AlertDialog.Cancel asChild>
              <Button variant="text" size="small">
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant="text"
                size="small"
                onClick={onConfirm}
                className={
                  destructive
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-primary hover:bg-primary/10'
                }
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

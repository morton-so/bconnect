/**
 * @figma-todo shadcn
 */
'use client'

import * as React from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'
import { GripVertical } from 'lucide-react'
import { cn } from '../../lib/utils'

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group>) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn('flex h-full w-full', className)}
      {...props}
    />
  )
}

const ResizablePanel = ResizablePrimitive.Panel

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & { withHandle?: boolean }) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        'relative flex w-px items-center justify-center bg-gray-200 transition-colors hover:bg-primary active:bg-primary',
        'focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none',
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-3 items-center justify-center rounded-sm border border-gray-300 bg-white">
          <GripVertical className="h-2.5 w-2.5 text-gray-400" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

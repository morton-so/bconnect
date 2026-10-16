'use client'

import { TopBar } from '@bconnect/ui'

interface SignupHeaderProps {
  step: number
  total?: number
  onBack?: () => void
  backHref?: string
}

export function SignupHeader({ step, total = 3, onBack, backHref }: SignupHeaderProps) {
  return (
    <TopBar variant="progress" step={step} totalSteps={total} onBack={onBack} backHref={backHref} />
  )
}

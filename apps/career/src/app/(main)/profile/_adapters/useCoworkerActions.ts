'use client'

import { useDeleteCoworker } from '@bconnect/api-client'
import { toast } from '@bconnect/ui'

// 무효화(deleteCoworker→동료 목록/카운트)는 orval mutationInvalidates 가 자동 처리 (ADR-0025)
export function useCoworkerActions() {
  const remove = useDeleteCoworker<Error>({
    mutation: {
      onSuccess: () => {
        toast({ description: '동료를 취소했어요', variant: 'success' })
      },
      onError: (error) => toast({ description: error.message, variant: 'error' }),
    },
  })

  return {
    onDeleteCoworker: (memberId: number) => remove.mutate({ memberId }),
    isDeletingCoworker: remove.isPending,
  }
}

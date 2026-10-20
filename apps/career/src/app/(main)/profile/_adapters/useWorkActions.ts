'use client'

import { useDeletePost } from '@bconnect/api-client'
import { serverErrorMessage, toast } from '@bconnect/ui'

export function useWorkActions() {
  const remove = useDeletePost<Error>({
    mutation: {
      onSuccess: () => {
        toast({ description: '작업물을 삭제했어요', variant: 'success' })
      },
      onError: (error) => toast({ description: serverErrorMessage(error), variant: 'error' }),
    },
  })

  return {
    onDeleteWork: (postId: number) => remove.mutate({ id: postId }),
  }
}

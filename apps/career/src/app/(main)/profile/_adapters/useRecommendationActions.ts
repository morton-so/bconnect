'use client'

import {
  useDeleteRecommendation,
  useHideRecommendation,
  useShowRecommendation,
} from '@bconnect/api-client'
import { toast } from '@bconnect/ui'

// 무효화(hide/show→받은목록 / delete→보낸목록)는 orval mutationInvalidates 가 자동 처리 (ADR-0025)
export function useRecommendationActions() {
  const hide = useHideRecommendation<Error>({
    mutation: {
      onSuccess: () => {
        toast({ description: '추천서를 숨겼어요', variant: 'success' })
      },
      onError: (error) => toast({ description: error.message, variant: 'error' }),
    },
  })

  const show = useShowRecommendation<Error>({
    mutation: {
      onSuccess: () => {
        toast({ description: '추천서 숨김을 해제했어요', variant: 'success' })
      },
      onError: (error) => toast({ description: error.message, variant: 'error' }),
    },
  })

  const remove = useDeleteRecommendation<Error>({
    mutation: {
      onSuccess: () => {
        toast({ description: '추천서를 삭제했어요', variant: 'success' })
      },
      onError: (error) => toast({ description: error.message, variant: 'error' }),
    },
  })

  return {
    onHideRecommendation: (id: number) => hide.mutate({ id }),
    onShowRecommendation: (id: number) => show.mutate({ id }),
    onDeleteRecommendation: (id: number) => remove.mutate({ id }),
  }
}

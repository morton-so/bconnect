'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGetMySentRecommendations, useUpdateRecommendation } from '@bconnect/api-client'
import { serverErrorMessage, toast } from '@bconnect/ui'
import { RecommendationEditor } from '@/app/(main)/_components/RecommendationEditor'

/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=3341-7934
 */
export default function EditRecommendationPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const [serverError, setServerError] = useState<string>()

  // TODO: get-by-id 엔드포인트가 없어 보낸 추천서 목록에서 prefill (진입은 목록 케밥 → 캐시 hit)
  const { data: sent } = useGetMySentRecommendations()
  const initialContent = sent?.find((rec) => rec.id === id)?.content ?? ''

  const { mutate, isPending } = useUpdateRecommendation<Error>({
    mutation: {
      onSuccess: () => {
        toast({ description: '추천서를 수정했어요', variant: 'success' })
        router.replace('/profile/recommendations')
      },
      onError: (error) => setServerError(serverErrorMessage(error)),
    },
  })

  return (
    <RecommendationEditor
      title="추천서 수정"
      initialContent={initialContent}
      isPending={isPending}
      serverError={serverError}
      onSubmit={(content) => mutate({ id, data: { content } })}
      backHref="/profile/recommendations"
    />
  )
}

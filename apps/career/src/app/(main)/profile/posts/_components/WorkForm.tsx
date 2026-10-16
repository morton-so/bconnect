/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=3417-12398
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=3417-12441
 */
'use client'

import {
  AttachmentContext,
  AttachmentType,
  createAttachmentConfirm,
  createAttachmentPresign,
  useCreatePost,
  useGetFeed,
  useGetMyMember,
  useGetTasks,
  useUpdatePost,
} from '@bconnect/api-client'
import {
  ChevronIcon,
  cn,
  Form,
  FormError,
  passthroughError,
  TextareaField,
  toast,
  TopBar,
  useScrollToError,
  useServerError,
} from '@bconnect/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { PhotoStrip } from './PhotoStrip'
import { TaskSelectView } from './TaskSelectView'
import { workSchema, type WorkFormValues } from '../_lib/schema'
import { formatWorkPeriod } from '../_lib/post-helpers'

class UploadError extends Error {}

async function uploadPostImages(files: File[], memberId: number): Promise<number[]> {
  const presigned = await createAttachmentPresign({
    context: AttachmentContext.POST,
    type: AttachmentType.IMAGE,
    contextId: memberId,
    files: files.map((f) => ({ filename: f.name, contentType: f.type, size: f.size })),
  })
  await Promise.all(
    presigned.map(async (p, i) => {
      const file = files[i]
      if (!p.uploadUrl || !file)
        throw new UploadError('사진 업로드 준비에 실패했어요. 다시 시도해주세요.')
      const res = await fetch(p.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!res.ok) throw new UploadError(`사진 업로드에 실패했어요 (${res.status})`)
    })
  )
  const attachmentIds = presigned.map((p) => p.id).filter((id): id is number => id != null)
  await createAttachmentConfirm({ attachmentIds })
  return attachmentIds
}

const stepParser = parseAsStringLiteral(['select'] as const).withOptions({
  history: 'push',
})

export function WorkForm({ postId }: { postId?: number }) {
  const isEdit = postId != null
  const router = useRouter()
  const [step, setStep] = useQueryState('step', stepParser)
  const [saving, setSaving] = useState(false)

  const { data: me } = useGetMyMember()
  const { data: tasks, isLoading: tasksLoading } = useGetTasks()
  const { data: feed } = useGetFeed(postId ?? 0, { query: { enabled: isEdit } })

  const workerTasks = useMemo(() => tasks?.workerTasks ?? [], [tasks])

  const editValues = useMemo<WorkFormValues | undefined>(() => {
    if (!isEdit || !feed) return undefined
    return {
      taskId: feed.post.taskId,
      photos: feed.post.attachments.map((a) => ({ id: a.id, url: a.url })),
      content: feed.post.content,
    }
  }, [isEdit, feed])

  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workSchema),
    mode: 'onTouched',
    defaultValues: { taskId: null, photos: [], content: '' },
    values: editValues,
    resetOptions: { keepDirtyValues: true },
  })

  const taskId = useWatch({ control: form.control, name: 'taskId' })
  // 목록에 없는 작업(편집 진입)은 feed.task 로 대체한다. TaskSummary 에는 제목이 없어
  // 그 경로에서는 제목을 만들어내지 않고 '제목 없음' 으로 표시한다.
  const selectedTask = useMemo(() => {
    const fromList = workerTasks.find((t) => t.id === taskId)
    const task = fromList ?? (feed?.task && feed.task.id === taskId ? feed.task : null)
    if (!task) return null
    return {
      title: fromList?.title ?? '제목 없음',
      company: task.company ?? '-',
      start: task.start,
      end: task.end,
      address: task.address,
    }
  }, [workerTasks, feed, taskId])

  const { mutateAsync: createPost } = useCreatePost()
  const { mutateAsync: updatePost } = useUpdatePost()

  const scrollToError = useScrollToError()
  const server = useServerError(form.control, (err) =>
    err instanceof UploadError ? { message: err.message } : passthroughError<WorkFormValues>()(err)
  )
  const onSave = form.handleSubmit(async (data) => {
    if (me?.id == null || saving) return
    setSaving(true)
    try {
      const newFiles = data.photos.filter((p): p is File => p instanceof File)
      const keptIds = data.photos
        .filter((p): p is { id: number; url: string } => !(p instanceof File))
        .map((p) => p.id)
      const newIds = newFiles.length > 0 ? await uploadPostImages(newFiles, me.id) : []
      const payload = {
        taskId: data.taskId ?? undefined,
        attachmentIds: [...keptIds, ...newIds],
        content: data.content,
      }
      if (isEdit) await updatePost({ id: postId, data: payload })
      else await createPost({ data: payload })
      toast({
        description: isEdit ? '작업물이 수정되었어요' : '작업물이 등록되었어요',
        variant: 'success',
      })
      router.replace('/profile?tab=works')
    } catch (e) {
      server.capture(e, data)
      setSaving(false)
    }
  }, scrollToError)

  if (step === 'select') {
    return (
      <TaskSelectView
        tasks={workerTasks}
        isLoading={tasksLoading}
        selectedId={taskId}
        onConfirm={(id) => {
          form.setValue('taskId', id, { shouldValidate: true })
          setStep(null, { history: 'replace' })
        }}
        onBack={() => setStep(null, { history: 'replace' })}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopBar
        variant="default"
        title={isEdit ? '작업물 수정' : '작업물 생성'}
        actionText={saving ? '저장 중...' : '저장'}
        actionDisabled={saving}
        onAction={onSave}
        backHref="/profile?tab=works"
      />

      <Form {...form}>
        <form onSubmit={onSave} className="flex flex-col gap-5 p-5">
          <Controller
            control={form.control}
            name="photos"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <PhotoStrip
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!fieldState.error}
                />
                <FormError error={fieldState.error?.message} />
              </div>
            )}
          />

          {selectedTask ? (
            <button
              type="button"
              onClick={() => setStep('select')}
              aria-label="수행한 작업 다시 선택"
              className="flex w-full cursor-pointer flex-col gap-3 rounded-xl bg-gray-50 px-5 py-4 text-left"
            >
              <span className="text-sb-16 text-gray-900">{selectedTask.title}</span>
              <span className="flex flex-col gap-2 text-r-14">
                <span className="flex gap-2">
                  <span className="w-15 shrink-0 text-m-14 text-gray-400">업체명</span>
                  <span className="text-gray-900">{selectedTask.company}</span>
                </span>
                <span className="flex gap-2">
                  <span className="w-15 shrink-0 text-m-14 text-gray-400">시공기간</span>
                  <span className="text-gray-900">
                    {formatWorkPeriod(selectedTask.start, selectedTask.end, '~')}
                  </span>
                </span>
                <span className="flex gap-2">
                  <span className="w-15 shrink-0 text-m-14 text-gray-400">현장주소</span>
                  <span className="min-w-0 flex-1 truncate text-gray-900">
                    {selectedTask.address
                      ? `${selectedTask.address.street}${selectedTask.address.detail ? `, ${selectedTask.address.detail}` : ''}`
                      : '-'}
                  </span>
                </span>
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sb-16 text-gray-900">수행한 작업 선택</p>
              <button
                type="button"
                onClick={() => setStep('select')}
                aria-invalid={form.formState.errors.taskId ? true : undefined}
                className={cn(
                  'flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-2.5',
                  form.formState.errors.taskId && 'ring-1 ring-destructive'
                )}
              >
                <span className="text-m-14 text-gray-400">작업을 선택해주세요...</span>
                <ChevronIcon size={16} className="text-gray-500" />
              </button>
              <FormError error={form.formState.errors.taskId?.message} />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-sb-16 text-gray-900">상세 시공 설명</p>
            <TextareaField
              control={form.control}
              name="content"
              aria-label="상세 시공 설명"
              placeholder="수행하신 시공 작업에 대해 자세히 적어주세요."
              className="min-h-55 rounded-lg text-r-16"
            />
          </div>

          <FormError error={server.formError} />
        </form>
      </Form>
    </div>
  )
}

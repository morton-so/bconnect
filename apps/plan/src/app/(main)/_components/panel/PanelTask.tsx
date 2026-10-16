/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1879-12536
 */
'use client'

import { usePanelNav } from '@/hooks/usePanelNav'
import { useAllProjectTasks } from '@/hooks/useAllProjectTasks'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { useDraftTaskStore } from '@/stores/draft-task-store'
import {
  ConfirmDialog,
  DateRangeField,
  Form,
  FormSubmitButton,
  SearchIcon,
  SelectField,
  TagSelectField,
  TextField,
  TextareaField,
} from '@bconnect/ui'
import { PanelAside, PanelScroll, PanelShell } from '@bconnect/features'
import { TASK_PROGRESS_LABELS, TaskProgress, TRADE_LABELS, TRADE_LIST } from '@bconnect/api-client'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DRAFT_TASK_ID } from '@/lib/schedule/task-helpers'
import type { ScheduleTask } from '@/lib/schedule/types'
import { taskSchema, type TaskFormValues } from '@/app/(main)/_lib/schema'
import { OfferQueue } from '../offer/OfferQueue'

const PROGRESS_OPTIONS = Object.entries(TASK_PROGRESS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const EMPTY_FORM: TaskFormValues = {
  title: '',
  start: '',
  end: '',
  trades: [],
  progress: TaskProgress.TODO,
  requirement: '',
  memo: '',
}

function toFormValues(task: ScheduleTask): TaskFormValues {
  return {
    title: task.title ?? '',
    start: task.start ?? '',
    end: task.end ?? '',
    trades: task.trades ?? [],
    progress: task.progress,
    requirement: task.requirement ?? '',
    memo: task.memo ?? '',
  }
}

export function PanelTask({ taskId }: { taskId?: number }) {
  const { close, closeHref } = usePanelNav()
  const pathname = usePathname()
  const draft = useDraftTaskStore((s) => s.draft)
  const patchDraft = useDraftTaskStore((s) => s.patchDraft)
  const clearDraft = useDraftTaskStore((s) => s.clearDraft)
  const { tasks: allTasks, projects, isLoading: isTasksLoading } = useAllProjectTasks()

  const isDraft = taskId === DRAFT_TASK_ID
  const isEdit = taskId != null
  const task = isDraft ? (draft ?? undefined) : allTasks.find((t) => t.id === taskId)

  const projectId = task
    ? String(task.projectId)
    : (pathname.match(/^\/projects\/([^/]+)/)?.[1] ?? String(projects[0]?.id ?? ''))
  const { updateTask, deleteTask, createTask, isCreating, flushPendingSave } =
    useTaskMutations(projectId)

  const [cancelOpen, setCancelOpen] = useState(false)

  const values = useMemo(() => (isEdit && task ? toFormValues(task) : undefined), [isEdit, task])

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    mode: 'onChange',
    defaultValues: EMPTY_FORM,
    values,
  })

  useEffect(() => {
    if (taskId == null) return
    const sub = form.watch((value, { type }) => {
      if (type !== 'change') return
      const parsed = taskSchema.safeParse(value)
      if (!parsed.success) return
      if (isDraft) patchDraft(parsed.data)
      else updateTask(taskId, parsed.data)
    })
    return () => sub.unsubscribe()
  }, [isDraft, taskId, form, updateTask, patchDraft])

  async function confirmDraft(vals: TaskFormValues) {
    await createTask(vals)
    clearDraft()
    close()
  }

  function requestClose() {
    if (isDraft) {
      const parsed = taskSchema.safeParse(form.getValues())
      if (!parsed.success) {
        setCancelOpen(true)
        return
      }
      if (!isCreating) confirmDraft(parsed.data)
      return
    }
    flushPendingSave()
    close()
  }

  useEffect(() => {
    if (!isDraft) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDraft])

  if (isEdit && !task) {
    return (
      <PanelAside label="작업 편집">
        <PanelShell title="작업 편집" closeHref={closeHref} onClose={close}>
          <p className="px-5 py-10 text-center text-r-14 text-gray-500">
            {isTasksLoading ? '작업을 불러오는 중이에요.' : '작업을 찾을 수 없어요.'}
          </p>
        </PanelShell>
      </PanelAside>
    )
  }

  const onSubmit = form.handleSubmit(async (vals) => {
    if (isDraft) {
      await confirmDraft(vals)
      return
    }
    if (isEdit) return
    await createTask(vals)
    close()
  })

  const title =
    isEdit && !isDraft
      ? `${(task?.trades ?? []).map((t) => TRADE_LABELS[t]).join('/')} 시공`
      : '작업 생성'

  return (
    <>
      {isDraft && (
        <div className="fixed inset-0 z-30 bg-black/20" onClick={requestClose} aria-hidden="true" />
      )}
      <PanelAside label={isEdit && !isDraft ? '작업 편집' : '작업 생성'}>
        <PanelShell
          title={title}
          closeHref={closeHref}
          onClose={requestClose}
          closeAsButton={isDraft}
        >
          <PanelScroll>
            <Form {...form}>
              <form onSubmit={onSubmit} className="flex flex-col px-4 pb-6">
                <TextField control={form.control} name="title" label="작업명" layout="row" />
                <DateRangeField
                  control={form.control}
                  startName="start"
                  endName="end"
                  label="작업기간"
                  layout="row"
                />
                <TagSelectField
                  control={form.control}
                  name="trades"
                  options={TRADE_LIST}
                  label="공종"
                  layout="row"
                />
                {isEdit && !isDraft && (
                  <SelectField
                    control={form.control}
                    name="progress"
                    label="진행 상태"
                    layout="row"
                    options={PROGRESS_OPTIONS}
                  />
                )}
                <TextField
                  control={form.control}
                  name="requirement"
                  label="요청사항"
                  layout="row"
                />
                <TextareaField control={form.control} name="memo" label="메모" layout="row" />
                <p className="mt-3 text-r-12 text-gray-500">
                  * 작성된 메모는 기술자에게 공개되지 않아요
                </p>
                {(!isEdit || isDraft) && (
                  <FormSubmitButton className="mt-5">작업 생성</FormSubmitButton>
                )}
              </form>
            </Form>

            <div className="mt-2 border-t border-solid border-[#e5e5e5] px-5 py-4">
              <h3 className="text-sb-14 text-gray-900">섭외대기열</h3>
              {taskId != null && !isDraft ? (
                <OfferQueue
                  taskId={taskId}
                  emptyActionHref={`/?task=${taskId}&trade=${(task?.trades ?? []).join(',')}`}
                />
              ) : (
                <div className="flex flex-col items-center pt-8 pb-4">
                  <div className="flex size-[140px] items-center justify-center rounded-full bg-secondary">
                    <SearchIcon size={72} className="text-primary" />
                  </div>
                  <p className="mt-4 text-r-14 text-gray-600">작업을 먼저 생성해주세요</p>
                </div>
              )}
            </div>
          </PanelScroll>
        </PanelShell>
      </PanelAside>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="작업 생성을 취소할까요?"
        description="작성 중인 작업이 사라져요."
        confirmLabel="생성 취소"
        destructive
        onConfirm={() => {
          if (isDraft) clearDraft()
          else if (taskId != null) deleteTask(taskId)
          setCancelOpen(false)
          close()
        }}
      />
    </>
  )
}

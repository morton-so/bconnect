'use client'

import {
  TASK_PROGRESS_LABELS,
  TASK_STATUS_WORKER_LABELS,
  TaskStatus,
  TRADE_LABELS,
  TRADE_LIST,
  useDeleteTask,
  useUpdateTaskAssignee,
  useUpdateTaskWorker,
} from '@bconnect/api-client'
import { isCompleteAddress } from '@bconnect/lib/address'
import {
  ConfirmDialog,
  DateRangeField,
  Form,
  InfoPopover,
  MoreVerticalIcon,
  SelectField,
  SkillTag,
  TagSelectField,
  TextField,
  TextareaField,
  cn,
  serverErrorMessage,
  toast,
} from '@bconnect/ui'
import { formatPeriod } from '@bconnect/lib/date'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AddressField } from '@/components/AddressField'
import { useShareCurrentUrl } from '@/hooks/useShareCurrentUrl'
import {
  assigneeEditSchema,
  workerEditSchema,
  type AssigneeEditValues,
  type WorkerEditValues,
} from '@/app/(main)/calendar/_lib/schema'
import type { CalendarTask } from '@/app/(main)/calendar/_lib/types'
import { TaskActionDrawer } from './TaskActionDrawer'

const PROGRESS_OPTIONS = Object.entries(TASK_PROGRESS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

function toWorkerEditValues(task: CalendarTask): WorkerEditValues {
  return {
    title: task.title,
    progress: task.progress,
    memo: task.memo,
    company: task.company ?? '',
    start: task.start,
    end: task.end,
    address: task.address,
    trades: task.trades,
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-2">
      <span className="w-16 shrink-0 text-m-14 text-gray-400">{label}</span>
      <span className="text-m-14 text-gray-900">{children}</span>
    </div>
  )
}

interface TaskDetailCardProps {
  task: CalendarTask
  selectedDay: string
  selectedMonth: string
}

export function TaskDetailCard({ task, selectedDay, selectedMonth }: TaskDetailCardProps) {
  const getShareUrl = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('day', selectedDay)
    url.searchParams.set('month', selectedMonth)
    return url.href
  }, [selectedDay, selectedMonth])
  const share = useShareCurrentUrl({ getUrl: getShareUrl })
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const workerForm = useForm<WorkerEditValues>({
    resolver: zodResolver(workerEditSchema),
    mode: 'onTouched',
    defaultValues: toWorkerEditValues(task),
  })

  const assigneeForm = useForm<AssigneeEditValues>({
    resolver: zodResolver(assigneeEditSchema),
    mode: 'onTouched',
    defaultValues: { title: task.title, progress: task.progress, memo: task.memo },
  })

  const onError = (error: unknown) =>
    toast({ description: serverErrorMessage(error), variant: 'error' })

  const onSaved = () => {
    toast({ description: '수정되었어요', variant: 'success' })
    setMode('view')
  }

  const { mutate: updateWorker, isPending: savingWorker } = useUpdateTaskWorker({
    mutation: { onSuccess: onSaved, onError },
  })

  const { mutate: updateAssignee, isPending: savingAssignee } = useUpdateTaskAssignee({
    mutation: { onSuccess: onSaved, onError },
  })

  const saving = savingWorker || savingAssignee
  const canEdit = task.canManage || task.status === TaskStatus.ASSIGNED

  const { mutate: remove } = useDeleteTask({
    mutation: {
      onSuccess: () => {
        toast({ description: '삭제되었어요', variant: 'success' })
      },
      onError,
    },
  })

  const onSubmit = task.canManage
    ? workerForm.handleSubmit((vals) => {
        updateWorker({
          id: task.id,
          data: {
            title: vals.title,
            progress: vals.progress,
            memo: vals.memo?.trim(),
            company: vals.company,
            address: isCompleteAddress(vals.address) ? vals.address : undefined,
            trades: vals.trades,
            start: vals.start,
            end: vals.end,
          },
        })
      })
    : assigneeForm.handleSubmit((vals) =>
        updateAssignee({
          id: task.id,
          data: { title: vals.title, progress: vals.progress, memo: vals.memo?.trim() },
        })
      )

  return (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sb-16 text-gray-900">{task.title}</h2>
        <div className="flex shrink-0 items-center gap-1">
          {!task.canManage && (
            <span className="flex items-center gap-0.5 rounded bg-gray-100 px-2 py-1 text-r-12 text-gray-500">
              {TASK_STATUS_WORKER_LABELS[task.status]}
              <InfoPopover label="섭외 상태 설명">
                업체가 이 작업에 함께할 기술자를 구하는 상태예요. 섭외가 진행되면 자동으로 바뀌고,
                직접 바꿀 수는 없어요.
              </InfoPopover>
            </span>
          )}
          {mode === 'view' ? (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex size-6 cursor-pointer items-center justify-center text-gray-500 transition-opacity hover:opacity-60"
              aria-label="작업 메뉴"
            >
              <MoreVerticalIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className={cn(
                'text-sb-16 transition-opacity',
                saving
                  ? 'cursor-default text-gray-400'
                  : 'cursor-pointer text-primary hover:opacity-60'
              )}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          )}
        </div>
      </div>

      {mode === 'view' ? (
        <div className="mt-3">
          {task.company && <Row label="업체명">{task.company}</Row>}
          {task.start && task.end && (
            <Row label="작업기간">{formatPeriod(task.start, task.end)}</Row>
          )}
          {task.address && (
            <Row label="현장주소">
              {task.address.street}
              {task.address.detail ? ` ${task.address.detail}` : ''}
            </Row>
          )}
          {task.trades.length > 0 && (
            <Row label="공종">
              <span className="flex flex-wrap gap-1.5">
                {task.trades.map((t) => (
                  <SkillTag key={t} label={TRADE_LABELS[t]} />
                ))}
              </span>
            </Row>
          )}
          {task.progress && <Row label="진행 상태">{TASK_PROGRESS_LABELS[task.progress]}</Row>}
          {task.requirement && <Row label="요청사항">{task.requirement}</Row>}
          {task.memo && (
            <Row label="메모">
              <span className="whitespace-pre-line">{task.memo}</span>
            </Row>
          )}
        </div>
      ) : task.canManage ? (
        <Form {...workerForm}>
          <form onSubmit={onSubmit} className="mt-2 flex flex-col">
            <TextField control={workerForm.control} name="title" label="제목" layout="row" />
            <TextField control={workerForm.control} name="company" label="업체명" layout="row" />
            <DateRangeField
              control={workerForm.control}
              startName="start"
              endName="end"
              label="작업기간"
              layout="row"
            />
            <AddressField
              control={workerForm.control}
              name="address"
              label="현장주소"
              layout="row"
            />
            <TagSelectField
              control={workerForm.control}
              name="trades"
              options={TRADE_LIST}
              label="공종"
              layout="row"
            />
            <SelectField
              control={workerForm.control}
              name="progress"
              label="진행 상태"
              layout="row"
              options={PROGRESS_OPTIONS}
            />
            <TextareaField control={workerForm.control} name="memo" label="메모" layout="row" />
          </form>
        </Form>
      ) : (
        <Form {...assigneeForm}>
          <form onSubmit={onSubmit} className="mt-2 flex flex-col">
            <TextField control={assigneeForm.control} name="title" label="제목" layout="row" />
            <SelectField
              control={assigneeForm.control}
              name="progress"
              label="진행 상태"
              layout="row"
              options={PROGRESS_OPTIONS}
            />
            <TextareaField control={assigneeForm.control} name="memo" label="메모" layout="row" />
          </form>
        </Form>
      )}

      <TaskActionDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onShare={share}
        onEdit={() => setMode('edit')}
        onDelete={() => setConfirmOpen(true)}
        canEdit={canEdit}
        canDelete={task.canManage}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="작업을 삭제할까요?"
        description="삭제한 작업은 복구할 수 없어요."
        confirmLabel="삭제"
        destructive
        onConfirm={() => {
          remove({ id: task.id })
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}

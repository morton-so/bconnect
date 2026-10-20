import { create } from 'zustand'
import { TaskProgress, TaskStatus } from '@bconnect/api-client'
import { DRAFT_TASK_ID } from '@/lib/schedule/task-helpers'
import type { ScheduleTask } from '@/lib/schedule/types'

interface DraftTaskState {
  draft: ScheduleTask | null
  startDraft: (input: Pick<ScheduleTask, 'projectId' | 'start' | 'end'>) => void
  patchDraft: (patch: Partial<Omit<ScheduleTask, 'id'>>) => void
  clearDraft: () => void
}

export const useDraftTaskStore = create<DraftTaskState>()((set) => ({
  draft: null,
  startDraft: (input) =>
    set({
      draft: {
        ...input,
        id: DRAFT_TASK_ID,
        trades: [],
        title: '',
        status: TaskStatus.NONE,
        progress: TaskProgress.TODO,
        workerId: null,
        requirement: null,
        memo: null,
        address: null,
        createdAt: '',
        modifiedAt: '',
        draft: true,
      },
    }),
  patchDraft: (patch) => set((s) => (s.draft ? { draft: { ...s.draft, ...patch } } : s)),
  clearDraft: () => set({ draft: null }),
}))

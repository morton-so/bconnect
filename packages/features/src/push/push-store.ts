import { create } from 'zustand'

export type PushPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported'

interface PushStore {
  permissionStatus: PushPermissionStatus
  isSupported: boolean
  token: string | null
}

export const usePushStore = create<PushStore>(() => ({
  permissionStatus: 'prompt',
  isSupported: false,
  token: null,
}))

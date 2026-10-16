'use client'

import { createDevice, deleteDevice, DevicePlatform } from '@bconnect/api-client'

export async function registerDeviceToken(token: string): Promise<void> {
  try {
    await createDevice({ token, platform: DevicePlatform.web })
  } catch (error) {
    console.warn('[FCM] 디바이스 토큰 등록 에러:', error)
  }
}

export async function unregisterDeviceToken(token: string): Promise<void> {
  try {
    await deleteDevice({ token })
  } catch (error) {
    console.warn('[FCM] 디바이스 토큰 삭제 에러:', error)
  }
}

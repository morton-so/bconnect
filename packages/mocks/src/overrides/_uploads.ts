export interface MockUpload {
  url: string
  contentType: string
  size: number
}

const uploads = new Map<number, MockUpload>()

export async function rememberUpload(id: number, request: Request): Promise<void> {
  const blob = await request.blob()
  uploads.set(id, {
    url: URL.createObjectURL(blob),
    contentType: blob.type || 'application/octet-stream',
    size: blob.size,
  })
}

export function uploadedFile(id: number): MockUpload | undefined {
  return uploads.get(id)
}

import { CredentialStatus, CredentialType } from '@bconnect/api-client'
import {
  getGetCredentialsMockHandler,
  getGetMyCredentialsMockHandler,
  getCreateCredentialMockHandler,
  getDeleteCredentialMockHandler,
  getCreateAttachmentPresignMockHandler,
  getCreateAttachmentConfirmMockHandler,
} from '@bconnect/api-client/msw'
import type {
  Attachment,
  ConfirmRequest,
  CreateCredentialRequest,
  Credential,
  PresignRequest,
  PresignedFile,
} from '@bconnect/api-client'
import { http, HttpResponse } from 'msw'
import { rememberUpload } from './_uploads'

let nextId = 1
const cred = (
  type: CredentialType,
  status: CredentialStatus,
  expiredAt: string | null
): Credential => ({
  id: nextId++,
  memberId: 1,
  type,
  status,
  expiredAt,
  note: null,
  attachment: null,
  createdAt: '2026-01-01T00:00:00Z',
  modifiedAt: '2026-01-01T00:00:00Z',
})

const CREDENTIALS: Credential[] = [
  cred(CredentialType.IDENTITY_VERIFICATION, CredentialStatus.ACCEPTED, null),
  cred(CredentialType.SOLE_PROPRIETOR, CredentialStatus.ACCEPTED, '2026-09-21'),
  cred(CredentialType.CONSTRUCTION_LICENSE, CredentialStatus.ACCEPTED, '2027-09-21'),

  cred(CredentialType.CAREER_CERTIFICATE, CredentialStatus.ACCEPTED, '2027-02-18'),
  cred(CredentialType.CAREER_CERTIFICATE, CredentialStatus.ACCEPTED, '2028-05-10'),
  cred(CredentialType.OTHER_CERTIFICATE, CredentialStatus.ACCEPTED, null),
  cred(CredentialType.OTHER_CERTIFICATE, CredentialStatus.PENDING, null),

  cred(CredentialType.NATIONAL_TECHNICAL_QUALIFICATION, CredentialStatus.ACCEPTED, '2027-02-18'),
  cred(CredentialType.NATIONAL_TECHNICAL_QUALIFICATION, CredentialStatus.ACCEPTED, '2029-11-30'),
]

// TODO: presign/confirm 핸들러는 컨텍스트 공용 엔드포인트 — drives에도 같은 override 가
// 있어 둘 다 머지되면 하나로 통합 필요.
let nextAttachmentId = 1
const pendingAttachments = new Map<number, Attachment>()

export const credentialsOverrides = [
  getGetCredentialsMockHandler(() => CREDENTIALS),
  getGetMyCredentialsMockHandler(() => CREDENTIALS),
  getCreateCredentialMockHandler(async ({ request }) => {
    const body = (await request.json()) as CreateCredentialRequest
    const created = cred(body.type, CredentialStatus.ACCEPTED, body.expiredAt ?? null)
    if (body.attachmentId != null) {
      created.attachment = pendingAttachments.get(body.attachmentId) ?? null
      pendingAttachments.delete(body.attachmentId)
    }
    CREDENTIALS.push(created)
    return created.id ?? 0
  }),
  getCreateAttachmentPresignMockHandler(async ({ request }): Promise<PresignedFile[]> => {
    const body = (await request.json()) as PresignRequest
    return body.files.map((f) => {
      const id = nextAttachmentId++
      const stamp = new Date().toISOString()
      pendingAttachments.set(id, {
        id,
        memberId: 1,
        type: body.type,
        filename: f.filename,
        contentType: f.contentType,
        size: f.size,
        createdAt: stamp,
        modifiedAt: stamp,
        url: `/mock-s3/${id}`,
      })
      return { id, uploadUrl: `/mock-s3/${id}` }
    })
  }),
  http.put('*/mock-s3/:id', async ({ params, request }) => {
    await rememberUpload(Number(params.id), request)
    return new HttpResponse(null, { status: 200 })
  }),
  getCreateAttachmentConfirmMockHandler(async ({ request }): Promise<Attachment[]> => {
    const body = (await request.json()) as ConfirmRequest
    return body.attachmentIds
      .map((id) => pendingAttachments.get(id))
      .filter((a): a is Attachment => a != null)
  }),
  getDeleteCredentialMockHandler(({ params }) => {
    const index = CREDENTIALS.findIndex((c) => c.id === Number(params.credentialId))
    if (index !== -1) CREDENTIALS.splice(index, 1)
    return { success: true }
  }),
]

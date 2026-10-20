import { NextResponse } from 'next/server'
import { fetchOwnerVerification } from '@/app/one-click/_lib/one-click'
import { ownerVerifySchema } from '@/app/one-click/_lib/schema'

export async function POST(request: Request) {
  try {
    const parsed = ownerVerifySchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, message: parsed.error.issues[0]?.message },
        { status: 400 }
      )
    }

    const result = await fetchOwnerVerification(parsed.data)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ valid: false, message: '진위확인에 실패했습니다.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION
const LAMBDA_FUNCTION_NAME = 'instagram-parser'

function validateEnvVars(): string | null {
  if (!AWS_ACCESS_KEY_ID) return 'AWS_ACCESS_KEY_ID is not configured'
  if (!AWS_SECRET_ACCESS_KEY) return 'AWS_SECRET_ACCESS_KEY is not configured'
  if (!AWS_REGION) return 'AWS_REGION is not configured'
  return null
}

const lambdaClient =
  AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_REGION
    ? new LambdaClient({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      })
    : null

export async function POST(request: NextRequest) {
  const envError = validateEnvVars()
  if (envError || !lambdaClient) {
    console.error('Environment validation failed:', envError)
    return NextResponse.json({ success: false, error: '서버 설정 오류' }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: '파일이 없습니다' }, { status: 400 })
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { success: false, error: 'ZIP 파일만 업로드 가능합니다' },
        { status: 400 }
      )
    }

    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 50MB 이하여야 합니다' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const command = new InvokeCommand({
      FunctionName: LAMBDA_FUNCTION_NAME,
      Payload: JSON.stringify({
        body: buffer.toString('base64'),
        isBase64Encoded: true,
      }),
    })

    const response = await lambdaClient.send(command)

    if (response.FunctionError) {
      console.error('Lambda error:', response.FunctionError)
      return NextResponse.json(
        { success: false, error: 'ZIP 파일 처리 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    const payload = response.Payload ? JSON.parse(Buffer.from(response.Payload).toString()) : null

    if (!payload) {
      return NextResponse.json({ success: false, error: 'Lambda 응답이 없습니다' }, { status: 500 })
    }

    const body = typeof payload.body === 'string' ? JSON.parse(payload.body) : payload.body

    return NextResponse.json(body)
  } catch (error) {
    console.error('Instagram parse error:', error)
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

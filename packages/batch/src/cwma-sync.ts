// 건설근로자공제회 퇴직공제 가입사업장 (data.go.kr odcloud) → cwma_retirement_fund (이름 기반, 전체 교체)

import { createDb, replaceAll } from './db'
import { fetchJson, withPage, withRetry } from './http'
import {
  normalizeCompanyName,
  notifySlack,
  requireBody,
  requireNumber,
  requireText,
  runSync,
  toNullableText,
} from './lib'

const API_KEY = process.env.DATA_GO_SERVICE_KEY

// 건설근로자공제회_퇴직공제 가입사업장 정보(3074038), uddi는 분기 갱신
const CWMA_URL = 'https://api.odcloud.kr/api/3074038/v1/uddi:86a88cc7-d407-46c7-b8fb-ae71cc8fb992'
const PER_PAGE = 1000

if (!API_KEY) throw new Error('DATA_GO_SERVICE_KEY is required')

const sql = createDb()

interface CwmaItem {
  seqNo: number
  projectName: string
  totalAmount: number
  startDate: string
  endDate: string
  companyName: string
  clientOrg: string
  address: string
}

async function main() {
  console.log('[cwma-sync] 퇴직공제 가입사업장 조회...')
  const items = await withPage('cwma-sync', async (page) => {
    const body = await withRetry(() =>
      fetchJson<{ data?: Array<Record<string, string | number>> }>(CWMA_URL, {
        query: { serviceKey: API_KEY!, page, perPage: PER_PAGE, returnType: 'JSON' },
      })
    )

    const data = requireBody(body.data, 'data', 'cwma-sync')

    return {
      items: data.map((it): CwmaItem => {
        const amountText = toNullableText(it['총공사금액(억원)'])
        return {
          seqNo: requireNumber(Number(it['연번']), 'seq_no', 'cwma-sync'),
          projectName: requireText(it['공사명'], 'project_name', 'cwma-sync'),
          totalAmount: requireNumber(
            amountText != null ? Number(amountText) : NaN,
            'total_amount',
            'cwma-sync'
          ),
          startDate: requireText(it['공사시작일'], 'start_date', 'cwma-sync'),
          endDate: requireText(it['공사종료일'], 'end_date', 'cwma-sync'),
          companyName: requireText(it['업체명'], 'company_name', 'cwma-sync'),
          clientOrg: requireText(it['수요기관'], 'client_org', 'cwma-sync'),
          address: requireText(it['소재지주소'], 'address', 'cwma-sync'),
        }
      }),
    }
  })
  console.log(`[cwma-sync] 총 ${items.length}건 수집`)

  await sql.begin(async (tx) => {
    await replaceAll(
      tx,
      'cwma_retirement_fund',
      items.map((item) => ({
        seq_no: item.seqNo,
        project_name: item.projectName,
        total_amount: item.totalAmount,
        start_date: item.startDate,
        end_date: item.endDate,
        company_name: item.companyName,
        normalized_company_name: normalizeCompanyName(item.companyName),
        client_org: item.clientOrg,
        address: item.address,
      }))
    )
    console.log(`[cwma-sync] cwma_retirement_fund: ${items.length}건 저장`)
  })

  const summary = [`✅ *CWMA 동기화 완료*`, `퇴직공제 가입사업장: ${items.length}건`].join('\n')
  console.log(`[cwma-sync] ${summary}`)
  await notifySlack(summary)
}

runSync('cwma-sync', sql, main)

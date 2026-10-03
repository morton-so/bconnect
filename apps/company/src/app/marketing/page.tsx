/**
 * @figma-todo 디자인 없음
 */
import type { Metadata } from 'next'
import { LegalDocument, type LegalBlock } from '../_components/LegalDocument'

export const metadata: Metadata = {
  title: '광고성 정보 수신 동의',
  description: '품앗이 서비스의 광고성 정보 수신 동의 안내입니다.',
  alternates: { canonical: '/marketing' },
}

const BLOCKS: LegalBlock[] = [
  {
    p: '모튼(이하 "회사")은 품앗이 서비스의 광고성 정보를 아래와 같이 전송합니다.',
  },
  {
    table: {
      head: ['구분', '내용'],
      label: true,
      rows: [
        ['전송자', '모튼'],
        ['이용 목적', '광고성 정보의 전송'],
        ['전송 매체', '문자메시지, 푸시 알림'],
        ['이용 항목', '휴대전화번호, 푸시 토큰'],
        ['보유·이용 기간', '회원 탈퇴 또는 동의 철회 시까지'],
      ],
    },
  },
  { p: '① 광고성 정보 수신 동의는 선택 사항이며, 동의하지 않아도 서비스 이용에 제한이 없습니다.' },
  { p: '② 회원은 앱 내 설정 메뉴에서 언제든지 수신을 거부할 수 있습니다.' },

  { h2: '부칙' },
  {
    table: {
      head: ['구분', '내용'],
      label: true,
      rows: [
        ['버전', 'v1.0.0'],
        ['공고일자', '[ ]'],
        ['시행일자', '[ ]'],
      ],
    },
  },
]

export default function MarketingPage() {
  return <LegalDocument title="품앗이 광고성 정보 수신 동의" blocks={BLOCKS} />
}

// 클라이언트 공용 에러

export class UnknownSidoError extends Error {
  constructor(public readonly sido: string) {
    super(`인식할 수 없는 시/도 표기: ${sido}`)
    this.name = 'UnknownSidoError'
  }
}

export const UNKNOWN_SIDO_MESSAGE = '주소의 시/도를 인식할 수 없습니다. 주소를 다시 검색해주세요.'

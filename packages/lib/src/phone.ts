/** 휴대전화 번호 하이픈 형식 */
export function formatPhoneNumber(digits: string): string {
  const middle = digits.length === 10 ? 3 : 4
  return [digits.slice(0, 3), digits.slice(3, 3 + middle), digits.slice(3 + middle)]
    .filter(Boolean)
    .join('-')
}

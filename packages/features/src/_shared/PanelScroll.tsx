/** 패널 본문 스크롤 컨테이너 — 리스트형 뷰(Profile/Messages/Notifications)가 본문을 감싼다. */
export function PanelScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  )
}

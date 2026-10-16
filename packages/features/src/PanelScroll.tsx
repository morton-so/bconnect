export function PanelScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  )
}

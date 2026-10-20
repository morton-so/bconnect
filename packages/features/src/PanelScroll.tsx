export function PanelScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  )
}

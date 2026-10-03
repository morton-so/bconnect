/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=188-1577
 */
import * as React from 'react'
import { cn } from '../../lib/utils'

export interface TabItem {
  key: string
  label: string
}

export interface TabProps {
  items: TabItem[]
  activeKey: string
  onChange?: (key: string) => void
  className?: string
}

/**
 * Tab 컴포넌트 (Morton 디자인 시스템)
 *
 * Figma: https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=188-1577
 *
 * @example
 * ```tsx
 * const [activeTab, setActiveTab] = useState('intro')
 *
 * <Tab
 *   items={[
 *     { key: 'intro', label: '소개' },
 *     { key: 'works', label: '작업물' },
 *   ]}
 *   activeKey={activeTab}
 *   onChange={setActiveTab}
 * />
 * ```
 */
const Tab = React.forwardRef<HTMLDivElement, TabProps>(
  ({ items, activeKey, onChange, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex w-full border-b border-gray-300', className)}>
        {items.map((item) => {
          const isActive = item.key === activeKey

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange?.(item.key)}
              className={cn(
                'flex flex-1 cursor-pointer flex-col items-center pt-3 transition-colors',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none'
              )}
            >
              <span
                className={cn(
                  'pb-2.5 text-sm',
                  isActive ? 'font-semibold text-primary' : 'font-medium text-gray-500'
                )}
              >
                {item.label}
              </span>
              <div
                className={cn(
                  'h-0.5 w-full transition-colors',
                  isActive ? 'bg-primary' : 'bg-transparent'
                )}
              />
            </button>
          )
        })}
      </div>
    )
  }
)
Tab.displayName = 'Tab'

export { Tab }

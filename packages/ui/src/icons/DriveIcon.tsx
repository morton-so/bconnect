/**
 * @figma-todo 드라이브 아이콘 디자인 미정
 */
import type { SVGProps } from 'react'

interface DriveIconProps extends SVGProps<SVGSVGElement> {
  size?: number
  active?: boolean
}

export function DriveIcon({ size = 20, active = false, ...props }: DriveIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.4l2 2h8.6A1.5 1.5 0 0 1 21 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5Z"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
      />
      <path
        d="M3 10.5h18"
        stroke={active ? 'white' : 'currentColor'}
        strokeWidth="1.67"
        strokeLinecap="round"
      />
    </svg>
  )
}

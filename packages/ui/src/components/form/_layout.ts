import { cva } from 'class-variance-authority'

export type FieldLayout = 'stacked' | 'row'

export const fieldItem = cva('', {
  variants: {
    layout: {
      stacked: 'gap-3',
      row: 'min-h-[50px] grid-cols-[70px_1fr] content-center items-center gap-x-3 gap-y-1 border-b border-solid border-[#e5e5e5]',
    },
  },
  defaultVariants: { layout: 'stacked' },
})

export const fieldLabel = cva('', {
  variants: {
    layout: {
      stacked: 'text-m-16 text-gray-900',
      row: 'text-m-14 text-[#7b7b7b]',
    },
  },
  defaultVariants: { layout: 'stacked' },
})

export const fieldSlot = cva('', {
  variants: {
    layout: { stacked: '', row: 'col-start-2' },
  },
  defaultVariants: { layout: 'stacked' },
})

export const ROW_INPUT_CLASSES =
  'h-auto rounded-none border-0 p-0 text-r-14 text-[#1b1b1b] placeholder:text-[#777777] focus:ring-0 aria-invalid:ring-0'

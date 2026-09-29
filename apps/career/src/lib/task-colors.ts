/** 작업(Task) 컬러 시스템 */
const TASK_COLOR_FAMILIES = [
  { bar: 'bg-rose-100 text-rose-600', dot: 'bg-rose-500' },
  { bar: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { bar: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { bar: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { bar: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
] as const

function family(id: number) {
  return TASK_COLOR_FAMILIES[id % TASK_COLOR_FAMILIES.length] ?? TASK_COLOR_FAMILIES[0]
}

export function barColor(id: number): string {
  return family(id).bar
}

export function dotColor(id: number): string {
  return family(id).dot
}

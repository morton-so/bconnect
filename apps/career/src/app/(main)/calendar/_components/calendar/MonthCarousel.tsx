'use client'

import { gridRangeOf, monthShift } from './date-helpers'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@bconnect/ui'
import { useEffect, useState } from 'react'
import { CalendarMonth } from './CalendarMonth'
import type { CalendarBarTask } from './types'

interface MonthCarouselProps {
  month: string
  tasks: CalendarBarTask[]
  selectedDay: string
  onSelectDay: (iso: string) => void
  onMonthChange: (monthIso: string) => void
}

/** 한 슬라이드 = 한 달 */
function MonthSlide({
  month,
  tasks,
  selectedDay,
  onSelectDay,
}: {
  month: string
  tasks: CalendarBarTask[]
  selectedDay: string
  onSelectDay: (iso: string) => void
}) {
  const { start, end } = gridRangeOf(month)
  const monthTasks = tasks.filter((task) => task.start <= end && task.end >= start)
  return (
    <CalendarMonth
      monthIso={month}
      tasks={monthTasks}
      selectedDay={selectedDay}
      onSelectDay={onSelectDay}
    />
  )
}

/** 모바일 좌우 스와이프 이동 */
export function MonthCarousel({
  month,
  tasks,
  selectedDay,
  onSelectDay,
  onMonthChange,
}: MonthCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const months = [monthShift(month, -1), month, monthShift(month, 1)]

  useEffect(() => {
    if (!api) return
    const onSelect = () => {
      const snap = api.selectedScrollSnap()
      if (snap === 1) return
      onMonthChange(monthShift(month, snap - 1))
    }
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api, month, onMonthChange])

  useEffect(() => {
    if (api) api.scrollTo(1, true)
  }, [api, month])

  // 슬라이드 높이 자동 조정
  useEffect(() => {
    if (!api) return
    const setHeight = () => {
      const node = api.slideNodes()[api.selectedScrollSnap()]
      if (node) api.containerNode().style.height = `${node.offsetHeight}px`
    }
    const raf = requestAnimationFrame(setHeight)
    api.on('select', setHeight)
    api.on('reInit', setHeight)
    return () => {
      cancelAnimationFrame(raf)
      api.off('select', setHeight)
      api.off('reInit', setHeight)
    }
  }, [api, month])

  return (
    <Carousel setApi={setApi} opts={{ startIndex: 1, watchDrag: true }} className="w-full">
      <CarouselContent className="ml-0 items-start">
        {months.map((m) => (
          <CarouselItem key={m} className="pl-0">
            <MonthSlide
              month={m}
              tasks={tasks}
              selectedDay={selectedDay}
              onSelectDay={onSelectDay}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

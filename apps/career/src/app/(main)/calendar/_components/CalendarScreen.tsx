'use client'

import { formatPeriod } from '@bconnect/config/date'
import { Button, PlusIcon, TopBar } from '@bconnect/ui'
import { useCalendarParams } from '../_hooks/useCalendarParams'
import { useCalendarTasks } from '../_hooks/useCalendarTasks'
import { CalendarMemberPicker } from './CalendarMemberPicker'
import { CalendarHeader } from './calendar/CalendarHeader'
import { MonthCarousel } from './calendar/MonthCarousel'
import { dayInTask, monthShift } from './calendar/date-helpers'
import { TaskDetailCard } from './detail/TaskDetailCard'

/** 캘린더 오케스트레이터 */
export function CalendarScreen() {
  const { month, day, member, selectDay, setMonth, setMember } = useCalendarParams()
  const { tasks, coworkerTasks, isError, refetch } = useCalendarTasks(member)

  const selectedTasks = tasks.filter((t) => dayInTask(day, t.start, t.end))
  const selectedCoworkerTasks = coworkerTasks.filter((t) => dayInTask(day, t.start, t.end))

  return (
    <div className="bg-white">
      <TopBar
        variant="default"
        showBack={false}
        leftSlot={<CalendarMemberPicker member={member} onChange={setMember} />}
        actionIcon={member == null ? <PlusIcon /> : undefined}
        actionIconLabel="작업 생성"
        actionHref="/calendar/new"
      />
      <CalendarHeader
        monthIso={month}
        onPrev={() => setMonth(monthShift(month, -1))}
        onNext={() => setMonth(monthShift(month, 1))}
      />

      {isError ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <p className="text-m-14 text-gray-400">작업을 불러오지 못했어요</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      ) : (
        <MonthCarousel
          month={month}
          tasks={member == null ? tasks : coworkerTasks}
          selectedDay={day}
          onSelectDay={selectDay}
          onMonthChange={setMonth}
        />
      )}

      {!isError && member == null && selectedTasks.length > 0 && (
        <div className="mt-2 divide-y divide-gray-100 border-t border-gray-100">
          {selectedTasks.map((t) => (
            <TaskDetailCard key={t.id} task={t} selectedDay={day} selectedMonth={month} />
          ))}
        </div>
      )}

      {!isError && member != null && selectedCoworkerTasks.length > 0 && (
        <div className="mt-2 divide-y divide-gray-100 border-t border-gray-100">
          {selectedCoworkerTasks.map((t) => (
            <div key={t.id} className="px-4 pt-5 pb-6">
              <h2 className="text-sb-16 text-gray-900">{t.title}</h2>
              <p className="mt-3 text-m-14 text-gray-900">{formatPeriod(t.start, t.end)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

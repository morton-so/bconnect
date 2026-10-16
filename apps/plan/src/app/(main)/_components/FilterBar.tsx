'use client'

import { Select, FilterChip, RefreshIcon } from '@bconnect/ui'
import {
  Trade,
  TRADE_LIST,
  TRADE_LABELS,
  REGION_LIST,
  REGION_LABELS,
  ROLE_LABELS,
  WORKER_ROLE,
  type Region,
  type WorkerRole,
} from '@bconnect/api-client'
import { EXPERIENCE_OPTIONS, EXPERIENCE_LABELS } from '@/lib/experience'
import { useFilterParams } from '@/hooks/useFilterParams'
import type { ExperienceLevel } from '@/lib/experience'
import { TaskSelectBar } from './TaskSelectBar'

function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="필터 초기화"
      className="flex h-[27px] w-[27px] items-center justify-center rounded-full hover:bg-gray-100"
    >
      <RefreshIcon size={18} className="text-gray-500" />
    </button>
  )
}

export function FilterBar() {
  const {
    trades,
    experience,
    roles,
    regions,
    setTrade,
    setExperience,
    setRole,
    setRegion,
    toggleTrade,
    toggleRole,
    toggleRegion,
    clearFilter,
  } = useFilterParams()

  const hasFilter = trades.length > 0 || !!experience || roles.length > 0 || regions.length > 0

  return (
    <div className="flex flex-col gap-[13px]">
      <TaskSelectBar />

      <div className="flex items-center gap-[9px]">
        <Select
          multiple
          clearable
          triggerLabel="지역"
          value={regions}
          onChange={(v) => setRegion(v as Region[])}
          options={REGION_LIST}
        />
        <Select
          multiple
          clearable
          triggerLabel="공종"
          value={trades}
          onChange={(v) => setTrade(v as Trade[])}
          options={TRADE_LIST}
        />
        <Select
          multiple
          clearable
          triggerLabel="직급"
          value={roles}
          onChange={(v) => setRole(v as WorkerRole[])}
          options={WORKER_ROLE.map((value) => ({ value, label: ROLE_LABELS[value] }))}
        />
        <Select
          clearable
          triggerLabel="경력"
          value={experience ?? ''}
          onChange={(v) =>
            setExperience(typeof v === 'string' && v ? (v as ExperienceLevel) : null)
          }
          options={EXPERIENCE_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
        />
      </div>

      {hasFilter && (
        <div className="flex flex-wrap items-center gap-[7px]">
          {regions.map((r) => (
            <FilterChip key={r} label={REGION_LABELS[r]} onRemove={() => toggleRegion(r)} />
          ))}
          {trades.map((t) => (
            <FilterChip key={t} label={TRADE_LABELS[t]} onRemove={() => toggleTrade(t)} />
          ))}
          {roles.map((r) => (
            <FilterChip key={r} label={ROLE_LABELS[r]} onRemove={() => toggleRole(r)} />
          ))}
          {experience && (
            <FilterChip
              label={EXPERIENCE_LABELS[experience]}
              onRemove={() => setExperience(null)}
            />
          )}
          <RefreshButton onClick={clearFilter} />
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'

type Props = {
  fechasSeleccionadas: string[]
  onChange: (fechas: string[]) => void
  fechaMinima?: string
}

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
}

const weekDays = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getMonthLabel(date: Date) {
  const label = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(date)

  return label.charAt(0).toUpperCase() + label.slice(1)
}

function getCompactDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function getDaysInMonth(currentDate: Date): CalendarDay[] {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstWeekdayOffset = (firstDayOfMonth.getDay() + 6) % 7
  const days: CalendarDay[] = []

  for (let index = firstWeekdayOffset; index > 0; index -= 1) {
    days.push({
      date: new Date(year, month, 1 - index),
      isCurrentMonth: false,
    })
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day += 1) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    })
  }

  const remainingCells = days.length % 7 === 0 ? 0 : 7 - (days.length % 7)

  for (let day = 1; day <= remainingCells; day += 1) {
    days.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
    })
  }

  return days
}

export function SelectorFechas({ fechasSeleccionadas, onChange, fechaMinima }: Props) {
  const minDate = fechaMinima ?? toDateKey(new Date())
  const [currentDate, setCurrentDate] = useState(() => new Date(`${minDate}T00:00:00`))
  const selectedSet = new Set(fechasSeleccionadas)
  const sortedDates = [...fechasSeleccionadas].sort()

  function toggleDate(dateKey: string) {
    if (selectedSet.has(dateKey)) {
      onChange(sortedDates.filter((fecha) => fecha !== dateKey))
      return
    }

    onChange([...sortedDates, dateKey].sort())
  }

  function removeDate(dateKey: string) {
    onChange(sortedDates.filter((fecha) => fecha !== dateKey))
  }

  return (
    <section className="rounded-xl border border-[#242424] bg-[#0a0a0a] p-4">
      <div className="mb-4 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <button
          aria-label="Mes anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-xl text-white"
          onClick={() => setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
          type="button"
        >
          ‹
        </button>
        <h3 className="text-center text-sm font-bold text-white">{getMonthLabel(currentDate)}</h3>
        <button
          aria-label="Mes siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-xl text-white"
          onClick={() => setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
          type="button"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div className="py-1 text-center text-[11px] font-bold text-[#9ca3af]" key={day}>
            {day}
          </div>
        ))}

        {getDaysInMonth(currentDate).map((calendarDay) => {
          const dateKey = toDateKey(calendarDay.date)
          const isPast = dateKey < minDate
          const isDisabled = !calendarDay.isCurrentMonth || isPast
          const isSelected = selectedSet.has(dateKey)

          return (
            <button
              className={`min-h-9 rounded-lg border text-sm font-bold transition ${
                isSelected
                  ? 'border-[#f5c518] bg-[#f5c518] text-black'
                  : 'border-[#242424] bg-[#111111] text-white hover:border-[#f5c518]/70'
              } ${isDisabled ? 'cursor-default opacity-30 hover:border-[#242424]' : ''}`}
              disabled={isDisabled}
              key={dateKey}
              onClick={() => toggleDate(dateKey)}
              type="button"
            >
              {calendarDay.date.getDate()}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {sortedDates.length === 0 ? (
          <p className="text-sm text-[#a0a0a0]">Selecciona las fechas en el calendario</p>
        ) : (
          sortedDates.map((dateKey) => (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c518]/40 bg-[#1a1700] px-3 py-1 text-xs font-bold text-[#f5c518]" key={dateKey}>
              {getCompactDateLabel(dateKey)}
              <button className="text-[#f5c518] hover:text-white" onClick={() => removeDate(dateKey)} type="button">
                x
              </button>
            </span>
          ))
        )}
      </div>
    </section>
  )
}

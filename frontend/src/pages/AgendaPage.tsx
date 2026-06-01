import { useState } from 'react'
import { useTurnos } from '../features/agenda/hooks/useTurnos'

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
}

const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return toDateKey(firstDate) === toDateKey(secondDate)
}

function getMonthLabel(date: Date) {
  const label = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(date)

  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function AgendaPage() {
  const { turnos, loading, error } = useTurnos()
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  void turnos
  void loading
  void error

  function prevMonth() {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))
  }

  function getDaysInMonth(): CalendarDay[] {
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

  const today = new Date()
  const days = getDaysInMonth()
  const monthLabel = getMonthLabel(currentDate)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="hidden text-[11px] uppercase tracking-widest text-[#a0a0a0] md:block">SECCIÓN PRINCIPAL</p>
          <h1 className="text-[42px] font-black leading-none text-white md:mt-2 md:text-[32px] md:font-bold">Agenda</h1>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:items-center">
          <button className="min-w-[180px] rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-2 text-left text-sm text-white sm:w-auto">
            <span className="flex items-center justify-between gap-4">
              Seleccionar Barbero <span>▼</span>
            </span>
          </button>
          <button className="min-w-[180px] rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-2 text-left text-sm text-white sm:w-auto">
            <span className="flex items-center justify-between gap-4">
              Seleccionar Sucursal <span>▼</span>
            </span>
          </button>
          <button className="rounded-lg bg-[#f5c518] px-4 py-2 font-bold text-black transition hover:bg-[#f5c518]/90 sm:w-auto">
            + Nuevo Turno
          </button>
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-[#1f2937] bg-[#111827] p-3 md:p-4">
        <div className="mx-auto mb-5 grid max-w-xl grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.5rem] border border-[#2a2a4a] bg-[#1a1a2e] p-2 md:max-w-none md:border-0 md:bg-transparent md:p-0">
          <button
            aria-label="Mes anterior"
            className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#1f2937] text-4xl leading-none text-white md:h-8 md:w-8 md:rounded-full md:text-2xl"
            onClick={prevMonth}
            type="button"
          >
            ‹
          </button>
          <h2 className="text-center text-2xl font-black text-white md:text-xl md:font-bold">{monthLabel}</h2>
          <button
            aria-label="Mes siguiente"
            className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#1f2937] text-4xl leading-none text-white md:h-8 md:w-8 md:rounded-full md:text-2xl"
            onClick={nextMonth}
            type="button"
          >
            ›
          </button>
        </div>

        <div className="mb-5 flex justify-center gap-3 md:hidden">
          <div className="flex items-center gap-2 rounded-xl border border-[#2a2a4a] bg-[#0a0a0a] px-4 py-2 text-sm font-bold text-white">
            <span className="h-4 w-4 rounded-full bg-white" />
            Hoy
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#2a2a4a] bg-[#0a0a0a] px-4 py-2 text-sm font-bold text-white">
            <span className="h-4 w-4 rounded-full bg-[#f5c518]" />
            Con turnos
          </div>
        </div>

        <div className="overflow-visible md:overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 md:min-w-[720px]">
            {weekDays.map((day) => (
              <div
                className="border-[#374151] py-2 text-center text-sm font-black text-[#9ca3af] md:rounded-lg md:border md:bg-[#1f2937] md:py-3 md:font-medium"
                key={day}
              >
                {day}
              </div>
            ))}

            {days.map((calendarDay) => {
              const dateKey = toDateKey(calendarDay.date)
              const isToday = isSameDay(calendarDay.date, today)
              const isSelected = selectedDate === dateKey
              const isHighlighted = calendarDay.isCurrentMonth && (isToday || isSelected)

              return (
                <button
                  className={`relative flex min-h-[112px] items-center justify-center rounded-2xl border bg-[#111827] p-1 text-center align-top transition md:block md:min-h-[80px] md:rounded-lg md:p-2 md:text-left ${
                    calendarDay.isCurrentMonth ? 'cursor-pointer hover:border-[#f5c518]/50' : 'cursor-default'
                  } ${isHighlighted ? 'border-[#f5c518] bg-[#1a1700]' : 'border-[#263244]'} ${
                    isSelected ? 'border-2' : ''
                  }`}
                  disabled={!calendarDay.isCurrentMonth}
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  type="button"
                >
                  <span
                    className={`block text-3xl font-black md:text-sm md:font-normal ${
                      calendarDay.isCurrentMonth
                        ? isHighlighted
                          ? 'text-[#f5c518]'
                          : 'text-[#9ca3af]'
                        : 'text-[#374151]'
                    }`}
                  >
                    {calendarDay.date.getDate()}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

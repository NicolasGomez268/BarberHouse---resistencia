import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useTurnos } from '../features/agenda/hooks/useTurnos'
import { getAvailableSlots } from '../features/agenda/lib/appointments'
import { MOCK_BARBEROS, MOCK_HORARIOS, MOCK_SERVICIOS } from '../mocks'
import type { MetodoPagoMock, Turno } from '../types'

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
}

const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

type TurnoForm = {
  barberoId: string
  servicioId: string
  clienteNombre: string
  clienteTelefono: string
  fecha: string
  hora: string
}

type TurnosListMode = 'selected-day' | 'upcoming' | 'today' | 'past' | 'cancelled' | 'no-show'

const turnosListModes: Array<{ id: TurnosListMode; label: string }> = [
  { id: 'selected-day', label: 'Día seleccionado' },
  { id: 'upcoming', label: 'Próximos' },
  { id: 'today', label: 'Hoy' },
  { id: 'past', label: 'Pasados' },
  { id: 'cancelled', label: 'Cancelados' },
  { id: 'no-show', label: 'No asistió' },
]

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

function getTurnoTimestamp(turno: Turno) {
  return new Date(`${turno.fecha ?? '1970-01-01'}T${turno.hora ?? '00:00'}:00`).getTime()
}

function isCancelledTurno(turno: Turno) {
  return turno.estado === 'CANCELADO' || turno.estado === 'cancelado'
}

function isNoShowTurno(turno: Turno) {
  return turno.estado === 'NO_ASISTIO'
}

function isHistoricalTurno(turno: Turno, now: Date) {
  return getTurnoTimestamp(turno) < now.getTime()
}

export function AgendaPage() {
  const { turnos, loading, error, crearTurno, marcarRealizado, cancelarTurno, marcarNoAsistio } = useTurnos()
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedBarberId, setSelectedBarberId] = useState('')
  const [selectedSucursalId, setSelectedSucursalId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [turnosListMode, setTurnosListMode] = useState<TurnosListMode>('selected-day')
  const [turnosPage, setTurnosPage] = useState(1)
  const [isTurnoModalOpen, setIsTurnoModalOpen] = useState(false)
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [paymentTurno, setPaymentTurno] = useState<Turno | null>(null)
  const [cancelingTurno, setCancelingTurno] = useState<Turno | null>(null)
  const [turnoFormError, setTurnoFormError] = useState<string | null>(null)
  const [turnoForm, setTurnoForm] = useState<TurnoForm>({
    barberoId: MOCK_BARBEROS[0]?.id ?? '',
    servicioId: MOCK_SERVICIOS[0]?.id ?? '',
    clienteNombre: '',
    clienteTelefono: '',
    fecha: toDateKey(new Date()),
    hora: '09:00',
  })

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
  const todayKey = toDateKey(today)
  const days = getDaysInMonth()
  const monthLabel = getMonthLabel(currentDate)
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredTurnos = turnos.filter((turno) => {
    const matchesBarber = !selectedBarberId || turno.barberoId === selectedBarberId
    const matchesSucursal = !selectedSucursalId || turno.sucursalId === selectedSucursalId
    const searchableClient = `${turno.clienteNombre ?? ''} ${turno.clienteTelefono ?? ''}`.toLowerCase()
    const matchesSearch = !normalizedSearch || searchableClient.includes(normalizedSearch)
    return matchesBarber && matchesSucursal && matchesSearch
  })
  const displayedTurnos = filteredTurnos
    .filter((turno) => {
      if (turnosListMode === 'selected-day') return selectedDate ? turno.fecha === selectedDate : turno.fecha === todayKey
      if (turnosListMode === 'upcoming') return !isCancelledTurno(turno) && !isNoShowTurno(turno) && !isHistoricalTurno(turno, today)
      if (turnosListMode === 'today') return turno.fecha === todayKey
      if (turnosListMode === 'past') return !isCancelledTurno(turno) && !isNoShowTurno(turno) && isHistoricalTurno(turno, today)
      if (turnosListMode === 'cancelled') return isCancelledTurno(turno)
      return isNoShowTurno(turno)
    })
    .sort((first, second) => getTurnoTimestamp(first) - getTurnoTimestamp(second))
  const turnosPerPage = 25
  const totalTurnosPages = Math.max(1, Math.ceil(displayedTurnos.length / turnosPerPage))
  const paginatedTurnos = displayedTurnos.slice((turnosPage - 1) * turnosPerPage, turnosPage * turnosPerPage)
  const listTitle = (() => {
    if (turnosListMode === 'selected-day') return `Turnos del ${selectedDate ?? todayKey}`
    if (turnosListMode === 'upcoming') return 'Turnos próximos'
    if (turnosListMode === 'today') return `Turnos de hoy ${todayKey}`
    if (turnosListMode === 'past') return 'Historial de turnos pasados'
    if (turnosListMode === 'cancelled') return 'Turnos cancelados'
    return 'Turnos con no asistencia'
  })()
  const selectedService = MOCK_SERVICIOS.find((servicio) => servicio.id === turnoForm.servicioId)
  const availableSlots = useMemo(() => {
    if (!turnoForm.barberoId || !turnoForm.fecha || !selectedService) return []

    return getAvailableSlots({
      barberId: turnoForm.barberoId,
      date: turnoForm.fecha,
      serviceDuration: selectedService.duracionMinutos,
      turnos,
      barberos: MOCK_BARBEROS,
      servicios: MOCK_SERVICIOS,
      horarios: MOCK_HORARIOS,
    })
  }, [selectedService, turnoForm.barberoId, turnoForm.fecha, turnos])

  useEffect(() => {
    if (!isTurnoModalOpen) return

    const currentSlotStillAvailable = availableSlots.some((slot) => slot.start === turnoForm.hora)
    if (currentSlotStillAvailable) return

    setTurnoForm((current) => ({
      ...current,
      hora: availableSlots[0]?.start ?? '',
    }))
  }, [availableSlots, isTurnoModalOpen, turnoForm.hora])

  function getTurnosForDate(dateKey: string) {
    return filteredTurnos.filter((turno) => turno.fecha === dateKey)
  }

  function handleNewTurno(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTurnoFormError(null)

    try {
      crearTurno({
        clientId: `cliente-${Date.now()}`,
        barberId: turnoForm.barberoId,
        serviceId: turnoForm.servicioId,
        date: turnoForm.fecha,
        startTime: turnoForm.hora,
        clienteNombre: turnoForm.clienteNombre,
        clienteTelefono: turnoForm.clienteTelefono || undefined,
      })
      setSelectedDate(turnoForm.fecha)
      setTurnosPage(1)
      setIsTurnoModalOpen(false)
      setTurnoForm((current) => ({ ...current, clienteNombre: '', clienteTelefono: '' }))
    } catch (appointmentError) {
      setTurnoFormError(appointmentError instanceof Error ? appointmentError.message : 'No se pudo crear el turno.')
    }
  }

  function getServiceName(turno: Turno) {
    return MOCK_SERVICIOS.find((servicio) => servicio.id === turno.servicioId)?.nombre ?? turno.servicioId
  }

  function getBarberName(turno: Turno) {
    return MOCK_BARBEROS.find((barbero) => barbero.id === turno.barberoId)?.nombre ?? turno.barberoId ?? 'Sin barbero'
  }

  function getWhatsAppUrl(turno: Turno, message: string) {
    const phone = turno.clienteTelefono?.replace(/\D/g, '') ?? ''
    const encodedMessage = encodeURIComponent(message)
    return phone ? `https://wa.me/${phone}?text=${encodedMessage}` : `https://wa.me/?text=${encodedMessage}`
  }

  function getReminderMessage(turno: Turno) {
    return `Hola ${turno.clienteNombre ?? ''}, te recordamos tu turno en BarberHouse para el ${turno.fecha ?? selectedDate ?? ''} a las ${turno.hora ?? ''}. Servicio: ${getServiceName(turno)} con ${getBarberName(turno)}. Te esperamos.`
  }

  function getCancelMessage(turno: Turno) {
    return `Hola ${turno.clienteNombre ?? ''}, te avisamos que tu turno en BarberHouse del ${turno.fecha ?? selectedDate ?? ''} a las ${turno.hora ?? ''} fue cancelado. Disculpa las molestias.`
  }

  function markAsPaid(turno: Turno, metodoPago: MetodoPagoMock) {
    marcarRealizado(turno.id, metodoPago)
    setPaymentTurno(null)
    setSelectedTurno(null)
  }

  function markAsNoShow(turno: Turno) {
    marcarNoAsistio(turno.id)
    setPaymentTurno(null)
    setSelectedTurno(null)
  }

  function cancelAppointment(turno: Turno) {
    cancelarTurno(turno.id)
    setCancelingTurno(null)
    setSelectedTurno(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header>
        <div>
          <p className="hidden text-[11px] uppercase tracking-widest text-[#a0a0a0] md:block">SECCIÓN PRINCIPAL</p>
          <h1 className="text-[42px] font-black leading-none text-white md:mt-2 md:text-[32px] md:font-bold">Agenda</h1>
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
              const dayTurnos = getTurnosForDate(dateKey)

              return (
                <button
                  className={`relative flex min-h-[112px] items-center justify-center rounded-2xl border bg-[#111827] p-1 text-center align-top transition md:block md:min-h-[80px] md:rounded-lg md:p-2 md:text-left ${
                    calendarDay.isCurrentMonth ? 'cursor-pointer hover:border-[#f5c518]/50' : 'cursor-default'
                  } ${isHighlighted ? 'border-[#f5c518] bg-[#1a1700]' : 'border-[#263244]'} ${
                    isSelected ? 'border-2' : ''
                  }`}
                  disabled={!calendarDay.isCurrentMonth}
                  key={dateKey}
                  onClick={() => {
                    setSelectedDate(dateKey)
                    setTurnosPage(1)
                  }}
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
                  {calendarDay.isCurrentMonth && dayTurnos.length > 0 ? (
                    <span className="absolute right-2 top-2 rounded-full bg-[#f5c518] px-2 py-0.5 text-xs font-bold text-black">
                      {dayTurnos.length}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-[#1f2937] bg-[#111827] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <select
              className="min-w-[180px] rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-2 text-left text-sm text-white"
              onChange={(event) => {
                setSelectedBarberId(event.target.value)
                setTurnosPage(1)
              }}
              value={selectedBarberId}
            >
              <option value="">Seleccionar Barbero</option>
              {MOCK_BARBEROS.map((barbero) => (
                <option key={barbero.id} value={barbero.id}>{barbero.nombre}</option>
              ))}
            </select>
            <select
              className="min-w-[180px] rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-2 text-left text-sm text-white"
              onChange={(event) => {
                setSelectedSucursalId(event.target.value)
                setTurnosPage(1)
              }}
              value={selectedSucursalId}
            >
              <option value="">Seleccionar Sucursal</option>
              <option value="s1">Sucursal 1</option>
              <option value="s2">Sucursal 2</option>
            </select>
            <button
              className="rounded-lg bg-[#f5c518] px-4 py-2 font-bold text-black transition hover:bg-[#f5c518]/90"
              onClick={() => {
                setTurnoFormError(null)
                setTurnoForm((current) => ({ ...current, fecha: selectedDate ?? toDateKey(today) }))
                setIsTurnoModalOpen(true)
              }}
              type="button"
            >
              + Nuevo Turno
            </button>
          </div>

          <label className="flex-1">
            <span className="sr-only">Buscar cliente</span>
            <input
              className="w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-2 text-sm text-white outline-none placeholder:text-[#a0a0a0] focus:border-[#f5c518]"
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setTurnosPage(1)
              }}
              placeholder="Buscar cliente por nombre o teléfono..."
              type="search"
              value={searchTerm}
            />
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#1f2937] bg-[#111827] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-bold">{listTitle}</h2>
              <p className="mt-1 text-sm text-[#a0a0a0]">
                {displayedTurnos.length} turno{displayedTurnos.length === 1 ? '' : 's'} encontrados
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {turnosListModes.map((mode) => (
                <button
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                    turnosListMode === mode.id
                      ? 'border-[#f5c518] bg-[#1a1700] text-[#f5c518]'
                      : 'border-[#263244] bg-[#1f2937] text-[#a0a0a0] hover:border-[#475569] hover:text-white'
                  }`}
                  key={mode.id}
                  onClick={() => {
                    setTurnosListMode(mode.id)
                    setTurnosPage(1)
                  }}
                  type="button"
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? <p className="mt-4 text-[#a0a0a0]">Cargando turnos...</p> : null}
          {error ? <p className="mt-4 text-red-300">{error}</p> : null}
          {!loading && displayedTurnos.length === 0 ? (
            <p className="mt-4 text-[#a0a0a0]">No hay turnos para este filtro.</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            {paginatedTurnos.map((turno) => (
              <button
                className="inline-flex w-fit items-center rounded-lg border border-[#263244] bg-[#1f2937] px-4 py-3 text-left font-bold text-white transition hover:border-[#f5c518]/60 hover:bg-[#263244]"
                key={turno.id}
                onClick={() => setSelectedTurno(turno)}
                type="button"
              >
                <span>{turno.hora} · {turno.clienteNombre}</span>
              </button>
            ))}
          </div>
          {displayedTurnos.length > turnosPerPage ? (
            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[#a0a0a0]">
              <span>Página {turnosPage} de {totalTurnosPages}</span>
              <div className="flex gap-2">
                <button
                  className="rounded-lg bg-[#1f2937] px-3 py-2 text-white disabled:opacity-40"
                  disabled={turnosPage === 1}
                  onClick={() => setTurnosPage((page) => Math.max(1, page - 1))}
                  type="button"
                >
                  Anterior
                </button>
                <button
                  className="rounded-lg bg-[#1f2937] px-3 py-2 text-white disabled:opacity-40"
                  disabled={turnosPage === totalTurnosPages}
                  onClick={() => setTurnosPage((page) => Math.min(totalTurnosPages, page + 1))}
                  type="button"
                >
                  Siguiente
                </button>
              </div>
            </div>
          ) : null}
        </section>

      {selectedTurno ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <section className="w-full max-w-lg rounded-xl border border-[#334155] bg-[#111827] text-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#263244] px-6 py-5">
              <div>
                <p className="text-sm font-bold text-[#f5c518]">
                  {selectedTurno.hora}{selectedTurno.horaFin ? ` - ${selectedTurno.horaFin}` : ''}
                </p>
                <h2 className="mt-1 text-2xl font-bold">{selectedTurno.clienteNombre}</h2>
              </div>
              <button
                aria-label="Cerrar detalle del turno"
                className="text-3xl leading-none text-[#a0a0a0] hover:text-white"
                onClick={() => setSelectedTurno(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 px-6 py-5 text-sm">
              <div className="rounded-lg bg-[#1f2937] px-4 py-3">
                <span className="block text-[#a0a0a0]">Servicio</span>
                <strong className="mt-1 block text-white">{getServiceName(selectedTurno)}</strong>
              </div>
              <div className="rounded-lg bg-[#1f2937] px-4 py-3">
                <span className="block text-[#a0a0a0]">Barbero</span>
                <strong className="mt-1 block text-white">{getBarberName(selectedTurno)}</strong>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[#1f2937] px-4 py-3">
                  <span className="block text-[#a0a0a0]">Fecha</span>
                  <strong className="mt-1 block text-white">{selectedTurno.fecha ?? selectedDate}</strong>
                </div>
                <div className="rounded-lg bg-[#1f2937] px-4 py-3">
                  <span className="block text-[#a0a0a0]">Estado</span>
                  <strong className="mt-1 block text-white">{selectedTurno.estado}</strong>
                </div>
              </div>
              <div className="rounded-lg bg-[#1f2937] px-4 py-3">
                <span className="block text-[#a0a0a0]">Teléfono</span>
                <strong className="mt-1 block text-white">{selectedTurno.clienteTelefono ?? 'Sin teléfono cargado'}</strong>
              </div>
            </div>

            <div className="grid gap-3 border-t border-[#263244] px-6 py-5 sm:grid-cols-3">
              <a
                className="rounded-lg border border-[#3f4c2a] bg-[#202713] px-4 py-3 text-center text-sm font-bold text-[#f5c518] transition hover:border-[#f5c518]"
                href={getWhatsAppUrl(selectedTurno, getReminderMessage(selectedTurno))}
                rel="noreferrer"
                target="_blank"
              >
                Recordar
              </a>
              <button
                className="rounded-lg border border-[#22543d] bg-[#123524] px-4 py-3 text-sm font-bold text-[#86efac] transition hover:border-[#22c55e]"
                onClick={() => setPaymentTurno(selectedTurno)}
                type="button"
              >
                Asistió
              </button>
              <button
                className="rounded-lg border border-[#5f2d2d] bg-[#2a1618] px-4 py-3 text-sm font-bold text-[#fca5a5] transition hover:border-[#ef4444]"
                onClick={() => setCancelingTurno(selectedTurno)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {paymentTurno ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <section className="w-full max-w-md rounded-xl border border-[#334155] bg-[#111827] p-6 text-white shadow-2xl">
            <h2 className="text-2xl font-bold">Método de pago</h2>
            <p className="mt-2 text-sm text-[#a0a0a0]">
              Seleccioná cómo pagó {paymentTurno.clienteNombre} o marcá que no asistió.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-lg bg-[#f5c518] px-4 py-3 font-bold text-black transition hover:bg-[#f5c518]/90"
                onClick={() => markAsPaid(paymentTurno, 'EFECTIVO')}
                type="button"
              >
                Efectivo
              </button>
              <button
                className="rounded-lg border border-[#334155] bg-[#1f2937] px-4 py-3 font-bold text-white transition hover:border-[#f5c518]"
                onClick={() => markAsPaid(paymentTurno, 'TRANSFERENCIA')}
                type="button"
              >
                Transferencia
              </button>
            </div>
            <button
              className="mt-3 w-full rounded-lg border border-[#5f2d2d] bg-[#2a1618] px-4 py-3 font-bold text-[#fca5a5] transition hover:border-[#ef4444]"
              onClick={() => markAsNoShow(paymentTurno)}
              type="button"
            >
              No asistió
            </button>
            <button
              className="mt-3 w-full rounded-lg bg-[#475569] px-4 py-3 text-white transition hover:bg-[#64748b]"
              onClick={() => setPaymentTurno(null)}
              type="button"
            >
              Volver
            </button>
          </section>
        </div>
      ) : null}

      {cancelingTurno ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <section className="w-full max-w-md rounded-xl border border-[#334155] bg-[#111827] p-6 text-white shadow-2xl">
            <h2 className="text-2xl font-bold">Cancelar turno</h2>
            <p className="mt-2 text-sm text-[#a0a0a0]">
              Podés avisarle al cliente por WhatsApp antes de cancelar el turno.
            </p>
            <div className="mt-6 grid gap-3">
              <a
                className="rounded-lg border border-[#3f4c2a] bg-[#202713] px-4 py-3 text-center font-bold text-[#f5c518] transition hover:border-[#f5c518]"
                href={getWhatsAppUrl(cancelingTurno, getCancelMessage(cancelingTurno))}
                onClick={() => cancelAppointment(cancelingTurno)}
                rel="noreferrer"
                target="_blank"
              >
                Avisar por WhatsApp y cancelar
              </a>
              <button
                className="rounded-lg bg-[#2a1618] px-4 py-3 font-bold text-[#fca5a5] transition hover:bg-[#351c1f]"
                onClick={() => cancelAppointment(cancelingTurno)}
                type="button"
              >
                Cancelar sin avisar
              </button>
              <button
                className="rounded-lg bg-[#475569] px-4 py-3 text-white transition hover:bg-[#64748b]"
                onClick={() => setCancelingTurno(null)}
                type="button"
              >
                Volver
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isTurnoModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl border border-[#334155] bg-[#111827] text-white shadow-2xl" onSubmit={handleNewTurno}>
            <div className="border-b border-[#263244] px-6 py-5">
              <h2 className="text-2xl font-bold">Nuevo Turno</h2>
              <p className="mt-1 text-sm text-[#a0a0a0]">Elegí barbero, fecha y servicio para ver horarios disponibles.</p>
            </div>
            <div className="max-h-[68vh] space-y-4 overflow-y-auto px-6 py-5">
              <input
                className="w-full rounded-lg border border-[#475569] bg-[#1f2937] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, clienteNombre: event.target.value }))}
                placeholder="Nombre del cliente"
                required
                value={turnoForm.clienteNombre}
              />
              <input
                className="w-full rounded-lg border border-[#475569] bg-[#1f2937] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, clienteTelefono: event.target.value }))}
                placeholder="Teléfono"
                value={turnoForm.clienteTelefono}
              />
              <input
                className="w-full rounded-lg border border-[#475569] bg-[#1f2937] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, fecha: event.target.value }))}
                type="date"
                value={turnoForm.fecha}
              />
              <select
                className="w-full rounded-lg border border-[#475569] bg-[#1f2937] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, barberoId: event.target.value }))}
                value={turnoForm.barberoId}
              >
                {MOCK_BARBEROS.map((barbero) => (
                  <option key={barbero.id} value={barbero.id}>{barbero.nombre}</option>
                ))}
              </select>
              <select
                className="w-full rounded-lg border border-[#475569] bg-[#1f2937] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, servicioId: event.target.value }))}
                value={turnoForm.servicioId}
              >
                {MOCK_SERVICIOS.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                ))}
              </select>
              <section className="rounded-xl border border-[#263244] bg-[#0f172a] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">Horarios disponibles</h3>
                    <p className="mt-1 text-sm text-[#a0a0a0]">
                      {availableSlots.length > 0
                        ? `${availableSlots.length} opciones para este servicio`
                        : 'No hay opciones para esta combinación'}
                    </p>
                  </div>
                  {turnoForm.hora ? (
                    <span className="rounded-full bg-[#f5c518] px-3 py-1 text-xs font-bold text-black">
                      {turnoForm.hora}
                    </span>
                  ) : null}
                </div>

                {availableSlots.length === 0 ? (
                  <p className="mt-4 rounded-lg border border-[#334155] bg-[#1f2937] px-4 py-3 text-sm text-[#a0a0a0]">
                    Cambiá la fecha, el barbero o el servicio para buscar otro espacio.
                  </p>
                ) : (
                  <div className="mt-4 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                    {availableSlots.map((slot) => {
                      const isSelectedSlot = turnoForm.hora === slot.start

                      return (
                        <button
                          className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
                            isSelectedSlot
                              ? 'border-[#f5c518] bg-[#1a1700] text-[#f5c518]'
                              : 'border-[#334155] bg-[#1f2937] text-white hover:border-[#f5c518]/70'
                          }`}
                          key={`${slot.start}-${slot.end}`}
                          onClick={() => setTurnoForm((current) => ({ ...current, hora: slot.start }))}
                          type="button"
                        >
                          <span className="block">{slot.start}</span>
                          <span className="mt-1 block text-xs font-medium text-[#a0a0a0]">hasta {slot.end}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>
              <p className="rounded-lg bg-[#1f2937] px-4 py-3 text-sm text-[#a0a0a0]">
                {selectedService
                  ? `Duración del servicio: ${selectedService.duracionMinutos} minutos. Los horarios se recalculan según la agenda real del barbero.`
                  : 'Seleccioná un servicio para ver los horarios disponibles.'}
              </p>
              {turnoFormError ? <p className="text-sm font-bold text-red-300">{turnoFormError}</p> : null}
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-[#263244] bg-[#0f172a] px-6 py-5">
              <button
                className="rounded-lg bg-[#475569] px-4 py-3"
                onClick={() => {
                  setTurnoFormError(null)
                  setIsTurnoModalOpen(false)
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-[#f5c518] px-4 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                disabled={availableSlots.length === 0 || !turnoForm.hora}
                type="submit"
              >
                Crear Turno
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

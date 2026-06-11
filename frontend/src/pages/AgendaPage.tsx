import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ModalConfirmarEliminar } from '../features/agenda/components/ModalConfirmarEliminar'
import { ModalEditarTurnoFijo } from '../features/agenda/components/ModalEditarTurnoFijo'
import { ModalNuevoTurnoFijo } from '../features/agenda/components/ModalNuevoTurnoFijo'
import { useTurnos } from '../features/agenda/hooks/useTurnos'
import { getAvailableSlots } from '../features/agenda/lib/appointments'
import { useEquipo } from '../features/equipo/hooks/useEquipo'
import { useServicios } from '../features/servicios/hooks/useServicios'
import { useAuth } from '../shared/hooks/useAuth'
import type { MetodoPago, SucursalId, Turno, TurnoFijo } from '../types'

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
}

const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

type TurnoForm = {
  sucursalId: string
  barberoId: string
  servicioId: string
  clienteNombre: string
  clienteTelefono: string
  fecha: string
  hora: string
}

type ReemplazoFijoForm = {
  clienteNombre: string
  clienteTelefono: string
  servicioId: string
  metodoPago: '' | MetodoPago
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

function isAusenteFijoTurno(turno: Turno) {
  return turno.estado === 'AUSENTE_FIJO'
}

function isHistoricalTurno(turno: Turno, now: Date) {
  return getTurnoTimestamp(turno) < now.getTime()
}

export function AgendaPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const { servicios } = useServicios()
  const serviciosActivos = servicios.filter((s) => s.activo ?? true)
  const { barberos, horarios } = useEquipo()
  const [selectedSucursalId, setSelectedSucursalId] = useState<SucursalId | ''>('')
  const {
    turnos,
    turnosFijos,
    loading,
    error,
    crearTurno,
    crearTurnoFijo,
    marcarRealizado,
    cancelarTurno,
    marcarNoAsistio,
    marcarAusenteFijo,
    liberarTurnoFijo,
    generarProximoTurnoFijo,
    editarTurnoFijo,
    editarTurno,
    eliminarTurnoFijo,
  } = useTurnos(servicios, selectedSucursalId || undefined)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedBarberId, setSelectedBarberId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [turnosListMode, setTurnosListMode] = useState<TurnosListMode>('selected-day')
  const [turnosPage, setTurnosPage] = useState(1)
  const [isTurnoModalOpen, setIsTurnoModalOpen] = useState(false)
  const [isTurnoFijoModalOpen, setIsTurnoFijoModalOpen] = useState(false)
  const [turnoFijoError, setTurnoFijoError] = useState<string | null>(null)
  const [showModalEditar, setShowModalEditar] = useState(false)
  const [showConfirmarEliminar, setShowConfirmarEliminar] = useState(false)
  const [showTurnosFijos, setShowTurnosFijos] = useState(false)
  const [searchFijos, setSearchFijos] = useState('')
  const [fijosPagina, setFijosPagina] = useState(1)
  const FIJOS_POR_PAGINA = 10
  const [turnoFijoSeleccionado, setTurnoFijoSeleccionado] = useState<TurnoFijo | null>(null)
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [paymentTurno, setPaymentTurno] = useState<Turno | null>(null)
  const [mixtoMode, setMixtoMode] = useState(false)
  const [mixtoEfectivo, setMixtoEfectivo] = useState('')
  const [mixtoTransferencia, setMixtoTransferencia] = useState('')
  const [cancelingTurno, setCancelingTurno] = useState<Turno | null>(null)
  const [assigningTurno, setAssigningTurno] = useState<Turno | null>(null)
  const [editingTurno, setEditingTurno] = useState<Turno | null>(null)
  const [editTurnoForm, setEditTurnoForm] = useState<{ barberoId: string; sucursalId: string; hora: string; servicioId: string }>({
    barberoId: '',
    sucursalId: 's1',
    hora: '',
    servicioId: '',
  })
  const [editTurnoError, setEditTurnoError] = useState<string | null>(null)
  const [turnoFormError, setTurnoFormError] = useState<string | null>(null)
  const [reemplazoFijoForm, setReemplazoFijoForm] = useState<ReemplazoFijoForm>({
    clienteNombre: '',
    clienteTelefono: '',
    servicioId: servicios[0]?.id ?? '',
    metodoPago: '',
  })
  const [turnoForm, setTurnoForm] = useState<TurnoForm>({
    sucursalId: '',
    barberoId: barberos[0]?.id ?? '',
    servicioId: servicios[0]?.id ?? '',
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
      const isActive =
        !isCancelledTurno(turno) &&
        turno.estado !== 'REALIZADO' &&
        !isNoShowTurno(turno)
      if (turnosListMode === 'selected-day') {
        const dateToShow = selectedDate ?? todayKey
        return turno.fecha === dateToShow && isActive && !isHistoricalTurno(turno, today)
      }
      if (turnosListMode === 'upcoming') {
        const dateToShow = selectedDate ?? todayKey
        return turno.fecha === dateToShow && isActive && !isHistoricalTurno(turno, today)
      }
      if (turnosListMode === 'today') return turno.fecha === todayKey && isActive && !isHistoricalTurno(turno, today)
      if (turnosListMode === 'past') {
        const dateToShow = selectedDate ?? todayKey
        return (
          turno.fecha === dateToShow &&
          !isCancelledTurno(turno) &&
          !isNoShowTurno(turno) &&
          !isAusenteFijoTurno(turno) &&
          (isHistoricalTurno(turno, today) || turno.estado === 'REALIZADO')
        )
      }
      if (turnosListMode === 'cancelled') return isCancelledTurno(turno)
      return isNoShowTurno(turno)
    })
    .sort((first, second) => getTurnoTimestamp(first) - getTurnoTimestamp(second))
  const turnosPerPage = 25
  const totalTurnosPages = Math.max(1, Math.ceil(displayedTurnos.length / turnosPerPage))
  const paginatedTurnos = displayedTurnos.slice((turnosPage - 1) * turnosPerPage, turnosPage * turnosPerPage)
  const listTitle = (() => {
    const dateToShow = selectedDate ?? todayKey
    if (turnosListMode === 'selected-day') return `Turnos del ${dateToShow}`
    if (turnosListMode === 'upcoming') return `Próximos del ${dateToShow}`
    if (turnosListMode === 'today') return `Turnos de hoy ${todayKey}`
    if (turnosListMode === 'past') return `Pasados del ${dateToShow}`
    if (turnosListMode === 'cancelled') return 'Turnos cancelados'
    return 'Turnos con no asistencia'
  })()
  const selectedService = servicios.find((servicio) => servicio.id === turnoForm.servicioId)
  const availableSlots = useMemo(() => {
    if (!turnoForm.barberoId || !turnoForm.fecha || !selectedService) return []

    const slots = getAvailableSlots({
      barberId: turnoForm.barberoId,
      date: turnoForm.fecha,
      serviceDuration: selectedService.duracionMinutos,
      turnos,
      turnosFijos,
      barberos,
      servicios,
      horarios,
    })

    return slots
  }, [selectedService, turnoForm.barberoId, turnoForm.fecha, turnos, turnosFijos, barberos, servicios, horarios])

  useEffect(() => {
    if (!isTurnoModalOpen) return

    const currentSlotStillAvailable = availableSlots.some((slot) => slot.start === turnoForm.hora)
    if (currentSlotStillAvailable) return

    setTurnoForm((current) => ({
      ...current,
      hora: availableSlots[0]?.start ?? '',
    }))
  }, [availableSlots, isTurnoModalOpen, turnoForm.hora])

  const editSelectedService = editingTurno ? servicios.find((s) => s.id === editTurnoForm.servicioId) : undefined
  const editAvailableSlots = useMemo(() => {
    if (!editingTurno || !editSelectedService || !editTurnoForm.barberoId) return []
    return getAvailableSlots({
      barberId: editTurnoForm.barberoId,
      date: editingTurno.fecha ?? '',
      serviceDuration: editSelectedService.duracionMinutos,
      turnos: turnos.filter((t) => t.id !== editingTurno.id),
      turnosFijos: turnosFijos.filter((tf) => tf.id !== editingTurno.turnoFijoId),
      barberos,
      servicios,
      horarios,
    })
  }, [editingTurno, editTurnoForm.barberoId, editTurnoForm.servicioId, editSelectedService, turnos, turnosFijos, barberos, servicios, horarios])

  useEffect(() => {
    if (!editingTurno) return
    const stillAvailable = editAvailableSlots.some((slot) => slot.start === editTurnoForm.hora)
    if (stillAvailable) return
    setEditTurnoForm((prev) => ({ ...prev, hora: editAvailableSlots[0]?.start ?? '' }))
  }, [editAvailableSlots, editingTurno])

  const generatedFijosRef = useRef(new Set<string>())

  useEffect(() => {
    if (turnosFijos.length === 0) return
    const hoy = new Date().toISOString().slice(0, 10)
    turnosFijos
      .filter((turnoFijo) => {
        if (generatedFijosRef.current.has(turnoFijo.id)) return false
        return turnoFijo.fechasAgendadas.some((f) => f >= hoy)
      })
      .forEach((turnoFijo) => {
        generatedFijosRef.current.add(turnoFijo.id)
        generarProximoTurnoFijo(turnoFijo.id)
      })
  }, [turnosFijos])

  function getTurnosForDate(dateKey: string) {
    return filteredTurnos.filter((turno) => turno.fecha === dateKey)
  }

  async function handleNewTurno(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTurnoFormError(null)
    try {
      await crearTurno({
        clientId: `cliente-${Date.now()}`,
        sucursalId: turnoForm.sucursalId as import('../types').SucursalId,
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
    } catch (err) {
      setTurnoFormError(err instanceof Error ? err.message : 'No se pudo crear el turno.')
    }
  }

  function getServiceName(turno: Turno) {
    return servicios.find((servicio) => servicio.id === turno.servicioId)?.nombre ?? turno.servicioId
  }

  function getBarberName(turno: Turno) {
    return barberos.find((barbero) => barbero.id === turno.barberoId)?.nombre ?? turno.barberoId ?? 'Sin barbero'
  }

  function getBarberNameById(barberoId: string) {
    return barberos.find((barbero) => barbero.id === barberoId)?.nombre ?? barberoId
  }

  function getServiceNameById(servicioId: string) {
    return servicios.find((servicio) => servicio.id === servicioId)?.nombre ?? servicioId
  }

  function getCompactDateLabel(dateKey: string) {
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${dateKey}T00:00:00`))
  }

  function getProximaFecha(fechasAgendadas: string[]) {
    const hoy = new Date().toISOString().slice(0, 10)
    const fechasOrdenadas = [...fechasAgendadas].sort()
    return fechasOrdenadas.filter((fecha) => fecha >= hoy)[0] ?? fechasOrdenadas[0] ?? hoy
  }

  function computeProximaFechaActual(fechasAgendadas: string[], hora: string): string {
    const ahora = new Date()
    const hoy = toDateKey(ahora)
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()
    const [hh, mm] = hora.split(':').map(Number)
    const minutosHora = (hh ?? 0) * 60 + (mm ?? 0)
    const fechasOrdenadas = [...fechasAgendadas].sort()
    for (const fecha of fechasOrdenadas) {
      if (fecha > hoy) return fecha
      if (fecha === hoy && minutosHora > minutosAhora) return fecha
    }
    return fechasOrdenadas[0] ?? hoy
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

  function closePaymentModal() {
    setPaymentTurno(null)
    setMixtoMode(false)
    setMixtoEfectivo('')
    setMixtoTransferencia('')
  }

  function markAsPaid(turno: Turno, metodoPago: MetodoPago, montoEfectivo?: number, montoTransferencia?: number) {
    marcarRealizado(turno.id, metodoPago, montoEfectivo, montoTransferencia)
    closePaymentModal()
    setSelectedTurno(null)
  }

  function markAsNoShow(turno: Turno) {
    if (turno.esFijo && turno.turnoFijoId) {
      marcarAusenteFijo(turno.id)
    } else {
      marcarNoAsistio(turno.id)
    }
    closePaymentModal()
    setSelectedTurno(null)
  }

  function cancelAppointment(turno: Turno) {
    cancelarTurno(turno.id)
    setCancelingTurno(null)
    setSelectedTurno(null)
  }

  function getStatusBadge(turno: Turno) {
    if (turno.estado === 'AUSENTE_FIJO') {
      return {
        label: 'Turno libre',
        className: 'border border-purple-500/30 bg-purple-500/20 text-purple-400',
      }
    }

    return {
      label: String(turno.estado),
      className: 'border border-[#2f2f2f] bg-[#111111] text-white',
    }
  }

  function openAssignReplacement(turno: Turno) {
    setReemplazoFijoForm({
      clienteNombre: '',
      clienteTelefono: '',
      servicioId: turno.servicioId,
      metodoPago: '',
    })
    setAssigningTurno(turno)
  }

  function handleAssignReplacement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!assigningTurno) return

    liberarTurnoFijo(assigningTurno.id, {
      clienteNombre: reemplazoFijoForm.clienteNombre,
      clienteTelefono: reemplazoFijoForm.clienteTelefono || undefined,
      servicioId: reemplazoFijoForm.servicioId,
      metodoPago: reemplazoFijoForm.metodoPago || undefined,
    })
    setAssigningTurno(null)
    setSelectedTurno(null)
  }

  async function handleGuardarTurnoFijo(datos: Omit<TurnoFijo, 'id' | 'proximaFecha'>) {
    setTurnoFijoError(null)
    try {
      await crearTurnoFijo(datos)
      setIsTurnoFijoModalOpen(false)
      setShowTurnosFijos(true)
    } catch (err) {
      setTurnoFijoError(err instanceof Error ? err.message : 'No se pudo crear el turno fijo')
    }
  }

  function handleEditarTurnoFijo(turnoFijo: TurnoFijo) {
    setTurnoFijoSeleccionado(turnoFijo)
    setShowModalEditar(true)
  }

  function handleEliminarTurnoFijo(turnoFijo: TurnoFijo) {
    setTurnoFijoSeleccionado(turnoFijo)
    setShowConfirmarEliminar(true)
  }

  function handleGuardarEdicion(id: string, datos: Partial<TurnoFijo>, cascade: boolean) {
    editarTurnoFijo(
      id,
      {
        ...datos,
        proximaFecha: datos.fechasAgendadas ? getProximaFecha(datos.fechasAgendadas) : datos.proximaFecha,
      },
      cascade,
    )
    setShowModalEditar(false)
    setTurnoFijoSeleccionado(null)
  }

  function openEditTurno(turno: Turno) {
    setEditingTurno(turno)
    setEditTurnoForm({
      barberoId: turno.barberoId ?? '',
      sucursalId: turno.sucursalId ?? 's1',
      hora: turno.hora ?? '',
      servicioId: turno.servicioId ?? '',
    })
    setEditTurnoError(null)
  }

  async function handleGuardarEditarTurno() {
    if (!editingTurno) return
    setEditTurnoError(null)
    const servicio = servicios.find((s) => s.id === editTurnoForm.servicioId)
    const horaFin = servicio && editTurnoForm.hora
      ? (() => {
          const [h, m] = editTurnoForm.hora.split(':').map(Number)
          const total = (h ?? 0) * 60 + (m ?? 0) + servicio.duracionMinutos
          return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
        })()
      : undefined
    try {
      await editarTurno(editingTurno.id, {
        hora: editTurnoForm.hora || undefined,
        barberoId: editTurnoForm.barberoId || undefined,
        sucursalId: editTurnoForm.sucursalId as import('../types').SucursalId,
        horaFin,
        servicioId: editTurnoForm.servicioId || undefined,
      })
      setEditingTurno(null)
      setSelectedTurno(null)
    } catch (err) {
      setEditTurnoError(err instanceof Error ? err.message : 'Error al guardar el turno')
    }
  }

  function handleConfirmarEliminar() {
    if (!turnoFijoSeleccionado) return

    eliminarTurnoFijo(turnoFijoSeleccionado.id)
    setTurnoFijoSeleccionado(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between">
        <div>
          <p className="hidden text-[11px] uppercase tracking-widest text-[#a0a0a0] md:block">SECCIÓN PRINCIPAL</p>
          <h1 className="text-[42px] font-black leading-none text-white md:mt-2 md:text-[32px] md:font-bold">Agenda</h1>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400 hover:text-red-200 md:hidden"
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </header>

      <section
        className="relative mt-6 overflow-hidden rounded-2xl border border-[#111111] bg-[#050505] p-3 md:p-4"
      >
        <div className="relative z-10">
        <div className="mx-auto mb-5 grid max-w-xl grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.5rem] border border-[#2a2a2a] bg-[#0f0f0f] p-2 md:max-w-none md:border-0 md:bg-transparent md:p-0">
          <button
            aria-label="Mes anterior"
            className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#111111] text-4xl leading-none text-white md:h-8 md:w-8 md:rounded-full md:text-2xl"
            onClick={prevMonth}
            type="button"
          >
            ‹
          </button>
          <h2 className="text-center text-2xl font-black text-white md:text-xl md:font-bold">{monthLabel}</h2>
          <button
            aria-label="Mes siguiente"
            className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#111111] text-4xl leading-none text-white md:h-8 md:w-8 md:rounded-full md:text-2xl"
            onClick={nextMonth}
            type="button"
          >
            ›
          </button>
        </div>

        <div className="mb-5 flex justify-center gap-3 md:hidden">
          <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2 text-sm font-bold text-white">
            <span className="h-4 w-4 rounded-full bg-white" />
            Hoy
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2 text-sm font-bold text-white">
            <span className="h-4 w-4 rounded-full bg-[#f5c518]" />
            Con turnos
          </div>
        </div>

        <div className="overflow-visible md:overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 md:min-w-[720px]">
            {weekDays.map((day) => (
              <div
                className="border-[#333333] py-2 text-center text-sm font-black text-[#9ca3af] md:rounded-lg md:border md:bg-[#111111]/85 md:py-3 md:font-medium"
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
              const dayTurnos = getTurnosForDate(dateKey).filter((t) => t.estado !== 'CANCELADO' && t.estado !== 'cancelado' && t.estado !== 'AUSENTE_FIJO')
              const generatedFijoIds = new Set(dayTurnos.filter((t) => t.turnoFijoId).map((t) => t.turnoFijoId!))
              const ungeneratedFijos = turnosFijos.filter((tf) => tf.fechasAgendadas.includes(dateKey) && !generatedFijoIds.has(tf.id))
              const dayCount = dayTurnos.length + ungeneratedFijos.length

              return (
                <button
                  className={`relative flex min-h-[112px] items-center justify-center rounded-2xl border bg-[#050505]/78 p-1 text-center align-top backdrop-blur-[1px] transition md:block md:min-h-[80px] md:rounded-lg md:p-2 md:text-left ${
                    calendarDay.isCurrentMonth ? 'cursor-pointer hover:border-[#f5c518]/50' : 'cursor-default'
                  } ${isHighlighted ? 'border-[#f5c518] bg-[#1a1700]/90' : 'border-[#242424]'} ${
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
                        : 'text-[#333333]'
                    }`}
                  >
                  {calendarDay.date.getDate()}
                  </span>
                  {calendarDay.isCurrentMonth && dayCount > 0 ? (
                    <span className="absolute right-2 top-2 rounded-full bg-[#f5c518] px-2 py-0.5 text-xs font-bold text-black">
                      {dayCount}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-[#111111] bg-[#050505] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <select
              className="min-w-[180px] rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-2 text-left text-sm text-white"
              onChange={(event) => {
                setSelectedBarberId(event.target.value)
                setTurnosPage(1)
              }}
              value={selectedBarberId}
            >
              <option value="">Seleccionar Barbero</option>
              {barberos.map((barbero) => (
                <option key={barbero.id} value={barbero.id}>{barbero.nombre}</option>
              ))}
            </select>
            <select
              className="min-w-[180px] rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-2 text-left text-sm text-white"
              onChange={(event) => {
                setSelectedSucursalId(event.target.value as SucursalId | '')
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
                setTurnoForm((current) => ({
                  ...current,
                  barberoId: current.barberoId || barberos[0]?.id || '',
                  servicioId: current.servicioId || serviciosActivos[0]?.id || servicios[0]?.id || '',
                  fecha: selectedDate ?? toDateKey(today),
                  sucursalId: selectedSucursalId,
                }))
                setIsTurnoModalOpen(true)
              }}
              type="button"
            >
              + Nuevo Turno
            </button>
            <button
              className="rounded-lg border border-[#f5c518] bg-transparent px-4 py-2 font-medium text-[#f5c518] transition hover:bg-[#f5c518]/10"
              onClick={() => setIsTurnoFijoModalOpen(true)}
              type="button"
            >
              + Turno Fijo
            </button>
          </div>

          <label className="flex-1">
            <span className="sr-only">Buscar cliente</span>
            <input
              className="w-full rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-2 text-sm text-white outline-none placeholder:text-[#a0a0a0] focus:border-[#f5c518]"
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

      {turnosFijos.length > 0 ? (
        <section className="mt-4 rounded-2xl border border-[#111111] bg-[#050505] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="flex items-center gap-2 text-left"
              onClick={() => setShowTurnosFijos((current) => !current)}
              type="button"
            >
              <span className="font-bold text-white">Turnos Fijos Activos</span>
              <span className="rounded-full bg-[#1a1700] px-2 py-0.5 text-xs font-bold text-[#f5c518]">
                {turnosFijos.filter((tf) => tf.fechasAgendadas.includes(selectedDate ?? todayKey) && (!selectedBarberId || tf.barberoId === selectedBarberId)).length}
              </span>
              <span className="text-sm text-[#f5c518]">{showTurnosFijos ? 'Ocultar' : 'Ver'}</span>
            </button>
            {showTurnosFijos ? (
              <input
                className="rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none placeholder:text-[#a0a0a0] focus:border-[#f5c518] sm:w-64"
                onChange={(e) => { setSearchFijos(e.target.value); setFijosPagina(1) }}
                placeholder="Buscar cliente..."
                type="search"
                value={searchFijos}
              />
            ) : null}
          </div>

          {(() => {
            const porVencer = turnosFijos.filter((tf) => {
              return tf.fechasAgendadas.filter((f) => f >= todayKey).length <= 2
            })
            if (porVencer.length === 0) return null
            return (
              <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
                <span className="font-bold text-amber-400">⚠ {porVencer.length} turno{porVencer.length > 1 ? 's fijos' : ' fijo'} por vencer: </span>
                <span className="text-amber-300">{porVencer.map((tf) => tf.clienteNombre).join(', ')}</span>
                <span className="text-amber-400/70"> — editá las fechas para renovarlos.</span>
              </div>
            )
          })()}

          {showTurnosFijos ? (
            <div className="mt-4 overflow-x-auto">
              {(() => {
                const normalSearch = searchFijos.trim().toLowerCase()
                const fijosFiltrados = turnosFijos.filter((tf) => {
                  if (selectedBarberId && tf.barberoId !== selectedBarberId) return false
                  if (!normalSearch) return true
                  return (
                    tf.clienteNombre.toLowerCase().includes(normalSearch) ||
                    (tf.clienteTelefono ?? '').toLowerCase().includes(normalSearch)
                  )
                })
                const totalPaginas = Math.max(1, Math.ceil(fijosFiltrados.length / FIJOS_POR_PAGINA))
                const fijosPaginados = fijosFiltrados.slice(
                  (fijosPagina - 1) * FIJOS_POR_PAGINA,
                  fijosPagina * FIJOS_POR_PAGINA,
                )
                return (
                  <>
                    {fijosFiltrados.length === 0 ? (
                      <p className="py-4 text-sm text-[#a0a0a0]">Sin resultados para "{searchFijos}".</p>
                    ) : null}
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-[#a0a0a0]">
                  <tr className="border-b border-[#242424]">
                    <th className="py-3">Cliente</th>
                    <th className="py-3">Barbero</th>
                    <th className="py-3">Servicio</th>
                    <th className="py-3">Hora</th>
                    <th className="py-3">Fechas agendadas</th>
                    <th className="py-3">Próxima fecha</th>
                    <th className="py-3">Estado</th>
                    <th className="py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fijosPaginados.map((turnoFijo) => {
                    const fechasFuturas = turnoFijo.fechasAgendadas.filter((f) => f >= todayKey)
                    const pocasFechas = fechasFuturas.length <= 2

                    return (
                      <tr className={`border-b text-white ${pocasFechas ? 'border-amber-500/30 bg-amber-500/5' : 'border-[#111111]'}`} key={turnoFijo.id}>
                        <td className="py-3 font-bold">
                          <div className="flex flex-wrap items-center gap-2">
                            {turnoFijo.clienteNombre}
                            {pocasFechas ? (
                              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                                ⚠ {fechasFuturas.length === 0 ? 'Sin fechas' : `Queda ${fechasFuturas.length} fecha${fechasFuturas.length > 1 ? 's' : ''}`} — renovar
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 text-[#a0a0a0]">{getBarberNameById(turnoFijo.barberoId)}</td>
                        <td className="py-3 text-[#a0a0a0]">{getServiceNameById(turnoFijo.servicioId)}</td>
                        <td className="py-3 text-[#a0a0a0]">{turnoFijo.hora}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            {turnoFijo.fechasAgendadas.slice(0, 2).map((fecha) => (
                              <span className="rounded-full border border-[#2f2f2f] bg-[#111111] px-2 py-1 text-xs font-bold text-[#f5c518]" key={fecha}>
                                {getCompactDateLabel(fecha)}
                              </span>
                            ))}
                            {turnoFijo.fechasAgendadas.length > 2 ? (
                              <span className="rounded-full bg-[#111111] px-2 py-1 text-xs font-bold text-[#a0a0a0]">
                                +{turnoFijo.fechasAgendadas.length - 2} mas
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 text-[#a0a0a0]">{computeProximaFechaActual(turnoFijo.fechasAgendadas, turnoFijo.hora)}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-[#123524] px-3 py-1 text-xs font-bold text-[#86efac]">
                            Activo
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                          {(() => {
                            const turnoProximo = turnos.find(
                              (t) =>
                                t.turnoFijoId === turnoFijo.id &&
                                t.fecha === turnoFijo.proximaFecha &&
                                (t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'),
                            )
                            return turnoProximo ? (
                              <button
                                className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-400 transition hover:bg-purple-500/20"
                                onClick={() => marcarAusenteFijo(turnoProximo.id)}
                                type="button"
                              >
                                No viene
                              </button>
                            ) : null
                          })()}
                            <button
                              className="rounded-lg border border-[#f5c518] bg-transparent px-3 py-2 text-xs font-bold text-[#f5c518] transition hover:bg-[#f5c518]/10"
                              onClick={() => handleEditarTurnoFijo(turnoFijo)}
                              type="button"
                            >
                              Editar
                            </button>
                            <button
                              className="rounded-lg border border-red-500 bg-transparent px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
                              onClick={() => handleEliminarTurnoFijo(turnoFijo)}
                              type="button"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {totalPaginas > 1 ? (
                <div className="mt-3 flex items-center justify-between text-sm text-[#a0a0a0]">
                  <span>Página {fijosPagina} de {totalPaginas} · {fijosFiltrados.length} resultados</span>
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg bg-[#111111] px-3 py-2 text-white disabled:opacity-40"
                      disabled={fijosPagina === 1}
                      onClick={() => setFijosPagina((p) => Math.max(1, p - 1))}
                      type="button"
                    >
                      Anterior
                    </button>
                    <button
                      className="rounded-lg bg-[#111111] px-3 py-2 text-white disabled:opacity-40"
                      disabled={fijosPagina === totalPaginas}
                      onClick={() => setFijosPagina((p) => Math.min(totalPaginas, p + 1))}
                      type="button"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              ) : null}
                  </>
                )
              })()}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-[#111111] bg-[#050505] p-4">
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
                      : 'border-[#242424] bg-[#111111] text-[#a0a0a0] hover:border-[#3f3f3f] hover:text-white'
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
            {paginatedTurnos.map((turno) => {
              const isRealizado = turno.estado === 'REALIZADO'
              return (
                <button
                  className={`inline-flex w-fit items-center rounded-lg border px-4 py-3 text-left font-bold transition ${
                    isRealizado
                      ? 'border-[#166534]/60 bg-[#052e16]/60 text-white/60 hover:border-[#166534] hover:bg-[#052e16]'
                      : 'border-[#242424] bg-[#111111] text-white hover:border-[#f5c518]/60 hover:bg-[#242424]'
                  }`}
                  key={turno.id}
                  onClick={() => setSelectedTurno(turno)}
                  type="button"
                >
                  <span>{turno.hora} · {turno.clienteNombre}</span>
                  {isRealizado ? (
                    <span className="ml-3 rounded-full border border-green-800 bg-green-950 px-2 py-0.5 text-xs font-bold text-green-400">
                      REALIZADO
                    </span>
                  ) : null}
                  {turno.estado === 'AUSENTE_FIJO' ? (
                    <span className="ml-3 rounded-full border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-400">
                      TURNO LIBRE
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
          {displayedTurnos.length > turnosPerPage ? (
            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[#a0a0a0]">
              <span>Página {turnosPage} de {totalTurnosPages}</span>
              <div className="flex gap-2">
                <button
                  className="rounded-lg bg-[#111111] px-3 py-2 text-white disabled:opacity-40"
                  disabled={turnosPage === 1}
                  onClick={() => setTurnosPage((page) => Math.max(1, page - 1))}
                  type="button"
                >
                  Anterior
                </button>
                <button
                  className="rounded-lg bg-[#111111] px-3 py-2 text-white disabled:opacity-40"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3">
          <section className="w-full max-w-lg rounded-xl border border-[#2f2f2f] bg-[#050505] text-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#242424] px-4 py-3">
              <div>
                <p className="text-sm font-bold text-[#f5c518]">
                  {selectedTurno.hora}{selectedTurno.horaFin ? ` - ${selectedTurno.horaFin}` : ''}
                </p>
                <h2 className="mt-0.5 text-xl font-bold">{selectedTurno.clienteNombre}</h2>
              </div>
              <button
                aria-label="Cerrar detalle del turno"
                className="text-2xl leading-none text-[#a0a0a0] hover:text-white"
                onClick={() => setSelectedTurno(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 px-4 py-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-[#111111] px-3 py-2">
                  <span className="block text-xs text-[#a0a0a0]">Servicio</span>
                  <strong className="mt-0.5 block text-white">{getServiceName(selectedTurno)}</strong>
                </div>
                <div className="rounded-lg bg-[#111111] px-3 py-2">
                  <span className="block text-xs text-[#a0a0a0]">Barbero</span>
                  <strong className="mt-0.5 block text-white">{getBarberName(selectedTurno)}</strong>
                </div>
                <div className="rounded-lg bg-[#111111] px-3 py-2">
                  <span className="block text-xs text-[#a0a0a0]">Sucursal</span>
                  <strong className="mt-0.5 block text-white">
                    {selectedTurno.sucursalId === 's1' ? 'Sucursal 1' : selectedTurno.sucursalId === 's2' ? 'Sucursal 2' : selectedTurno.sucursalId ?? '—'}
                  </strong>
                </div>
                <div className="rounded-lg bg-[#111111] px-3 py-2">
                  <span className="block text-xs text-[#a0a0a0]">Fecha</span>
                  <strong className="mt-0.5 block text-white">{selectedTurno.fecha ?? selectedDate}</strong>
                </div>
                <div className="rounded-lg bg-[#111111] px-3 py-2">
                  <span className="block text-xs text-[#a0a0a0]">Estado</span>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${getStatusBadge(selectedTurno).className}`}>
                    {getStatusBadge(selectedTurno).label}
                  </span>
                  {selectedTurno.estado === 'AUSENTE_FIJO' ? (
                    <p className="mt-1 text-xs text-[#a0a0a0]">
                      El cliente fijo no asistió — este horario está disponible
                    </p>
                  ) : null}
                </div>
                <div className="rounded-lg bg-[#111111] px-3 py-2">
                  <span className="block text-xs text-[#a0a0a0]">Teléfono</span>
                  <strong className="mt-0.5 block text-white">{selectedTurno.clienteTelefono ?? 'Sin teléfono cargado'}</strong>
                </div>
              </div>
            </div>

            {selectedTurno.estado === 'AUSENTE_FIJO' ? (
              <div className="border-t border-[#242424] px-4 py-3">
                <button
                  className="w-full rounded-lg border border-purple-500/30 bg-purple-500/20 px-4 py-2.5 text-sm font-bold text-purple-400 transition hover:border-purple-400"
                  onClick={() => openAssignReplacement(selectedTurno)}
                  type="button"
                >
                  Asignar cliente para este turno
                </button>
              </div>
            ) : (
            <div className="grid gap-2 border-t border-[#242424] px-4 py-3 sm:grid-cols-3">
              {selectedTurno.esFijo && selectedTurno.turnoFijoId && (selectedTurno.estado === 'PENDIENTE' || selectedTurno.estado === 'CONFIRMADO') ? (
                <button
                  className="col-span-full rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-bold text-purple-400 transition hover:border-purple-400 hover:bg-purple-500/20"
                  onClick={() => {
                    marcarAusenteFijo(selectedTurno.id)
                    setSelectedTurno(null)
                  }}
                  type="button"
                >
                  El cliente fijo no viene — liberar turno
                </button>
              ) : null}
              {(selectedTurno.estado === 'PENDIENTE' || selectedTurno.estado === 'CONFIRMADO') ? (
                <button
                  className="col-span-full rounded-lg border border-[#2a2a2a] bg-[#111111] px-4 py-3 text-sm font-bold text-white transition hover:border-[#f5c518]/50"
                  onClick={() => openEditTurno(selectedTurno)}
                  type="button"
                >
                  Editar turno
                </button>
              ) : null}
              <a
                className="rounded-lg border border-[#3f4c2a] bg-[#202713] px-4 py-2.5 text-center text-sm font-bold text-[#f5c518] transition hover:border-[#f5c518]"
                href={getWhatsAppUrl(selectedTurno, getReminderMessage(selectedTurno))}
                rel="noreferrer"
                target="_blank"
              >
                Recordar
              </a>
              <button
                className="rounded-lg border border-[#22543d] bg-[#123524] px-4 py-2.5 text-sm font-bold text-[#86efac] transition hover:border-[#22c55e]"
                onClick={() => setPaymentTurno(selectedTurno)}
                type="button"
              >
                Asistió
              </button>
              <button
                className="rounded-lg border border-[#5f2d2d] bg-[#2a1618] px-4 py-2.5 text-sm font-bold text-[#fca5a5] transition hover:border-[#ef4444]"
                onClick={() => setCancelingTurno(selectedTurno)}
                type="button"
              >
                Cancelar
              </button>
            </div>
            )}
          </section>
        </div>
      ) : null}

      {editingTurno ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <section className="w-full max-w-lg rounded-xl border border-[#2f2f2f] bg-[#050505] text-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#242424] px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold">Editar turno</h2>
                <p className="mt-1 text-sm text-[#a0a0a0]">
                  {editingTurno.clienteNombre} · {editingTurno.fecha}
                </p>
              </div>
              <button
                aria-label="Cerrar edición"
                className="text-3xl leading-none text-[#a0a0a0] hover:text-white"
                onClick={() => setEditingTurno(null)}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <select
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(e) => setEditTurnoForm((prev) => ({ ...prev, barberoId: e.target.value }))}
                value={editTurnoForm.barberoId}
              >
                {barberos.map((b) => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
              <select
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(e) => setEditTurnoForm((prev) => ({ ...prev, sucursalId: e.target.value }))}
                value={editTurnoForm.sucursalId}
              >
                <option value="s1">Sucursal 1</option>
                <option value="s2">Sucursal 2</option>
              </select>
              <select
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(e) => setEditTurnoForm((prev) => ({ ...prev, servicioId: e.target.value, hora: '' }))}
                value={editTurnoForm.servicioId}
              >
                <option value="" disabled>Seleccionar servicio</option>
                {serviciosActivos.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#a0a0a0]">
                  Horario disponible
                  {editTurnoForm.hora ? (
                    <span className="ml-2 rounded-full bg-[#f5c518] px-2 py-0.5 text-black normal-case">{editTurnoForm.hora}</span>
                  ) : null}
                </label>
                {editAvailableSlots.length === 0 ? (
                  <p className="text-sm text-[#a0a0a0]">
                    Sin horarios disponibles para este barbero en la fecha del turno. Verificá que tenga horario configurado ese día.
                  </p>
                ) : (
                  <div className="grid max-h-44 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                    {editAvailableSlots.map((slot) => (
                      <button
                        className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                          editTurnoForm.hora === slot.start
                            ? 'border-[#f5c518] bg-[#1a1700] text-[#f5c518]'
                            : 'border-[#2f2f2f] bg-[#111111] text-white hover:border-[#f5c518]/70'
                        }`}
                        key={slot.start}
                        onClick={() => setEditTurnoForm((prev) => ({ ...prev, hora: slot.start }))}
                        type="button"
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {editTurnoError ? <p className="text-sm font-bold text-red-300">{editTurnoError}</p> : null}
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-[#242424] bg-[#0a0a0a] px-6 py-5">
              <button
                className="rounded-lg bg-[#3f3f3f] px-4 py-3"
                onClick={() => setEditingTurno(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-[#f5c518] px-4 py-3 font-bold text-black disabled:opacity-50"
                disabled={!editTurnoForm.hora}
                onClick={handleGuardarEditarTurno}
                type="button"
              >
                Guardar
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {assigningTurno ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <form
            className="w-full max-w-md rounded-xl border border-[#2f2f2f] bg-[#050505] p-6 text-white shadow-2xl"
            onSubmit={handleAssignReplacement}
          >
            <h2 className="text-2xl font-bold">Asignar cliente</h2>
            <p className="mt-2 text-sm text-[#a0a0a0]">
              Este turno fijo quedó libre. Cargá los datos del cliente reemplazante.
            </p>
            <div className="mt-5 space-y-4">
              <input
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setReemplazoFijoForm((current) => ({ ...current, clienteNombre: event.target.value }))}
                placeholder="Nombre del nuevo cliente"
                required
                value={reemplazoFijoForm.clienteNombre}
              />
              <input
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setReemplazoFijoForm((current) => ({ ...current, clienteTelefono: event.target.value }))}
                placeholder="Teléfono (opcional)"
                value={reemplazoFijoForm.clienteTelefono}
              />
              <select
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setReemplazoFijoForm((current) => ({ ...current, servicioId: event.target.value }))}
                value={reemplazoFijoForm.servicioId}
              >
                {serviciosActivos.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre}
                  </option>
                ))}
              </select>
              <select
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) =>
                  setReemplazoFijoForm((current) => ({ ...current, metodoPago: event.target.value as '' | MetodoPago }))
                }
                value={reemplazoFijoForm.metodoPago}
              >
                <option value="">Método de pago (opcional)</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="TARJETA">Tarjeta</option>
              </select>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="rounded-lg bg-[#3f3f3f] px-4 py-3"
                onClick={() => setAssigningTurno(null)}
                type="button"
              >
                Cancelar
              </button>
              <button className="rounded-lg bg-[#f5c518] px-4 py-3 font-bold text-black" type="submit">
                Confirmar asignación
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {paymentTurno ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <section className="w-full max-w-md rounded-xl border border-[#2f2f2f] bg-[#050505] p-6 text-white shadow-2xl">
            {mixtoMode ? (
              <>
                <h2 className="text-2xl font-bold">Pago mixto</h2>
                <p className="mt-2 text-sm text-[#a0a0a0]">
                  Ingresá cuánto pagó en cada método.
                  {(() => {
                    const precio = servicios.find((s) => s.id === paymentTurno.servicioId)?.precio
                    return precio ? ` Servicio: $${precio.toLocaleString('es-AR')}` : ''
                  })()}
                </p>
                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-sm font-bold">Efectivo $</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none focus:border-[#f5c518]"
                      inputMode="decimal"
                      min="0"
                      onChange={(e) => setMixtoEfectivo(e.target.value)}
                      placeholder="0"
                      type="number"
                      value={mixtoEfectivo}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold">Transferencia $</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none focus:border-[#f5c518]"
                      inputMode="decimal"
                      min="0"
                      onChange={(e) => setMixtoTransferencia(e.target.value)}
                      placeholder="0"
                      type="number"
                      value={mixtoTransferencia}
                    />
                  </label>
                </div>
                <button
                  className="mt-5 w-full rounded-lg bg-[#f5c518] px-4 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={Number(mixtoEfectivo) <= 0 || Number(mixtoTransferencia) <= 0}
                  onClick={() => markAsPaid(paymentTurno, 'MIXTO', Number(mixtoEfectivo), Number(mixtoTransferencia))}
                  type="button"
                >
                  Confirmar pago mixto
                </button>
                <button
                  className="mt-3 w-full rounded-lg bg-[#3f3f3f] px-4 py-3 text-white transition hover:bg-[#6b6b6b]"
                  onClick={() => setMixtoMode(false)}
                  type="button"
                >
                  Volver
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Método de pago</h2>
                <p className="mt-2 text-sm text-[#a0a0a0]">
                  Seleccioná cómo pagó {paymentTurno.clienteNombre} o marcá que no asistió.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    className="rounded-lg bg-[#f5c518] px-4 py-3 font-bold text-black transition hover:brightness-110"
                    onClick={() => markAsPaid(paymentTurno, 'EFECTIVO')}
                    type="button"
                  >
                    Efectivo
                  </button>
                  <button
                    className="rounded-lg border border-[#2f2f2f] bg-[#111111] px-4 py-3 font-bold text-white transition hover:border-[#f5c518]"
                    onClick={() => markAsPaid(paymentTurno, 'TRANSFERENCIA')}
                    type="button"
                  >
                    Transferencia
                  </button>
                  <button
                    className="rounded-lg border border-[#2f2f2f] bg-[#111111] px-4 py-3 font-bold text-white transition hover:border-[#f5c518] sm:col-span-2"
                    onClick={() => { setMixtoMode(true); setMixtoEfectivo(''); setMixtoTransferencia('') }}
                    type="button"
                  >
                    Mixto (efectivo + transferencia)
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
                  className="mt-3 w-full rounded-lg bg-[#3f3f3f] px-4 py-3 text-white transition hover:bg-[#6b6b6b]"
                  onClick={closePaymentModal}
                  type="button"
                >
                  Volver
                </button>
              </>
            )}
          </section>
        </div>
      ) : null}

      {cancelingTurno ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <section className="w-full max-w-md rounded-xl border border-[#2f2f2f] bg-[#050505] p-6 text-white shadow-2xl">
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
                className="rounded-lg bg-[#3f3f3f] px-4 py-3 text-white transition hover:bg-[#6b6b6b]"
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
          <form className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl border border-[#2f2f2f] bg-[#050505] text-white shadow-2xl" onSubmit={handleNewTurno}>
            <div className="border-b border-[#242424] px-6 py-5">
              <h2 className="text-2xl font-bold">Nuevo Turno</h2>
              <p className="mt-1 text-sm text-[#a0a0a0]">Elegí barbero, fecha y servicio para ver horarios disponibles.</p>
            </div>
            <div className="max-h-[68vh] space-y-4 overflow-y-auto px-6 py-5">
              <select
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, sucursalId: event.target.value }))}
                required
                value={turnoForm.sucursalId}
              >
                <option value="" disabled>Sucursal</option>
                <option value="s1">Sucursal 1</option>
                <option value="s2">Sucursal 2</option>
              </select>
              <input
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, clienteNombre: event.target.value }))}
                placeholder="Nombre del cliente"
                required
                value={turnoForm.clienteNombre}
              />
              <input
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, clienteTelefono: event.target.value }))}
                placeholder="Teléfono"
                value={turnoForm.clienteTelefono}
              />
              <input
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, fecha: event.target.value }))}
                type="date"
                value={turnoForm.fecha}
              />
              <select
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, barberoId: event.target.value }))}
                value={turnoForm.barberoId}
              >
                {barberos.map((barbero) => (
                  <option key={barbero.id} value={barbero.id}>{barbero.nombre}</option>
                ))}
              </select>
              <select
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setTurnoForm((current) => ({ ...current, servicioId: event.target.value }))}
                value={turnoForm.servicioId}
              >
                {serviciosActivos.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                ))}
              </select>
              <section className="rounded-xl border border-[#242424] bg-[#0a0a0a] p-4">
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
                  <p className="mt-4 rounded-lg border border-[#2f2f2f] bg-[#111111] px-4 py-3 text-sm text-[#a0a0a0]">
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
                              : 'border-[#2f2f2f] bg-[#111111] text-white hover:border-[#f5c518]/70'
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
              <p className="rounded-lg bg-[#111111] px-4 py-3 text-sm text-[#a0a0a0]">
                {selectedService
                  ? `Duración del servicio: ${selectedService.duracionMinutos} minutos. Los horarios se recalculan según la agenda real del barbero.`
                  : 'Seleccioná un servicio para ver los horarios disponibles.'}
              </p>
              {turnoFormError ? <p className="text-sm font-bold text-red-300">{turnoFormError}</p> : null}
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-[#242424] bg-[#0a0a0a] px-6 py-5">
              <button
                className="rounded-lg bg-[#3f3f3f] px-4 py-3"
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
                disabled={availableSlots.length === 0 || !turnoForm.hora || !turnoForm.sucursalId}
                type="submit"
              >
                Crear Turno
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ModalNuevoTurnoFijo
        barberos={barberos}
        externalError={turnoFijoError}
        horarios={horarios}
        isOpen={isTurnoFijoModalOpen}
        onClose={() => { setIsTurnoFijoModalOpen(false); setTurnoFijoError(null) }}
        onGuardar={handleGuardarTurnoFijo}
        servicios={servicios}
        turnos={turnos}
        turnosFijos={turnosFijos}
      />

      {turnoFijoSeleccionado ? (
        <ModalEditarTurnoFijo
          barberos={barberos}
          isOpen={showModalEditar}
          onClose={() => {
            setShowModalEditar(false)
            setTurnoFijoSeleccionado(null)
          }}
          onGuardar={handleGuardarEdicion}
          servicios={servicios}
          turnoFijo={turnoFijoSeleccionado}
          turnos={turnos}
        />
      ) : null}

      <ModalConfirmarEliminar
        descripcion={
          turnoFijoSeleccionado
            ? `Eliminas la recurrencia de ${turnoFijoSeleccionado.clienteNombre}?\nLos turnos ya generados no se cancelan automaticamente.`
            : ''
        }
        isOpen={showConfirmarEliminar}
        onClose={() => {
          setShowConfirmarEliminar(false)
          setTurnoFijoSeleccionado(null)
        }}
        onConfirmar={handleConfirmarEliminar}
        titulo="Eliminar turno fijo"
      />
    </div>
  )
}

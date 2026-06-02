import type { Barbero, HorarioSemanal, Servicio, Turno } from '../../../types'

export type AvailableSlot = {
  start: string
  end: string
}

export type GetAvailableSlotsParams = {
  barberId: string
  date: string
  serviceDuration: number
  turnos: Turno[]
  barberos: Barbero[]
  servicios: Servicio[]
  horarios: HorarioSemanal[]
}

export type CreateAppointmentParams = {
  clientId: string
  barberId: string
  serviceId: string
  date: string
  startTime: string
  clienteNombre: string
  clienteTelefono?: string
  sucursalId?: Turno['sucursalId']
}

type BusyRange = {
  start: number
  end: number
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function getScheduleDayIndex(date: string) {
  return (new Date(`${date}T00:00:00`).getDay() + 6) % 7
}

function isBlockingTurno(turno: Turno) {
  return turno.estado !== 'CANCELADO' && turno.estado !== 'NO_ASISTIO' && turno.estado !== 'cancelado'
}

function getServiceDuration(servicios: Servicio[], serviceId: string) {
  return servicios.find((servicio) => servicio.id === serviceId)?.duracionMinutos ?? 30
}

function getTurnoEnd(turno: Turno, servicios: Servicio[]) {
  if (turno.horaFin) return turno.horaFin
  const duration = getServiceDuration(servicios, turno.servicioId)
  return minutesToTime(timeToMinutes(turno.hora ?? '00:00') + duration)
}

function overlaps(newStart: number, newEnd: number, busyStart: number, busyEnd: number) {
  return newStart < busyEnd && newEnd > busyStart
}

export function getAvailableSlots({
  barberId,
  date,
  serviceDuration,
  turnos,
  barberos,
  servicios,
  horarios,
}: GetAvailableSlotsParams): AvailableSlot[] {
  const barbero = barberos.find((current) => current.id === barberId)
  const horario = horarios.find((current) => current.barberoId === barberId)
  const dayIndex = getScheduleDayIndex(date)
  const daySchedule = horario?.dias[dayIndex]

  if (!barbero || !daySchedule?.activo || serviceDuration <= 0) return []

  const workStart = timeToMinutes(daySchedule.horaInicio)
  const workEnd = timeToMinutes(daySchedule.horaFin)
  const busyRanges: BusyRange[] = turnos
    .filter((turno) => turno.barberoId === barberId && turno.fecha === date && turno.hora && isBlockingTurno(turno))
    .map((turno) => ({
      start: timeToMinutes(turno.hora ?? '00:00'),
      end: timeToMinutes(getTurnoEnd(turno, servicios)),
    }))

  if (daySchedule.descansoInicio && daySchedule.descansoFin) {
    busyRanges.push({
      start: timeToMinutes(daySchedule.descansoInicio),
      end: timeToMinutes(daySchedule.descansoFin),
    })
  }

  const sortedBusyRanges = busyRanges
    .filter((range) => range.end > workStart && range.start < workEnd)
    .sort((first, second) => first.start - second.start)

  const slots: AvailableSlot[] = []
  let cursor = workStart

  sortedBusyRanges.forEach((range) => {
    const busyStart = Math.max(range.start, workStart)
    const busyEnd = Math.min(range.end, workEnd)

    while (cursor + serviceDuration <= busyStart) {
      slots.push({
        start: minutesToTime(cursor),
        end: minutesToTime(cursor + serviceDuration),
      })
      cursor += serviceDuration
    }

    cursor = Math.max(cursor, busyEnd)
  })

  while (cursor + serviceDuration <= workEnd) {
    slots.push({
      start: minutesToTime(cursor),
      end: minutesToTime(cursor + serviceDuration),
    })
    cursor += serviceDuration
  }

  return slots
}

export function createAppointment(
  params: CreateAppointmentParams,
  context: Omit<GetAvailableSlotsParams, 'barberId' | 'date' | 'serviceDuration'>,
): Turno {
  const servicio = context.servicios.find((current) => current.id === params.serviceId)
  const barbero = context.barberos.find((current) => current.id === params.barberId)

  if (!barbero) throw new Error('El barbero seleccionado no existe.')
  if (!servicio) throw new Error('El servicio seleccionado no existe.')

  const startMinutes = timeToMinutes(params.startTime)
  const endMinutes = startMinutes + servicio.duracionMinutos
  const slots = getAvailableSlots({
    ...context,
    barberId: params.barberId,
    date: params.date,
    serviceDuration: servicio.duracionMinutos,
  })
  const selectedSlot = slots.find((slot) => slot.start === params.startTime)

  if (!selectedSlot) throw new Error('El horario seleccionado ya no está disponible.')

  const hasOverlap = context.turnos
    .filter(
      (turno) =>
        turno.barberoId === params.barberId &&
        turno.fecha === params.date &&
        turno.hora &&
        isBlockingTurno(turno),
    )
    .some((turno) => overlaps(startMinutes, endMinutes, timeToMinutes(turno.hora ?? '00:00'), timeToMinutes(getTurnoEnd(turno, context.servicios))))

  if (hasOverlap) throw new Error('El turno se superpone con otro turno del barbero.')

  return {
    id: `t-${Date.now()}`,
    clientId: params.clientId,
    sucursalId: params.sucursalId ?? barbero.sucursalId,
    fecha: params.date,
    hora: params.startTime,
    horaFin: minutesToTime(endMinutes),
    barberoId: params.barberId,
    servicioId: params.serviceId,
    clienteNombre: params.clienteNombre,
    clienteTelefono: params.clienteTelefono,
    estado: 'PENDIENTE',
    esFijo: false,
    creadoPor: params.barberId,
  }
}

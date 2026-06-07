import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Barbero, HorarioSemanal, Servicio, SucursalId, Turno, TurnoFijo } from '../../../types'
import { getAvailableSlots } from '../lib/appointments'

type Props = {
  isOpen: boolean
  onClose: () => void
  onGuardar: (turnoFijo: Omit<TurnoFijo, 'id' | 'proximaFecha'>) => void
  barberos: Barbero[]
  servicios: Servicio[]
  externalError?: string | null
  horarios: HorarioSemanal[]
  turnos: Turno[]
  turnosFijos: TurnoFijo[]
}

type FormState = {
  clienteNombre: string
  clienteTelefono: string
  barberoId: string
  servicioId: string
  hora: string
  sucursalId: SucursalId
  fechaInicio: string
  cadaDias: number | ''
}

const PRESETS = [
  { label: 'Semanal', dias: 7 },
  { label: 'Quincenal', dias: 14 },
  { label: 'Cada 3 sem.', dias: 21 },
  { label: 'Mensual', dias: 28 },
]

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function generarFechas(fechaInicio: string, cadaDias: number, mesesAdelante = 3): string[] {
  const fechas: string[] = []
  const inicio = new Date(`${fechaInicio}T00:00:00`)
  const fin = new Date(inicio.getFullYear(), inicio.getMonth() + mesesAdelante, inicio.getDate())

  const cursor = new Date(inicio)
  while (cursor <= fin) {
    fechas.push(toDateKey(cursor))
    cursor.setDate(cursor.getDate() + cadaDias)
  }
  return fechas
}

export function ModalNuevoTurnoFijo({ isOpen, onClose, onGuardar, barberos, servicios, externalError, horarios, turnos, turnosFijos }: Props) {
  const activeBarberos = barberos.filter((b) => b.activo ?? false)
  const activeServicios = servicios.filter((s) => s.activo ?? true)
  const hoy = toDateKey(new Date())

  const initialForm: FormState = {
    clienteNombre: '',
    clienteTelefono: '',
    barberoId: activeBarberos[0]?.id ?? '',
    servicioId: activeServicios[0]?.id ?? '',
    hora: '',
    sucursalId: 's1',
    fechaInicio: hoy,
    cadaDias: '',
  }

  const [form, setForm] = useState<FormState>(initialForm)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setForm({ ...initialForm, barberoId: activeBarberos[0]?.id ?? '', servicioId: activeServicios[0]?.id ?? '' })
    setError(null)
  }, [isOpen])

  const selectedService = useMemo(
    () => servicios.find((s) => s.id === form.servicioId),
    [servicios, form.servicioId],
  )

  const availableSlots = useMemo(() => {
    if (!form.barberoId || !form.fechaInicio || !selectedService) return []
    return getAvailableSlots({
      barberId: form.barberoId,
      date: form.fechaInicio,
      serviceDuration: selectedService.duracionMinutos,
      turnos,
      turnosFijos,
      barberos,
      servicios,
      horarios,
    })
  }, [form.barberoId, form.fechaInicio, selectedService, turnos, turnosFijos, barberos, servicios, horarios])

  useEffect(() => {
    if (!isOpen) return
    setForm((current) => {
      const stillAvailable = availableSlots.some((slot) => slot.start === current.hora)
      if (stillAvailable) return current
      return { ...current, hora: availableSlots[0]?.start ?? '' }
    })
  }, [availableSlots, isOpen])

  if (!isOpen) return null

  const fechasGeneradas =
    form.fechaInicio && form.cadaDias !== '' && form.cadaDias >= 1
      ? generarFechas(form.fechaInicio, form.cadaDias)
      : []

  const diaSemana = form.fechaInicio
    ? (new Date(`${form.fechaInicio}T00:00:00`).getDay() + 6) % 7
    : 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const clienteNombre = form.clienteNombre.trim()
    if (!clienteNombre) { setError('El nombre del cliente es obligatorio.'); return }
    if (!form.barberoId) { setError('Seleccioná un barbero.'); return }
    if (!form.servicioId) { setError('Seleccioná un servicio.'); return }
    if (!form.hora) { setError('Seleccioná un horario disponible.'); return }
    if (!form.fechaInicio) { setError('Seleccioná la fecha del primer turno.'); return }
    if (form.cadaDias === '' || form.cadaDias < 1) { setError('Indicá cada cuántos días se repite.'); return }
    if (fechasGeneradas.length === 0) { setError('No se generaron fechas válidas.'); return }

    onGuardar({
      sucursalId: form.sucursalId,
      barberoId: form.barberoId,
      servicioId: form.servicioId,
      clienteNombre,
      clienteTelefono: form.clienteTelefono.trim() || undefined,
      diaSemana,
      hora: form.hora,
      fechasAgendadas: [...fechasGeneradas].sort(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form
        className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl border border-[#2f2f2f] bg-[#050505] text-white shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="border-b border-[#242424] px-6 py-5">
          <h2 className="text-2xl font-bold">Nuevo Turno Fijo</h2>
          <p className="mt-1 text-sm text-[#a0a0a0]">
            Indicá desde cuándo y cada cuántos días — se genera automáticamente por 3 meses.
          </p>
        </div>

        <div className="max-h-[68vh] space-y-4 overflow-y-auto px-6 py-5">
          <input
            className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
            onChange={(e) => setForm((f) => ({ ...f, clienteNombre: e.target.value }))}
            placeholder="Nombre completo del cliente"
            required
            value={form.clienteNombre}
          />
          <input
            className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
            onChange={(e) => setForm((f) => ({ ...f, clienteTelefono: e.target.value }))}
            placeholder="Teléfono (opcional)"
            type="tel"
            value={form.clienteTelefono}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
              onChange={(e) => setForm((f) => ({ ...f, barberoId: e.target.value }))}
              value={form.barberoId}
            >
              {activeBarberos.map((b) => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
              onChange={(e) => setForm((f) => ({ ...f, servicioId: e.target.value }))}
              value={form.servicioId}
            >
              {activeServicios.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          <select
            className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
            onChange={(e) => setForm((f) => ({ ...f, sucursalId: e.target.value as SucursalId }))}
            value={form.sucursalId}
          >
            <option value="s1">Sucursal 1</option>
            <option value="s2">Sucursal 2</option>
          </select>

          {/* Fecha de inicio */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-[#a0a0a0]">
              Primer turno
            </label>
            <input
              className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
              min={hoy}
              onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))}
              type="date"
              value={form.fechaInicio}
            />
          </div>

          {/* Selector de horario */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#a0a0a0]">
              Horario disponible
              {form.hora ? <span className="ml-2 rounded-full bg-[#f5c518] px-2 py-0.5 text-black normal-case">{form.hora}</span> : null}
            </label>
            {!form.barberoId || !form.fechaInicio || !selectedService ? (
              <p className="text-sm text-[#a0a0a0]">Seleccioná barbero, servicio y fecha para ver los horarios disponibles.</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-[#a0a0a0]">Sin horarios disponibles para este barbero en la fecha seleccionada. Verificá que tenga horario configurado para ese día.</p>
            ) : (
              <div className="grid max-h-44 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                {availableSlots.map((slot) => (
                  <button
                    className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                      form.hora === slot.start
                        ? 'border-[#f5c518] bg-[#1a1700] text-[#f5c518]'
                        : 'border-[#2f2f2f] bg-[#111111] text-white hover:border-[#f5c518]/70'
                    }`}
                    key={slot.start}
                    onClick={() => setForm((f) => ({ ...f, hora: slot.start }))}
                    type="button"
                  >
                    {slot.start}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Frecuencia */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#a0a0a0]">
              Repetir cada (días)
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    form.cadaDias === p.dias
                      ? 'border-[#f5c518] bg-[#1a1700] text-[#f5c518]'
                      : 'border-[#2f2f2f] bg-[#111111] text-[#a0a0a0] hover:text-white'
                  }`}
                  key={p.dias}
                  onClick={() => setForm((f) => ({ ...f, cadaDias: p.dias }))}
                  type="button"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                className="w-28 rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white [appearance:textfield]"
                min={1}
                onChange={(e) => {
                  const v = parseInt(e.target.value)
                  setForm((f) => ({ ...f, cadaDias: isNaN(v) ? '' : v }))
                }}
                placeholder="Ej: 20"
                type="number"
                value={form.cadaDias}
              />
              <span className="text-sm text-[#a0a0a0]">días entre cada turno</span>
            </div>
          </div>

          {/* Preview */}
          {fechasGeneradas.length > 0 ? (
            <div className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm">
              <p className="font-bold text-[#f5c518]">
                {fechasGeneradas.length} turnos generados para los próximos 3 meses
              </p>
              <p className="mt-1 text-[#a0a0a0]">
                Cada {form.cadaDias} días · Primer turno: {form.fechaInicio} · Último: {fechasGeneradas[fechasGeneradas.length - 1]}
              </p>
            </div>
          ) : null}

          {externalError ? <p className="text-sm font-bold text-red-300">{externalError}</p> : null}
          {error ? <p className="text-sm font-bold text-red-300">{error}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[#242424] bg-[#0a0a0a] px-6 py-5">
          <button className="rounded-lg bg-[#3f3f3f] px-4 py-3" onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className="rounded-lg bg-[#f5c518] px-4 py-3 font-bold text-black disabled:opacity-50"
            disabled={fechasGeneradas.length === 0 || !form.hora}
            type="submit"
          >
            Guardar Turno Fijo
          </button>
        </div>
      </form>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Barbero, Servicio, SucursalId, Turno, TurnoFijo } from '../../../types'
import { SelectorFechas } from './SelectorFechas'

type Props = {
  isOpen: boolean
  onClose: () => void
  turnoFijo: TurnoFijo
  onGuardar: (id: string, datos: Partial<TurnoFijo>, cascadeToFutureTurnos: boolean) => void
  barberos: Barbero[]
  servicios: Servicio[]
  turnos: Turno[]
}

type FormState = {
  clienteNombre: string
  clienteTelefono: string
  barberoId: string
  servicioId: string
  hora: string
  sucursalId: SucursalId
}

function getInitialForm(turnoFijo: TurnoFijo): FormState {
  return {
    clienteNombre: turnoFijo.clienteNombre,
    clienteTelefono: turnoFijo.clienteTelefono ?? '',
    barberoId: turnoFijo.barberoId,
    servicioId: turnoFijo.servicioId,
    hora: turnoFijo.hora,
    sucursalId: turnoFijo.sucursalId,
  }
}

function getScheduleDayIndex(dateKey: string) {
  return (new Date(`${dateKey}T00:00:00`).getDay() + 6) % 7
}

export function ModalEditarTurnoFijo({ isOpen, onClose, turnoFijo, onGuardar, barberos, servicios, turnos }: Props) {
  const activeBarberos = barberos.filter((barbero) => barbero.activo ?? false)
  const activeServicios = servicios.filter((servicio) => servicio.activo ?? true)
  const [form, setForm] = useState<FormState>(() => getInitialForm(turnoFijo))
  const [fechasAgendadas, setFechasAgendadas] = useState<string[]>(() => turnoFijo.fechasAgendadas)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'confirm-cascade'>('form')
  const [pendingDatos, setPendingDatos] = useState<Partial<TurnoFijo> | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setForm(getInitialForm(turnoFijo))
    setFechasAgendadas(turnoFijo.fechasAgendadas)
    setError(null)
    setStep('form')
    setPendingDatos(null)
  }, [isOpen, turnoFijo])

  const futurePendingCount = useMemo(() => {
    if (!isOpen) return 0
    const hoy = new Date().toISOString().slice(0, 10)
    return turnos.filter(
      (t) =>
        t.turnoFijoId === turnoFijo.id &&
        (t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO') &&
        (t.fecha ?? '') >= hoy,
    ).length
  }, [turnos, turnoFijo.id, isOpen])

  if (!isOpen) return null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const clienteNombre = form.clienteNombre.trim()

    if (!clienteNombre) { setError('El nombre del cliente es obligatorio.'); return }
    if (!form.barberoId) { setError('Selecciona un barbero.'); return }
    if (!form.servicioId) { setError('Selecciona un servicio.'); return }
    if (!form.hora) { setError('Selecciona una hora.'); return }
    if (fechasAgendadas.length === 0) { setError('Selecciona al menos una fecha.'); return }

    const fechasOrdenadas = [...fechasAgendadas].sort()
    const hoy = new Date().toISOString().slice(0, 10)
    const proximaFecha = fechasOrdenadas.filter((fecha) => fecha >= hoy)[0] ?? fechasOrdenadas[0]

    const datos: Partial<TurnoFijo> = {
      sucursalId: form.sucursalId,
      barberoId: form.barberoId,
      servicioId: form.servicioId,
      clienteNombre,
      clienteTelefono: form.clienteTelefono.trim() || undefined,
      diaSemana: getScheduleDayIndex(proximaFecha),
      hora: form.hora,
      fechasAgendadas: fechasOrdenadas,
      proximaFecha,
    }

    if (futurePendingCount > 0) {
      setPendingDatos(datos)
      setStep('confirm-cascade')
    } else {
      onGuardar(turnoFijo.id, datos, false)
    }
  }

  function confirmCascade(cascade: boolean) {
    if (!pendingDatos) return
    onGuardar(turnoFijo.id, pendingDatos, cascade)
    setStep('form')
    setPendingDatos(null)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      {step === 'confirm-cascade' ? (
        <section className="w-full max-w-md rounded-xl border border-[#2f2f2f] bg-[#050505] text-white shadow-2xl">
          <div className="border-b border-[#242424] px-6 py-5">
            <h2 className="text-2xl font-bold">¿Actualizar turnos vinculados?</h2>
            <p className="mt-1 text-sm text-[#a0a0a0]">Los cambios en la recurrencia fueron guardados.</p>
          </div>
          <div className="px-6 py-5 text-sm text-[#a0a0a0]">
            <p>
              Hay{' '}
              <span className="font-bold text-white">
                {futurePendingCount} turno{futurePendingCount !== 1 ? 's' : ''} futuros pendientes
              </span>{' '}
              vinculados a esta recurrencia.
            </p>
            <p className="mt-2">
              ¿Querés aplicar también los cambios de barbero, servicio, cliente y hora a esos turnos individuales?
            </p>
          </div>
          <div className="space-y-3 border-t border-[#242424] bg-[#0a0a0a] px-6 py-5">
            <button
              className="w-full rounded-lg bg-[#f5c518] px-4 py-3 font-bold text-black transition hover:bg-[#f5c518]/90"
              onClick={() => confirmCascade(true)}
              type="button"
            >
              Actualizar también los {futurePendingCount} turnos
            </button>
            <button
              className="w-full rounded-lg bg-[#2f2f2f] px-4 py-3 font-medium text-white transition hover:bg-[#3f3f3f]"
              onClick={() => confirmCascade(false)}
              type="button"
            >
              Solo la recurrencia
            </button>
            <button
              className="w-full rounded-lg px-4 py-2 text-sm text-[#a0a0a0] transition hover:text-white"
              onClick={() => setStep('form')}
              type="button"
            >
              ← Volver a editar
            </button>
          </div>
        </section>
      ) : (
        <form
          className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl border border-[#2f2f2f] bg-[#050505] text-white shadow-2xl"
          onSubmit={handleSubmit}
        >
          <div className="border-b border-[#242424] px-6 py-5">
            <h2 className="text-2xl font-bold">Editar Turno Fijo</h2>
            <p className="mt-1 text-sm text-[#a0a0a0]">
              Los cambios afectan solo la recurrencia futura.
            </p>
          </div>

          <div className="max-h-[68vh] space-y-4 overflow-y-auto px-6 py-5">
            <input
              className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
              onChange={(event) => setForm((current) => ({ ...current, clienteNombre: event.target.value }))}
              placeholder="Nombre completo del cliente"
              required
              value={form.clienteNombre}
            />
            <input
              className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
              onChange={(event) => setForm((current) => ({ ...current, clienteTelefono: event.target.value }))}
              placeholder="Telefono"
              type="tel"
              value={form.clienteTelefono}
            />
            <select
              className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
              onChange={(event) => setForm((current) => ({ ...current, barberoId: event.target.value }))}
              value={form.barberoId}
            >
              {activeBarberos.map((barbero) => (
                <option key={barbero.id} value={barbero.id}>
                  {barbero.nombre}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
              onChange={(event) => setForm((current) => ({ ...current, servicioId: event.target.value }))}
              value={form.servicioId}
            >
              {activeServicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre}
                </option>
              ))}
            </select>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setForm((current) => ({ ...current, hora: event.target.value }))}
                type="time"
                value={form.hora}
              />
              <select
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white"
                onChange={(event) => setForm((current) => ({ ...current, sucursalId: event.target.value as SucursalId }))}
                value={form.sucursalId}
              >
                <option value="s1">Sucursal 1</option>
                <option value="s2">Sucursal 2</option>
              </select>
            </div>
            <SelectorFechas
              fechaMinima={new Date().toISOString().slice(0, 10)}
              fechasSeleccionadas={fechasAgendadas}
              onChange={setFechasAgendadas}
            />
            {error ? <p className="text-sm font-bold text-red-300">{error}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-[#242424] bg-[#0a0a0a] px-6 py-5">
            <button className="rounded-lg bg-[#3f3f3f] px-4 py-3" onClick={onClose} type="button">
              Cancelar
            </button>
            <button className="rounded-lg bg-[#f5c518] px-4 py-3 font-bold text-black" type="submit">
              Guardar Cambios
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

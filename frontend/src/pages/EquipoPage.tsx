import { useState } from 'react'
import type { FormEvent } from 'react'
import { useEquipo } from '../features/equipo/hooks/useEquipo'
import type { Barbero, HorarioDia, HorarioSemanal } from '../types'

type BarberoForm = {
  nombre: string
  telefono: string
  activo: boolean
  esDueno: boolean
  porcentajeCasa: string
}

type DaySchedule = {
  day: string
  works: boolean
  start: string
  end: string
  breakStart: string
  breakEnd: string
}

const emptyForm: BarberoForm = {
  nombre: '',
  telefono: '',
  activo: true,
  esDueno: false,
  porcentajeCasa: '40',
}

const defaultSchedule: DaySchedule[] = [
  { day: 'Lunes', works: true, start: '09:00', end: '22:00', breakStart: '', breakEnd: '' },
  { day: 'Martes', works: true, start: '09:00', end: '22:00', breakStart: '', breakEnd: '' },
  { day: 'Miércoles', works: true, start: '09:00', end: '22:00', breakStart: '', breakEnd: '' },
  { day: 'Jueves', works: true, start: '09:00', end: '22:00', breakStart: '', breakEnd: '' },
  { day: 'Viernes', works: true, start: '09:00', end: '22:00', breakStart: '', breakEnd: '' },
  { day: 'Sábado', works: true, start: '09:00', end: '22:00', breakStart: '', breakEnd: '' },
  { day: 'Domingo', works: true, start: '09:00', end: '00:00', breakStart: '', breakEnd: '' },
]

function cloneDefaultSchedule() {
  return defaultSchedule.map((schedule) => ({ ...schedule }))
}

function isBarberActive(barbero: Barbero) {
  return barbero.isActive ?? barbero.activo ?? false
}

function isBarberOwner(barbero: Barbero) {
  return barbero.isOwner ?? barbero.esDueno ?? false
}

function scheduleToDraft(horario?: HorarioSemanal) {
  if (!horario) return cloneDefaultSchedule()

  return defaultSchedule.map((schedule, index) => {
    const dia = horario.dias[index]
    return {
      day: schedule.day,
      works: dia?.activo ?? schedule.works,
      start: dia?.horaInicio ?? schedule.start,
      end: dia?.horaFin ?? schedule.end,
      breakStart: dia?.descansoInicio ?? '',
      breakEnd: dia?.descansoFin ?? '',
    }
  })
}

function draftToHorario(barberoId: string, scheduleDraft: DaySchedule[]): HorarioSemanal {
  const dias: Record<number, HorarioDia> = {}

  scheduleDraft.forEach((schedule, index) => {
    dias[index] = {
      activo: schedule.works,
      horaInicio: schedule.start,
      horaFin: schedule.end,
      descansoInicio: schedule.breakStart || undefined,
      descansoFin: schedule.breakEnd || undefined,
    }
  })

  return { barberoId, dias }
}

export function EquipoPage() {
  const { barberos, horarios, agregarBarbero, actualizarBarbero, toggleActivo, actualizarHorario, eliminarBarbero } = useEquipo()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBarber, setEditingBarber] = useState<Barbero | null>(null)
  const [deletingBarber, setDeletingBarber] = useState<Barbero | null>(null)
  const [form, setForm] = useState<BarberoForm>(emptyForm)
  const [selectedScheduleBarber, setSelectedScheduleBarber] = useState<Barbero | null>(null)
  const [scheduleDraft, setScheduleDraft] = useState<DaySchedule[]>(cloneDefaultSchedule)

  function closeModal() {
    setIsModalOpen(false)
    setEditingBarber(null)
    setForm(emptyForm)
  }

  function openCreateModal() {
    setEditingBarber(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  function openEditModal(barbero: Barbero) {
    setEditingBarber(barbero)
    setForm({
      nombre: barbero.nombre,
      telefono: barbero.telefono ?? '',
      activo: isBarberActive(barbero),
      esDueno: isBarberOwner(barbero),
      porcentajeCasa: String(barbero.porcentajeCasa),
    })
    setIsModalOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nombre = form.nombre.trim()
    if (!nombre) return

    const porcentajeCasa = Number(form.porcentajeCasa)
    const payload = {
      nombre,
      telefono: form.telefono.trim() || undefined,
      activo: form.activo,
      isActive: form.activo,
      esDueno: form.esDueno,
      isOwner: form.esDueno,
      porcentajeCasa: Number.isFinite(porcentajeCasa) ? porcentajeCasa : 40,
      colorHex: '#f5c518',
      sucursalId: editingBarber?.sucursalId ?? 's1',
      fechaIngreso: editingBarber?.fechaIngreso ?? new Date().toISOString().slice(0, 10),
    }

    if (editingBarber) {
      actualizarBarbero(editingBarber.id, payload)
    } else {
      agregarBarbero(payload)
    }

    closeModal()
  }

  function openScheduleModal(barbero: Barbero) {
    setSelectedScheduleBarber(barbero)
    setScheduleDraft(scheduleToDraft(horarios.find((horario) => horario.barberoId === barbero.id)))
  }

  function closeScheduleModal() {
    setSelectedScheduleBarber(null)
    setScheduleDraft(cloneDefaultSchedule())
  }

  function updateSchedule(index: number, field: keyof DaySchedule, value: string | boolean) {
    setScheduleDraft((currentSchedule) =>
      currentSchedule.map((schedule, scheduleIndex) =>
        scheduleIndex === index ? { ...schedule, [field]: value } : schedule,
      ),
    )
  }

  function saveSchedule() {
    if (!selectedScheduleBarber) return

    actualizarHorario(draftToHorario(selectedScheduleBarber.id, scheduleDraft))
    closeScheduleModal()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-10 text-white">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-tight text-white">Gestión de Equipo</h1>
          <p className="mt-2 text-base text-[#a0a0a0]">Administra tu equipo de barberos y sus horarios</p>
        </div>

        <button
          className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-[#e5c04f] px-7 py-4 font-bold text-[#050505] transition hover:bg-[#f5c518] sm:w-auto"
          onClick={openCreateModal}
          type="button"
        >
          <span className="text-2xl leading-none text-[#7c3aed]">+</span>
          Nuevo Barbero
        </button>
      </header>

      <section className="mt-7 grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
        {barberos.map((barbero) => (
          <article
            className={`overflow-hidden rounded-xl border border-[#4f3f00] bg-[#050505] shadow-[0_18px_50px_rgba(0,0,0,0.28)] ${
              isBarberActive(barbero) ? '' : 'opacity-55'
            }`}
            key={barbero.id}
          >
            <div className="border-b border-[#242424] bg-[#171404] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-white">{barbero.nombre}</h2>
                  <p className="mt-1 text-sm text-[#a0a0a0]">
                    {barbero.telefono ? barbero.telefono : 'Sin telefono cargado'}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    aria-label={`${isBarberActive(barbero) ? 'Desactivar' : 'Activar'} ${barbero.nombre}`}
                    className={`flex h-6 w-11 items-center rounded-full px-1 transition ${
                      isBarberActive(barbero) ? 'justify-end bg-[#22c55e]' : 'justify-start bg-[#4b5563]'
                    }`}
                    onClick={() => toggleActivo(barbero.id)}
                    type="button"
                  >
                    <span className="h-4 w-4 rounded-full bg-white" />
                  </button>
                  <button
                    className="rounded-lg border border-[#2f2f2f] bg-[#0a0a0a] px-3 py-2 text-sm font-bold text-[#f5c518] transition hover:border-[#f5c518]"
                    onClick={() => openEditModal(barbero)}
                    type="button"
                  >
                    Editar
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-[#0a0a0a] px-4 py-3">
                  <span className="block text-[#a0a0a0]">Comision casa</span>
                  <strong className="mt-1 block text-white">{barbero.porcentajeCasa}%</strong>
                </div>
                <div className="rounded-lg bg-[#0a0a0a] px-4 py-3">
                  <span className="block text-[#a0a0a0]">Rol</span>
                  <strong className="mt-1 block text-white">{isBarberOwner(barbero) ? 'Dueño' : 'Barbero'}</strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 px-6 py-5">
              <button
                className="w-full rounded-md border border-[#2f2f2f] bg-[#111111] px-3 py-2 text-xs font-bold text-[#d1d5db] transition hover:border-[#3f3f3f] hover:bg-[#242424]"
                onClick={() => openScheduleModal(barbero)}
                type="button"
              >
                Horarios
              </button>
              <button
                className="w-full rounded-md border border-[#5f2d2d] bg-[#2a1618] px-3 py-2 text-xs font-bold text-[#fca5a5] transition hover:border-[#7f3b3b] hover:bg-[#351c1f]"
                onClick={() => setDeletingBarber(barbero)}
                type="button"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            className="w-full max-w-[448px] overflow-hidden rounded-lg border border-[#2f2f2f] bg-[#050505] text-white shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between border-b border-[#2f2f2f] px-6 py-6">
              <h2 className="text-2xl font-bold">{editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}</h2>
              <button
                aria-label="Cerrar modal"
                className="text-4xl font-light leading-none text-[#d1d5db] hover:text-white"
                onClick={closeModal}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <label className="block">
                <span className="font-bold">Nombre Completo *</span>
                <input
                  className="mt-2 w-full rounded-lg border border-[#6b6b6b] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#94a3b8] focus:border-[#f5c518]"
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, nombre: event.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  required
                  type="text"
                  value={form.nombre}
                />
              </label>

              <label className="block">
                <span className="font-bold">Teléfono (Opcional)</span>
                <input
                  className="mt-2 w-full rounded-lg border border-[#6b6b6b] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#94a3b8] focus:border-[#f5c518]"
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, telefono: event.target.value }))}
                  placeholder="Ej: +541112345678"
                  type="tel"
                  value={form.telefono}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-[1fr_1fr_96px] md:items-center">
                <label className="flex items-center gap-2 leading-6">
                  <input
                    checked={form.activo}
                    className="h-4 w-4 accent-[#f5c518]"
                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, activo: event.target.checked }))}
                    type="checkbox"
                  />
                  <span>Activar inmediatamente</span>
                </label>

                <label className="flex items-center gap-2 leading-6">
                  <input
                    checked={form.esDueno}
                    className="h-4 w-4 accent-[#f5c518]"
                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, esDueno: event.target.checked }))}
                    type="checkbox"
                  />
                  <span>Es el dueño (recibe 100% de sus cortes)</span>
                </label>

                <label className="block">
                  <span className="font-bold">Porcentaje para la Casa (%)</span>
                  <input
                    className="mt-2 w-full rounded-lg border border-[#6b6b6b] bg-[#111111] px-4 py-3 text-white outline-none focus:border-[#f5c518]"
                    max="100"
                    min="0"
                    onChange={(event) =>
                      setForm((currentForm) => ({ ...currentForm, porcentajeCasa: event.target.value }))
                    }
                    type="number"
                    value={form.porcentajeCasa}
                  />
                  <span className="mt-1 block text-xs text-[#6b6b6b]">El barbero recibirá el resto</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-6 pb-6">
              <button
                className="rounded-lg bg-[#3f3f3f] px-4 py-3 text-white transition hover:bg-[#6b6b6b]"
                onClick={closeModal}
                type="button"
              >
                Cancelar
              </button>
              <button className="rounded-lg bg-[#e5c04f] px-4 py-3 font-bold text-[#050505] hover:bg-[#f5c518]" type="submit">
                {editingBarber ? 'Guardar Cambios' : 'Crear Barbero'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deletingBarber ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <section className="w-full max-w-md rounded-lg border border-[#3f3f3f] bg-[#050505] p-6 text-center text-white shadow-2xl">
            <h2 className="text-2xl font-bold">Eliminar barbero</h2>
            <p className="mt-4 text-[#d1d5db]">¿Querés eliminar a "{deletingBarber.nombre}"?</p>
            <p className="mt-2 text-sm text-[#a0a0a0]">También se eliminarán sus horarios guardados en el mock.</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                className="rounded-lg bg-[#3f3f3f] px-4 py-3 font-bold text-white transition hover:bg-[#6b6b6b]"
                onClick={() => setDeletingBarber(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-[#e9282d] px-4 py-3 font-bold text-white transition hover:bg-[#dc2626]"
                onClick={() => {
                  eliminarBarbero(deletingBarber.id)
                  setDeletingBarber(null)
                }}
                type="button"
              >
                Eliminar
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedScheduleBarber ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <section className="max-h-[92vh] w-full max-w-[896px] overflow-hidden rounded-lg border border-[#6b5600] bg-[#050505] text-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#d1d5db] px-6 py-7">
              <div>
                <h2 className="text-2xl font-bold">Horarios de {selectedScheduleBarber.nombre}</h2>
                {isBarberOwner(selectedScheduleBarber) ? (
                  <p className="mt-1 text-xs text-[#f5c518]">Dueño: recibe 100% de sus cortes</p>
                ) : null}
                <p className="mt-2 text-sm text-[#a0a0a0]">Configura los días y horarios de trabajo</p>
              </div>
              <button
                aria-label="Cerrar modal de horarios"
                className="text-4xl font-light leading-none text-[#d1d5db] hover:text-white"
                onClick={closeScheduleModal}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="max-h-[62vh] space-y-3 overflow-y-auto px-6 py-6">
              {scheduleDraft.map((schedule, index) => (
                <div
                  className="grid gap-3 rounded-lg bg-[#111111] p-4 text-[#d1d5db] lg:grid-cols-[120px_112px_16px_112px_70px_112px_16px_112px] lg:items-center"
                  key={schedule.day}
                >
                  <label className="flex items-center gap-3 font-bold">
                    <input
                      checked={schedule.works}
                      className="h-5 w-5 accent-[#f5c518]"
                      onChange={(event) => updateSchedule(index, 'works', event.target.checked)}
                      type="checkbox"
                    />
                    {schedule.day}
                  </label>

                  <input
                    className="w-full min-w-[112px] rounded border border-[#3f3f3f] bg-[#050505] px-3 py-2 text-white outline-none focus:border-[#f5c518] disabled:opacity-45"
                    disabled={!schedule.works}
                    onChange={(event) => updateSchedule(index, 'start', event.target.value)}
                    type="time"
                    value={schedule.start}
                  />
                  <span className="hidden text-center text-[#a0a0a0] lg:block">a</span>
                  <input
                    className="w-full min-w-[112px] rounded border border-[#3f3f3f] bg-[#050505] px-3 py-2 text-white outline-none focus:border-[#f5c518] disabled:opacity-45"
                    disabled={!schedule.works}
                    onChange={(event) => updateSchedule(index, 'end', event.target.value)}
                    type="time"
                    value={schedule.end}
                  />

                  <span className="text-sm text-[#8b95a5]">Descanso:</span>
                  <input
                    className="w-full min-w-[112px] rounded border border-[#3f3f3f] bg-[#050505] px-3 py-2 text-white outline-none focus:border-[#f5c518] disabled:opacity-45"
                    disabled={!schedule.works}
                    onChange={(event) => updateSchedule(index, 'breakStart', event.target.value)}
                    type="time"
                    value={schedule.breakStart}
                  />
                  <span className="hidden text-center text-[#a0a0a0] lg:block">a</span>
                  <input
                    className="w-full min-w-[112px] rounded border border-[#3f3f3f] bg-[#050505] px-3 py-2 text-white outline-none focus:border-[#f5c518] disabled:opacity-45"
                    disabled={!schedule.works}
                    onChange={(event) => updateSchedule(index, 'breakEnd', event.target.value)}
                    type="time"
                    value={schedule.breakEnd}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 border-t border-[#111111] bg-[#050505] px-6 py-6">
              <button
                className="rounded-lg bg-[#3f3f3f] px-6 py-3 text-white transition hover:bg-[#6b6b6b]"
                onClick={closeScheduleModal}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-[#e5c04f] px-6 py-3 font-bold text-[#050505] transition hover:bg-[#f5c518]"
                onClick={saveSchedule}
                type="button"
              >
                Guardar Cambios
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

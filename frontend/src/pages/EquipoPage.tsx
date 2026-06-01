import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Barbero } from '../types'

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

const initialBarberos: Barbero[] = [
  {
    id: 'barbero-1',
    nombre: 'Carlos Sando',
    telefono: '+5493624000001',
    activo: true,
    esDueno: false,
    porcentajeCasa: 40,
    fotoUrl:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'barbero-2',
    nombre: 'Diego Martínez',
    telefono: '+5493624000002',
    activo: true,
    esDueno: false,
    porcentajeCasa: 40,
    fotoUrl:
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'barbero-3',
    nombre: 'Juan Pérez',
    telefono: '+5493624000003',
    activo: true,
    esDueno: false,
    porcentajeCasa: 40,
    fotoUrl:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'barbero-4',
    nombre: 'Mario',
    telefono: '+5493624000004',
    activo: false,
    esDueno: false,
    porcentajeCasa: 40,
    fotoUrl:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80',
  },
]

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

function createAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=f5c518&bold=true`
}

function cloneDefaultSchedule() {
  return defaultSchedule.map((schedule) => ({ ...schedule }))
}

export function EquipoPage() {
  const [barberos, setBarberos] = useState<Barbero[]>(initialBarberos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<BarberoForm>(emptyForm)
  const [selectedScheduleBarber, setSelectedScheduleBarber] = useState<Barbero | null>(null)
  const [scheduleDraft, setScheduleDraft] = useState<DaySchedule[]>(cloneDefaultSchedule)
  const [barberSchedules, setBarberSchedules] = useState<Record<string, DaySchedule[]>>({})

  function closeModal() {
    setIsModalOpen(false)
    setForm(emptyForm)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nombre = form.nombre.trim()
    if (!nombre) return

    const porcentajeCasa = Number(form.porcentajeCasa)
    const newBarbero: Barbero = {
      id: crypto.randomUUID(),
      nombre,
      telefono: form.telefono.trim() || undefined,
      activo: form.activo,
      esDueno: form.esDueno,
      porcentajeCasa: Number.isFinite(porcentajeCasa) ? porcentajeCasa : 40,
      fotoUrl: createAvatarUrl(nombre),
    }

    setBarberos((currentBarberos) => [newBarbero, ...currentBarberos])
    closeModal()
  }

  function openScheduleModal(barbero: Barbero) {
    setSelectedScheduleBarber(barbero)
    setScheduleDraft((barberSchedules[barbero.id] ?? cloneDefaultSchedule()).map((schedule) => ({ ...schedule })))
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

    setBarberSchedules((currentSchedules) => ({
      ...currentSchedules,
      [selectedScheduleBarber.id]: scheduleDraft.map((schedule) => ({ ...schedule })),
    }))
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
          className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-[#e5c04f] px-7 py-4 font-bold text-[#111827] transition hover:bg-[#f5c518] sm:w-auto"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <span className="text-2xl leading-none text-[#7c3aed]">+</span>
          Nuevo Barbero
        </button>
      </header>

      <section className="mt-7 grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
        {barberos.map((barbero) => (
          <article
            className={`rounded-lg border border-[#4f3f00] bg-[#171404] px-6 py-6 ${
              barbero.activo ? '' : 'opacity-55'
            }`}
            key={barbero.id}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  alt={`Foto de ${barbero.nombre}`}
                  className="h-28 w-28 rounded-full border-4 border-[#d1d5db] object-cover"
                  src={barbero.fotoUrl}
                />
                <button
                  aria-label={`Cambiar foto de ${barbero.nombre}`}
                  className="absolute bottom-1 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#d1ad32] text-sm text-[#111827]"
                  type="button"
                >
                  📷
                </button>
              </div>

              <h2 className="mt-5 text-center text-xl font-bold text-white">
                {barbero.nombre} <span className="ml-1 text-base">✏️</span>
              </h2>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-md bg-[#111827] px-4 py-3">
              <span className="text-sm text-[#a0a0a0]">Estado</span>
              <button
                aria-label={`${barbero.activo ? 'Desactivar' : 'Activar'} ${barbero.nombre}`}
                className={`flex h-6 w-11 items-center rounded-full px-1 transition ${
                  barbero.activo ? 'justify-end bg-[#22c55e]' : 'justify-start bg-[#4b5563]'
                }`}
                onClick={() =>
                  setBarberos((currentBarberos) =>
                    currentBarberos.map((currentBarbero) =>
                      currentBarbero.id === barbero.id
                        ? { ...currentBarbero, activo: !currentBarbero.activo }
                        : currentBarbero,
                    ),
                  )
                }
                type="button"
              >
                <span className="h-4 w-4 rounded-full bg-white" />
              </button>
              <span className={`text-sm font-bold ${barbero.activo ? 'text-[#4ade80]' : 'text-[#6b7280]'}`}>
                {barbero.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <button
              className="mt-4 w-full rounded-md bg-[#2563eb] px-4 py-3 font-bold text-white transition hover:bg-[#1d4ed8]"
              onClick={() => openScheduleModal(barbero)}
              type="button"
            >
              ⏱ Editar Horarios
            </button>
          </article>
        ))}
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            className="w-full max-w-[448px] overflow-hidden rounded-lg border border-[#334155] bg-[#111827] text-white shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between border-b border-[#334155] px-6 py-6">
              <h2 className="text-2xl font-bold">Nuevo Barbero</h2>
              <button
                aria-label="Cerrar modal"
                className="text-4xl font-light leading-none text-[#bfdbfe] hover:text-white"
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
                  className="mt-2 w-full rounded-lg border border-[#64748b] bg-[#1f2937] px-4 py-3 text-white outline-none placeholder:text-[#94a3b8] focus:border-[#f5c518]"
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
                  className="mt-2 w-full rounded-lg border border-[#64748b] bg-[#1f2937] px-4 py-3 text-white outline-none placeholder:text-[#94a3b8] focus:border-[#f5c518]"
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
                    className="mt-2 w-full rounded-lg border border-[#64748b] bg-[#1f2937] px-4 py-3 text-white outline-none focus:border-[#f5c518]"
                    max="100"
                    min="0"
                    onChange={(event) =>
                      setForm((currentForm) => ({ ...currentForm, porcentajeCasa: event.target.value }))
                    }
                    type="number"
                    value={form.porcentajeCasa}
                  />
                  <span className="mt-1 block text-xs text-[#64748b]">El barbero recibirá el resto</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-6 pb-6">
              <button
                className="rounded-lg bg-[#475569] px-4 py-3 text-white transition hover:bg-[#64748b]"
                onClick={closeModal}
                type="button"
              >
                Cancelar
              </button>
              <button className="rounded-lg bg-[#e5c04f] px-4 py-3 font-bold text-[#111827] hover:bg-[#f5c518]" type="submit">
                Crear Barbero
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {selectedScheduleBarber ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <section className="max-h-[92vh] w-full max-w-[896px] overflow-hidden rounded-lg border border-[#6b5600] bg-[#050505] text-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#d1d5db] px-6 py-7">
              <div>
                <h2 className="text-2xl font-bold">Horarios de {selectedScheduleBarber.nombre}</h2>
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
                  className="grid gap-3 rounded-lg bg-[#1f2937] p-4 text-[#d1d5db] lg:grid-cols-[120px_112px_16px_112px_70px_112px_16px_112px] lg:items-center"
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
                    className="w-full min-w-[112px] rounded border border-[#475569] bg-[#111827] px-3 py-2 text-white outline-none focus:border-[#f5c518] disabled:opacity-45"
                    disabled={!schedule.works}
                    onChange={(event) => updateSchedule(index, 'start', event.target.value)}
                    type="time"
                    value={schedule.start}
                  />
                  <span className="hidden text-center text-[#a0a0a0] lg:block">a</span>
                  <input
                    className="w-full min-w-[112px] rounded border border-[#475569] bg-[#111827] px-3 py-2 text-white outline-none focus:border-[#f5c518] disabled:opacity-45"
                    disabled={!schedule.works}
                    onChange={(event) => updateSchedule(index, 'end', event.target.value)}
                    type="time"
                    value={schedule.end}
                  />

                  <span className="text-sm text-[#8b95a5]">Descanso:</span>
                  <input
                    className="w-full min-w-[112px] rounded border border-[#475569] bg-[#111827] px-3 py-2 text-white outline-none focus:border-[#f5c518] disabled:opacity-45"
                    disabled={!schedule.works}
                    onChange={(event) => updateSchedule(index, 'breakStart', event.target.value)}
                    type="time"
                    value={schedule.breakStart}
                  />
                  <span className="hidden text-center text-[#a0a0a0] lg:block">a</span>
                  <input
                    className="w-full min-w-[112px] rounded border border-[#475569] bg-[#111827] px-3 py-2 text-white outline-none focus:border-[#f5c518] disabled:opacity-45"
                    disabled={!schedule.works}
                    onChange={(event) => updateSchedule(index, 'breakEnd', event.target.value)}
                    type="time"
                    value={schedule.breakEnd}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 border-t border-[#1f2937] bg-[#111827] px-6 py-6">
              <button
                className="rounded-lg bg-[#475569] px-6 py-3 text-white transition hover:bg-[#64748b]"
                onClick={closeScheduleModal}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-[#e5c04f] px-6 py-3 font-bold text-[#111827] transition hover:bg-[#f5c518]"
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

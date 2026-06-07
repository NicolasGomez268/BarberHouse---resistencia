import { AlertTriangle, Eye, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServicios } from '../features/servicios/hooks/useServicios'
import type { Servicio } from '../types'

type ServicioForm = {
  nombre: string
  descripcion: string
  precio: string
  duracionMinutos: string
  activo: boolean
}

const emptyForm: ServicioForm = {
  nombre: '',
  descripcion: '',
  precio: '5000',
  duracionMinutos: '30',
  activo: true,
}

function formatPrice(price: number) {
  return `$${new Intl.NumberFormat('es-AR').format(price)}`
}

function formFromServicio(servicio: Servicio): ServicioForm {
  return {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion ?? '',
    precio: String(servicio.precio),
    duracionMinutos: String(servicio.duracionMinutos),
    activo: servicio.activo ?? true,
  }
}

export function ServiciosPage() {
  const { servicios, agregarServicio, actualizarServicio, eliminarServicio, toggleActivo } = useServicios()
  const [form, setForm] = useState<ServicioForm>(emptyForm)
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingServicio, setDeletingServicio] = useState<Servicio | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isEditing = editingServicio !== null

  function openCreateModal() {
    setForm(emptyForm)
    setEditingServicio(null)
    setIsFormOpen(true)
  }

  function openEditModal(servicio: Servicio) {
    setForm(formFromServicio(servicio))
    setEditingServicio(servicio)
    setIsFormOpen(true)
  }

  function closeFormModal() {
    setIsFormOpen(false)
    setEditingServicio(null)
    setForm(emptyForm)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nombre = form.nombre.trim()
    if (!nombre) return

    const precio = Number(form.precio)
    const duracionMinutos = Number(form.duracionMinutos)
    const payload = {
      nombre,
      descripcion: form.descripcion.trim(),
      precio: Number.isFinite(precio) ? precio : 0,
      duracionMinutos: Number.isFinite(duracionMinutos) ? duracionMinutos : 0,
      activo: form.activo,
    }

    if (editingServicio) {
      actualizarServicio(editingServicio.id, payload)
    } else {
      agregarServicio(payload)
    }

    closeFormModal()
  }

  function confirmDelete() {
    if (!deletingServicio) return

    try {
      eliminarServicio(deletingServicio.id)
      setDeletingServicio(null)
      setDeleteError(null)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'No se pudo eliminar el servicio')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-10 text-white">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-tight text-white">Gestión de Servicios</h1>
          <p className="mt-2 text-base text-[#a0a0a0]">Administra los servicios que ofrece la barbería</p>
        </div>

        <button
          className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-[#e5c04f] px-7 py-4 font-bold text-[#050505] transition hover:bg-[#f5c518] sm:w-auto"
          onClick={openCreateModal}
          type="button"
        >
          <Plus className="h-6 w-6 text-[#7c3aed]" />
          Nuevo Servicio
        </button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {servicios.map((servicio) => (
          <article
            className="rounded-lg border border-[#4f3f00] bg-[#171404] p-6"
            key={servicio.id}
          >
            <div className="flex items-center justify-between gap-4">
              <button
                className={`rounded-full px-3 py-1 text-sm font-bold transition hover:opacity-80 ${
                  (servicio.activo ?? true) ? 'bg-[#064e2a] text-[#4ade80]' : 'bg-[#333333] text-[#a0a0a0]'
                }`}
                onClick={() => toggleActivo(servicio.id)}
                title={(servicio.activo ?? true) ? 'Clic para desactivar' : 'Clic para activar'}
                type="button"
              >
                {(servicio.activo ?? true) ? '✓ Activo' : '✕ Inactivo'}
              </button>
              <Eye className="h-5 w-5 text-[#d1d5db]" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">{servicio.nombre}</h2>
            <p className="mt-2 min-h-[44px] text-sm leading-6 text-[#a0a0a0]">{servicio.descripcion}</p>

            <div className="mt-5 flex items-end justify-between gap-4">
              <p className="text-2xl font-bold text-white">{formatPrice(servicio.precio)}</p>
              <div className="text-right">
                <p className="text-sm text-[#a0a0a0]">Duración</p>
                <p className="font-bold text-white">{servicio.duracionMinutos} min</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-[1fr_54px] gap-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2a2a2a] px-4 py-3 font-bold text-white transition hover:bg-[#3a3a3a]"
                onClick={() => openEditModal(servicio)}
                type="button"
              >
                <Pencil className="h-5 w-5 text-[#fb923c]" />
                Editar
              </button>
              <button
                aria-label={`Eliminar ${servicio.nombre}`}
                className="inline-flex items-center justify-center rounded-lg bg-[#e9282d] px-4 py-3 text-white transition hover:bg-[#dc2626]"
                onClick={() => {
                  setDeleteError(null)
                  setDeletingServicio(servicio)
                }}
                type="button"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </article>
        ))}
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            className="max-h-[92vh] w-full max-w-[448px] overflow-y-auto rounded-lg border border-[#6b5600] bg-[#0b0b0d] p-6 text-white shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
              <button
                aria-label="Cerrar modal"
                className="text-[#d1d5db] transition hover:text-white"
                onClick={closeFormModal}
                type="button"
              >
                <X className="h-7 w-7" />
              </button>
            </div>

            <div className="mt-7 space-y-5">
              <label className="block">
                <span className="font-bold">
                  Nombre <span className="text-red-400">*</span>
                </span>
                <input
                  className="mt-2 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#94a3b8] focus:border-[#f5c518]"
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, nombre: event.target.value }))}
                  placeholder="Ej: Corte de Cabello"
                  required
                  type="text"
                  value={form.nombre}
                />
              </label>

              <label className="block">
                <span className="font-bold">Descripción (opcional)</span>
                <textarea
                  className="mt-2 min-h-[92px] w-full resize-none rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#94a3b8] focus:border-[#f5c518]"
                  onChange={(event) =>
                    setForm((currentForm) => ({ ...currentForm, descripcion: event.target.value }))
                  }
                  placeholder="Descripción del servicio..."
                  value={form.descripcion}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="font-bold">
                    Precio ($) <span className="text-red-400">*</span>
                  </span>
                  <input
                    className="mt-2 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#94a3b8] focus:border-[#f5c518]"
                    min="0"
                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, precio: event.target.value }))}
                    required
                    type="number"
                    value={form.precio}
                  />
                </label>

                <label className="block">
                  <span className="font-bold">
                    Duración (min) <span className="text-red-400">*</span>
                  </span>
                  <input
                    className="mt-2 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#94a3b8] focus:border-[#f5c518]"
                    min="1"
                    onChange={(event) =>
                      setForm((currentForm) => ({ ...currentForm, duracionMinutos: event.target.value }))
                    }
                    required
                    type="number"
                    value={form.duracionMinutos}
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 font-bold">
                <input
                  checked={form.activo}
                  className="h-5 w-5 accent-[#f5c518]"
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, activo: event.target.checked }))}
                  type="checkbox"
                />
                Servicio activo
              </label>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                className="rounded-lg bg-[#3f3f3f] px-4 py-3 font-bold text-white transition hover:bg-[#6b6b6b]"
                onClick={closeFormModal}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-[#e5c04f] px-4 py-3 font-bold text-[#050505] transition hover:bg-[#f5c518]"
                type="submit"
              >
                {isEditing ? 'Guardar Cambios' : 'Crear Servicio'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deletingServicio ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <section className="w-full max-w-[448px] rounded-lg border border-[#3f3f3f] bg-[#050505] p-6 text-center text-white shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#e5c04f] bg-[#e5c04f]/20 text-[#e5c04f]">
              <AlertTriangle className="h-9 w-9" />
            </div>
            <h2 className="mt-5 text-xl font-bold">Eliminar servicio</h2>
            <p className="mt-4 text-[#d1d5db]">¿Estás seguro de eliminar "{deletingServicio.nombre}"?</p>
            <p className="mt-8 text-[#d1d5db]">⚠️ Esta acción no se puede deshacer.</p>
            {deleteError ? <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm font-bold text-red-300">{deleteError}</p> : null}

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                className="rounded-lg bg-[#3f3f3f] px-4 py-3 font-bold text-white transition hover:bg-[#6b6b6b]"
                onClick={() => setDeletingServicio(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-[#e9282d] px-4 py-3 font-bold text-white transition hover:bg-[#dc2626]"
                onClick={confirmDelete}
                type="button"
              >
                Confirmar
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

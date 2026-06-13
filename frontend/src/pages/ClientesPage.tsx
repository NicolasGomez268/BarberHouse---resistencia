import { useState } from 'react'
import { useClientes } from '../features/clientes/hooks/useClientes'
import type { Cliente, ClienteDetalle, TurnoParaCliente } from '../types'

const CLIENTES_POR_PAGINA = 20

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
  NO_ASISTIO: 'No asistió',
  AUSENTE_FIJO: 'Ausente',
}

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: 'text-yellow-400',
  CONFIRMADO: 'text-blue-400',
  REALIZADO: 'text-emerald-400',
  CANCELADO: 'text-red-400',
  NO_ASISTIO: 'text-red-400',
  AUSENTE_FIJO: 'text-[#a0a0a0]',
}

function money(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function formatFecha(fecha: string) {
  if (!fecha) return '—'
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(`${fecha}T00:00:00`))
}

export function ClientesPage() {
  const { clientes, loading, error, migrarClientes } = useClientes()
  const { getClienteDetalle } = useClientes()
  const [search, setSearch] = useState('')
  const [pagina, setPagina] = useState(1)
  const [selectedCliente, setSelectedCliente] = useState<ClienteDetalle | null>(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [migrando, setMigrando] = useState(false)
  const [migracionResult, setMigracionResult] = useState<{ creados: number; actualizados: number } | null>(null)

  const normalizado = search.trim().toLowerCase()
  const filtrados = clientes.filter(
    (c) => !normalizado || c.nombre.toLowerCase().includes(normalizado) || c.telefono.includes(normalizado),
  )
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / CLIENTES_POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const paginados = filtrados.slice((paginaSegura - 1) * CLIENTES_POR_PAGINA, paginaSegura * CLIENTES_POR_PAGINA)

  async function handleVerDetalle(cliente: Cliente) {
    setLoadingDetalle(true)
    const detalle = await getClienteDetalle(cliente.id)
    setSelectedCliente(detalle)
    setLoadingDetalle(false)
  }

  async function handleMigrar() {
    setMigrando(true)
    const result = await migrarClientes()
    setMigracionResult(result)
    setMigrando(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-10 text-white">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">Historial, paquetes y datos de cada cliente.</p>
      </header>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="w-full rounded-lg border border-[#2f2f2f] bg-[#111111] px-4 py-3 text-white outline-none transition placeholder:text-[#6b6b6b] focus:border-[#f5c518] sm:max-w-sm"
          onChange={(e) => { setSearch(e.target.value); setPagina(1) }}
          placeholder="Buscar por nombre o teléfono..."
          type="search"
          value={search}
        />
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#a0a0a0]">{filtrados.length} clientes</span>
          {migracionResult ? (
            <span className="text-xs text-emerald-400">
              ✓ {migracionResult.creados} creados, {migracionResult.actualizados} actualizados
            </span>
          ) : (
            <button
              className="rounded-lg border border-[#2f2f2f] px-4 py-2 text-sm text-[#a0a0a0] transition hover:border-[#f5c518] hover:text-white disabled:opacity-50"
              disabled={migrando}
              onClick={handleMigrar}
              type="button"
            >
              {migrando ? 'Importando...' : 'Importar clientes existentes'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-[#a0a0a0]">Cargando clientes...</p>
      ) : error ? (
        <p className="py-10 text-center text-red-400">{error}</p>
      ) : filtrados.length === 0 ? (
        <div className="py-16 text-center text-[#a0a0a0]">
          <p className="text-lg font-bold">No hay clientes</p>
          <p className="mt-2 text-sm">Usá el botón "Importar clientes existentes" para cargar los clientes de los turnos anteriores.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginados.map((cliente) => (
              <button
                className="rounded-xl border border-[#2f2f2f] bg-[#0a0a0a] p-4 text-left transition hover:border-[#f5c518]/50 hover:bg-[#111111]"
                key={cliente.id}
                onClick={() => handleVerDetalle(cliente)}
                type="button"
              >
                <p className="font-bold text-white">{cliente.nombre}</p>
                <p className="mt-1 text-sm text-[#a0a0a0]">{cliente.telefono}</p>
                {cliente.ultimaVisita ? (
                  <p className="mt-2 text-xs text-[#6b6b6b]">Última visita: {formatFecha(cliente.ultimaVisita)}</p>
                ) : null}
              </button>
            ))}
          </div>

          {totalPaginas > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-[#a0a0a0]">
              <button
                className="rounded-lg bg-[#111111] px-3 py-2 disabled:opacity-40"
                disabled={paginaSegura === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                type="button"
              >
                Anterior
              </button>
              <span>Página {paginaSegura} de {totalPaginas}</span>
              <button
                className="rounded-lg bg-[#111111] px-3 py-2 disabled:opacity-40"
                disabled={paginaSegura === totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                type="button"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </>
      )}

      {/* Modal detalle */}
      {(selectedCliente || loadingDetalle) ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-10">
          <div className="w-full max-w-2xl rounded-xl border border-[#2f2f2f] bg-[#050505] text-white shadow-2xl">
            {loadingDetalle ? (
              <div className="p-8 text-center text-[#a0a0a0]">Cargando...</div>
            ) : selectedCliente ? (
              <ClienteDetalleView
                detalle={selectedCliente}
                onClose={() => setSelectedCliente(null)}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ClienteDetalleView({ detalle, onClose }: { detalle: ClienteDetalle; onClose: () => void }) {
  const { cliente, turnos, paquetes, stats } = detalle
  const [tabActiva, setTabActiva] = useState<'turnos' | 'paquetes'>('turnos')

  const paquetesActivos = paquetes.filter((p) => p.activo)
  const paquetesInactivos = paquetes.filter((p) => !p.activo)

  return (
    <>
      <div className="flex items-start justify-between border-b border-[#2f2f2f] px-6 py-5">
        <div>
          <h2 className="text-2xl font-bold">{cliente.nombre}</h2>
          <a
            className="mt-1 text-sm text-[#a0a0a0] hover:text-[#f5c518]"
            href={`https://wa.me/54${cliente.telefono.replace(/\D/g, '')}`}
            rel="noreferrer"
            target="_blank"
          >
            {cliente.telefono}
          </a>
        </div>
        <button
          className="rounded-lg bg-[#111111] px-3 py-2 text-sm text-[#a0a0a0] hover:text-white"
          onClick={onClose}
          type="button"
        >
          Cerrar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 border-b border-[#2f2f2f] px-6 py-4 sm:grid-cols-4">
        <StatBox label="Turnos totales" value={String(stats.totalTurnos)} />
        <StatBox label="Realizados" value={String(stats.turnosRealizados)} />
        <StatBox label="Total gastado" value={money(stats.totalGastado)} />
        <StatBox label="Paquetes activos" value={String(stats.paquetesActivos)} accent={stats.paquetesActivos > 0} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#2f2f2f] px-6">
        {(['turnos', 'paquetes'] as const).map((tab) => (
          <button
            className={`py-3 px-4 text-sm font-bold transition ${
              tabActiva === tab
                ? 'border-b-2 border-[#f5c518] text-white'
                : 'text-[#a0a0a0] hover:text-white'
            }`}
            key={tab}
            onClick={() => setTabActiva(tab)}
            type="button"
          >
            {tab === 'turnos' ? `Turnos (${turnos.length})` : `Paquetes (${paquetes.length})`}
          </button>
        ))}
      </div>

      <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
        {tabActiva === 'turnos' ? (
          turnos.length === 0 ? (
            <p className="py-6 text-center text-[#a0a0a0]">Sin turnos registrados.</p>
          ) : (
            <div className="space-y-2">
              {turnos.map((turno) => (
                <TurnoRow key={turno.id} turno={turno} />
              ))}
            </div>
          )
        ) : (
          <>
            {paquetesActivos.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-400">Activos</p>
                <div className="space-y-2">
                  {paquetesActivos.map((p) => <PaqueteRow key={p.id} paquete={p} />)}
                </div>
              </div>
            ) : null}
            {paquetesInactivos.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6b6b6b]">Completados</p>
                <div className="space-y-2">
                  {paquetesInactivos.map((p) => <PaqueteRow key={p.id} paquete={p} />)}
                </div>
              </div>
            ) : null}
            {paquetes.length === 0 ? (
              <p className="py-6 text-center text-[#a0a0a0]">Sin paquetes registrados.</p>
            ) : null}
          </>
        )}
      </div>
    </>
  )
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-[#111111] p-3">
      <p className="text-xs text-[#6b6b6b]">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accent ? 'text-[#f5c518]' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function TurnoRow({ turno }: { turno: TurnoParaCliente }) {
  const color = ESTADO_COLOR[turno.estado] ?? 'text-[#a0a0a0]'
  const label = ESTADO_LABEL[turno.estado] ?? turno.estado
  return (
    <div className="grid grid-cols-[80px_minmax(0,1fr)_90px] gap-2 rounded-lg bg-[#111111] px-3 py-2.5 text-sm">
      <span className="text-[#a0a0a0]">{formatFecha(turno.fecha)}</span>
      <div className="min-w-0">
        <p className="truncate font-bold">{turno.servicioNombre}</p>
        <p className="truncate text-xs text-[#6b6b6b]">{turno.barberoNombre}</p>
      </div>
      <span className={`text-right text-xs font-bold ${color}`}>{label}</span>
    </div>
  )
}

function PaqueteRow({ paquete }: { paquete: { id: string; fecha: string; cantidadTotal: number; cantidadUsada: number; precioTotal: number; metodoPago: string; activo: boolean } }) {
  const restantes = paquete.cantidadTotal - paquete.cantidadUsada
  return (
    <div className="rounded-lg bg-[#111111] px-3 py-2.5 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-bold">{paquete.cantidadTotal} turnos · {money(paquete.precioTotal)}</span>
        <span className={`text-xs font-bold ${paquete.activo ? 'text-emerald-400' : 'text-[#6b6b6b]'}`}>
          {paquete.activo ? `${restantes} restantes` : 'Completado'}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-[#6b6b6b]">
        <span>{formatFecha(paquete.fecha)}</span>
        <span>{paquete.metodoPago}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#2f2f2f]">
        <div
          className="h-full rounded-full bg-[#f5c518]"
          style={{ width: `${(paquete.cantidadUsada / paquete.cantidadTotal) * 100}%` }}
        />
      </div>
    </div>
  )
}

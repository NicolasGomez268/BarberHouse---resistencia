import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CajaDiariaResumen, CajaMovimiento, MetodoPago, MetodoPagoCaja } from '../../../types'

const methods: MetodoPagoCaja[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA']
const ITEMS_POR_PAGINA = 10

function money(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function methodLabel(method: MetodoPago) {
  if (method === 'EFECTIVO') return 'Efectivo'
  if (method === 'TRANSFERENCIA') return 'Transferencia'
  if (method === 'TARJETA') return 'Tarjeta'
  if (method === 'PREPAGO') return 'Prepago'
  return 'Mixto'
}

export function CajaDiaria({ data, arqueoSlot }: { data: CajaDiariaResumen; arqueoSlot?: ReactNode }) {
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  const movimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return data.movimientos
    return data.movimientos.filter((movement) => {
      if (movement.tipo === 'servicio') {
        return movement.descripcion.toLowerCase().includes(texto) || movement.detalle.toLowerCase().includes(texto)
      }
      return movement.descripcion.toLowerCase().includes(texto)
    })
  }, [busqueda, data.movimientos])

  const totalPaginas = Math.max(1, Math.ceil(movimientosFiltrados.length / ITEMS_POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const inicio = (paginaSegura - 1) * ITEMS_POR_PAGINA
  const movimientosPaginados = movimientosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA)
  const desdeMovimiento = movimientosFiltrados.length === 0 ? 0 : inicio + 1
  const hastaMovimiento = Math.min(inicio + ITEMS_POR_PAGINA, movimientosFiltrados.length)

  useEffect(() => { setPagina(1) }, [busqueda])
  useEffect(() => { setPagina((current) => Math.min(current, totalPaginas)) }, [totalPaginas])

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <PaymentTable title="Servicios por metodo de pago" totals={data.serviciosPorMetodo} />
        <PaymentTable title="Productos por metodo de pago" totals={data.productosPorMetodo} />
        <PaymentTable title="Paquetes vendidos hoy" totals={data.paquetesPorMetodo} />
      </div>

      {data.paquetesMovimientos.length > 0 ? (
        <section className="rounded-lg bg-surface p-4">
          <h3 className="font-bold">Paquetes prepago vendidos</h3>
          <div className="mt-4 space-y-3">
            {data.paquetesMovimientos.map((m) => (
              <MovementRow key={m.id} movement={m} />
            ))}
          </div>
        </section>
      ) : null}

      {arqueoSlot}

      <section className="rounded-lg bg-surface p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="font-bold">Movimientos del dia</h3>
          <input
            className="w-full rounded-lg border border-white/10 bg-background px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent md:max-w-sm"
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por cliente o barbero..."
            type="search"
            value={busqueda}
          />
        </div>

        {data.movimientos.length === 0 ? (
          <p className="mt-4 text-text-secondary">No hay movimientos registrados para esta fecha.</p>
        ) : movimientosFiltrados.length === 0 ? (
          <p className="mt-6 text-center text-text-secondary">No se encontraron movimientos</p>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              {movimientosPaginados.map((movement) => (
                <MovementRow key={movement.id} movement={movement} />
              ))}
            </div>
            {movimientosFiltrados.length > ITEMS_POR_PAGINA ? (
              <div className="mt-4 flex flex-col gap-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
                <span>Mostrando {desdeMovimiento}-{hastaMovimiento} de {movimientosFiltrados.length} movimientos</span>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg bg-surface-deep px-3 py-2 font-bold text-text-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={paginaSegura === 1} onClick={() => setPagina((current) => Math.max(1, current - 1))} type="button">Anterior</button>
                  <span className="rounded-lg bg-background px-3 py-2">Pagina {paginaSegura} de {totalPaginas}</span>
                  <button className="rounded-lg bg-surface-deep px-3 py-2 font-bold text-text-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={paginaSegura === totalPaginas} onClick={() => setPagina((current) => Math.min(totalPaginas, current + 1))} type="button">Siguiente</button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}

function PaymentTable({ title, totals }: { title: string; totals: Record<MetodoPagoCaja, number> }) {
  return (
    <section className="rounded-lg bg-surface p-4">
      <h3 className="font-bold">{title}</h3>
      <div className="mt-3 divide-y divide-white/10">
        {methods.map((method) => (
          <div className="flex justify-between gap-4 py-3" key={method}>
            <span className="truncate text-text-secondary">{methodLabel(method)}</span>
            <strong className="shrink-0">{money(totals[method])}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function MovementRow({ movement }: { movement: CajaMovimiento }) {
  const isMixto = movement.metodoPago === 'MIXTO'
  const isPrepago = movement.metodoPago === 'PREPAGO'
  const isPaquete = movement.tipo === 'paquete'
  return (
    <div className="grid gap-2 rounded-lg bg-surface-deep p-3 text-sm md:grid-cols-[70px_minmax(0,1fr)_140px_120px] md:items-center">
      <span className="font-bold text-accent">{movement.hora}</span>
      <div className="min-w-0">
        <p className="truncate font-bold">{movement.descripcion}</p>
        <p className="truncate text-text-secondary">{movement.detalle}</p>
      </div>
      {isMixto ? (
        <div className="space-y-1">
          <span className="inline-block rounded-full border border-blue-500/40 bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-300">
            MIXTO
          </span>
          {movement.montoEfectivo ? (
            <p className="text-xs text-text-secondary">Ef: {money(movement.montoEfectivo)}</p>
          ) : null}
          {movement.montoTransferencia ? (
            <p className="text-xs text-text-secondary">Tr: {money(movement.montoTransferencia)}</p>
          ) : null}
        </div>
      ) : isPrepago ? (
        <span className="inline-block rounded-full border border-blue-500/40 bg-blue-500/15 px-2 py-0.5 text-xs font-bold text-blue-400">
          PREPAGO
        </span>
      ) : isPaquete ? (
        <span className="inline-block rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400">
          PAQUETE · {methodLabel(movement.metodoPago)}
        </span>
      ) : (
        <span className="truncate text-text-secondary">{methodLabel(movement.metodoPago)}</span>
      )}
      <strong className="text-right">{money(movement.monto)}</strong>
    </div>
  )
}

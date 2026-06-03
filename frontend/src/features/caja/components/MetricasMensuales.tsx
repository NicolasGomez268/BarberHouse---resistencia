import { useEffect, useState } from 'react'
import type { MetricaBarbero, MetricaProducto, SucursalId } from '../../../types'
import { useCaja } from '../hooks/useCaja'

type MetricasMensualesProps = {
  anio: number
  mes: number
  sucursalId: SucursalId
}

type SimpleTableProps = {
  columns: [string, string, string]
  emptyText: string
  pagination?: {
    onNext: () => void
    onPrev: () => void
    page: number
    totalPages: number
  }
  rows: [string, string, string][]
  title: string
  widths: [string, string, string]
}

const ITEMS_POR_PAGINA = 8

function money(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

export function MetricasMensuales({ anio, mes, sucursalId }: MetricasMensualesProps) {
  const { calcularMetricas } = useCaja()
  const data = calcularMetricas(mes, anio, sucursalId)
  const [paginaProductos, setPaginaProductos] = useState(1)
  const ventasProductos = data.productos.map((row: MetricaProducto) => [
    row.producto,
    String(row.unidades),
    money(row.total),
  ]) satisfies [string, string, string][]
  const totalPaginasProductos = Math.ceil(ventasProductos.length / ITEMS_POR_PAGINA)
  const productosVisibles = ventasProductos.slice(
    (paginaProductos - 1) * ITEMS_POR_PAGINA,
    paginaProductos * ITEMS_POR_PAGINA,
  )

  useEffect(() => {
    setPaginaProductos(1)
  }, [mes, anio])

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total del mes" value={money(data.totalMes)} />
        <MetricCard label="Total servicios" value={money(data.totalServicios)} />
        <MetricCard label="Total productos" value={money(data.totalProductos)} />
        <MetricCard label="Turnos realizados" value={String(data.turnosRealizados)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SimpleTable
          columns={['Servicio', 'Cantidad', 'Total']}
          emptyText="No hay servicios realizados."
          rows={data.servicios.map((row) => [row.servicio, String(row.cantidad), money(row.total)])}
          title="Servicios mas realizados"
          widths={['auto', '80px', '100px']}
        />
        <SimpleTable
          columns={['Barbero', 'Turnos', 'Comision']}
          emptyText="No hay datos de barberos."
          rows={data.barberos.map((row: MetricaBarbero) => [
            row.barberoNombre,
            String(row.turnos),
            money(row.comision),
          ])}
          title="Comparativa entre barberos"
          widths={['auto', '70px', '100px']}
        />
        <SimpleTable
          columns={['Producto', 'Unidades', 'Total']}
          emptyText="No hay ventas de productos."
          pagination={
            ventasProductos.length > ITEMS_POR_PAGINA
              ? {
                  onNext: () => setPaginaProductos((current) => Math.min(totalPaginasProductos, current + 1)),
                  onPrev: () => setPaginaProductos((current) => Math.max(1, current - 1)),
                  page: paginaProductos,
                  totalPages: totalPaginasProductos,
                }
              : undefined
          }
          rows={productosVisibles}
          title="Ventas de productos"
          widths={['auto', '80px', '100px']}
        />
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="min-w-0 rounded-lg bg-surface p-5">
      <p className="truncate font-bold text-text-secondary">{label}</p>
      <p className="mt-3 truncate text-xl font-bold">{value}</p>
    </article>
  )
}

function SimpleTable({ columns, emptyText, pagination, rows, title, widths }: SimpleTableProps) {
  return (
    <section className="min-w-0 rounded-lg bg-surface p-4">
      <h3 className="truncate font-bold">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-4 text-text-secondary">{emptyText}</p>
      ) : (
        <>
          <table className="mt-3 w-full table-fixed text-left text-sm">
            <colgroup>
              {widths.map((width, index) => (
                <col key={`${width}-${index}`} style={{ width }} />
              ))}
            </colgroup>
            <thead className="text-text-secondary">
              <tr>
                {columns.map((column, index) => (
                  <th className={`py-2 ${index > 0 ? 'pl-3 text-right' : ''}`} key={column}>
                    <span className="block truncate">{column}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-t border-white/10" key={row.join('-')}>
                  {row.map((cell, index) => (
                    <td className={`py-3 ${index > 0 ? 'pl-3 text-right' : ''}`} key={`${cell}-${index}`}>
                      <span className="block truncate">{cell}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {pagination ? (
            <div className="mt-4 flex items-center justify-between gap-2 text-xs text-text-secondary">
              <button
                className="rounded-lg bg-surface-deep px-3 py-2 font-bold text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pagination.page === 1}
                onClick={pagination.onPrev}
                type="button"
              >
                Anterior
              </button>
              <span className="rounded-lg bg-background px-3 py-2">
                Pagina {pagination.page} de {pagination.totalPages}
              </span>
              <button
                className="rounded-lg bg-surface-deep px-3 py-2 font-bold text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pagination.page === pagination.totalPages}
                onClick={pagination.onNext}
                type="button"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}

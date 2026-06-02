import type { MetricaBarbero, MetricaProducto, SucursalId } from '../../../types'
import { useCaja } from '../hooks/useCaja'

type MetricasMensualesProps = {
  anio: number
  mes: number
  sucursalId: SucursalId
}

function money(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

export function MetricasMensuales({ anio, mes, sucursalId }: MetricasMensualesProps) {
  const { calcularMetricas } = useCaja()
  const data = calcularMetricas(mes, anio, sucursalId)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total del mes" value={money(data.totalMes)} />
        <MetricCard label="Total servicios" value={money(data.totalServicios)} />
        <MetricCard label="Total productos" value={money(data.totalProductos)} />
        <MetricCard label="Turnos realizados" value={String(data.turnosRealizados)} />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <SimpleTable
          columns={['Servicio', 'Cantidad', 'Total']}
          emptyText="No hay servicios realizados."
          rows={data.servicios.map((row) => [row.servicio, String(row.cantidad), money(row.total)])}
          title="Servicios más realizados"
        />
        <SimpleTable
          columns={['Barbero', 'Turnos', 'Comisión']}
          emptyText="No hay datos de barberos."
          rows={data.barberos.map((row: MetricaBarbero) => [row.barberoNombre, String(row.turnos), money(row.comision)])}
          title="Comparativa entre barberos"
        />
        <SimpleTable
          columns={['Producto', 'Unidades', 'Total']}
          emptyText="No hay ventas de productos."
          rows={data.productos.map((row: MetricaProducto) => [row.producto, String(row.unidades), money(row.total)])}
          title="Ventas de productos"
        />
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg bg-surface p-5">
      <p className="font-bold text-text-secondary">{label}</p>
      <p className="mt-3 text-xl font-bold">{value}</p>
    </article>
  )
}

function SimpleTable({
  columns,
  emptyText,
  rows,
  title,
}: {
  columns: string[]
  emptyText: string
  rows: string[][]
  title: string
}) {
  return (
    <section className="overflow-x-auto rounded-lg bg-surface p-4">
      <h3 className="font-bold">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-4 text-text-secondary">{emptyText}</p>
      ) : (
        <table className="mt-3 w-full min-w-[360px] text-left text-sm">
          <thead className="text-text-secondary">
            <tr>
              {columns.map((column) => (
                <th className="py-2" key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-white/10" key={row.join('-')}>
                {row.map((cell) => (
                  <td className="py-3" key={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

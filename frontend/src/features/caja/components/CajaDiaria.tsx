import type { CajaMovimiento, MetodoPago, SucursalId } from '../../../types'
import { useCaja } from '../hooks/useCaja'

type CajaDiariaProps = {
  fecha: string
  sucursalId: SucursalId
}

const methods: MetodoPago[] = ['efectivo', 'transferencia', 'tarjeta']

function money(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function methodLabel(method: MetodoPago) {
  return method === 'efectivo' ? 'Efectivo' : method === 'transferencia' ? 'Transferencia' : 'Tarjeta'
}

export function CajaDiaria({ fecha, sucursalId }: CajaDiariaProps) {
  const { calcularCajaDiaria } = useCaja()
  const data = calcularCajaDiaria(fecha, sucursalId)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Turnos Realizados" value={String(data.turnosRealizados)} />
        <StatCard label="Ventas Productos" value={money(data.ventasProductos)} />
        <StatCard highlighted label="Total del Día" value={money(data.totalDia)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PaymentTable title="Servicios" totals={data.serviciosPorMetodo} />
        <PaymentTable title="Productos" totals={data.productosPorMetodo} />
      </div>

      <section className="rounded-lg bg-surface p-4">
        <h3 className="font-bold">Movimientos del día</h3>
        {data.movimientos.length === 0 ? (
          <p className="mt-4 text-text-secondary">No hay movimientos registrados para esta fecha.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.movimientos.map((movement) => (
              <MovementRow key={movement.id} movement={movement} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ highlighted = false, label, value }: { highlighted?: boolean; label: string; value: string }) {
  return (
    <article className={`rounded-lg p-5 ${highlighted ? 'bg-accent text-background' : 'bg-surface'}`}>
      <p className={highlighted ? 'font-bold text-background/80' : 'font-bold text-text-secondary'}>{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </article>
  )
}

function PaymentTable({ title, totals }: { title: string; totals: Record<MetodoPago, number> }) {
  return (
    <section className="rounded-lg bg-surface p-4">
      <h3 className="font-bold">{title}</h3>
      <div className="mt-3 divide-y divide-white/10">
        {methods.map((method) => (
          <div className="flex justify-between py-3" key={method}>
            <span className="text-text-secondary">{methodLabel(method)}</span>
            <strong>{money(totals[method])}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function MovementRow({ movement }: { movement: CajaMovimiento }) {
  return (
    <div className="grid gap-2 rounded-lg bg-surface-deep p-3 text-sm md:grid-cols-[70px_1fr_auto_auto] md:items-center">
      <span className="font-bold text-accent">{movement.hora}</span>
      <div>
        <p className="font-bold">{movement.descripcion}</p>
        <p className="text-text-secondary">{movement.detalle}</p>
      </div>
      <span className="text-text-secondary">{methodLabel(movement.metodoPago)}</span>
      <strong>{money(movement.monto)}</strong>
    </div>
  )
}

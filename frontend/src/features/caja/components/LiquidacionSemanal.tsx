import type { SucursalId } from '../../../types'
import { useCaja } from '../hooks/useCaja'

type LiquidacionSemanalProps = {
  desde: string
  hasta: string
  sucursalId: SucursalId
}

function money(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

export function LiquidacionSemanal({ desde, hasta, sucursalId }: LiquidacionSemanalProps) {
  const { calcularLiquidacion } = useCaja()
  const data = calcularLiquidacion(desde, hasta, sucursalId)

  if (data.filas.length === 0) {
    return <p className="rounded-lg bg-surface p-6 text-text-secondary">No hay turnos realizados en este rango.</p>
  }

  return (
    <section className="min-w-0 rounded-lg bg-surface">

      {/* Mobile: tarjetas */}
      <div className="space-y-2 p-3 md:hidden">
        {data.filas.map((row) => (
          <div className="rounded-lg border border-white/10 p-3" key={row.barberoId}>
            <div className="flex items-center justify-between">
              <span className="font-bold">{row.barberoNombre}</span>
              <span className="text-xs text-text-secondary">{row.turnosRealizados} turnos</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
              <div>
                <p className="text-text-secondary">Bruto</p>
                <p className="font-bold">{money(row.montoBruto)}</p>
              </div>
              <div>
                <p className="text-text-secondary">Comisión</p>
                <p className="font-bold text-green-300">{money(row.comisionBarbero)}</p>
              </div>
              <div>
                <p className="text-text-secondary">Casa</p>
                <p className="font-bold text-accent">{money(row.parteCasa)}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="rounded-lg border border-white/20 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <span className="font-bold">Totales</span>
            <span className="text-xs text-text-secondary">{data.filas.reduce((t, r) => t + r.turnosRealizados, 0)} turnos</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
            <div>
              <p className="text-text-secondary">Bruto</p>
              <p className="font-bold">{money(data.totalBruto)}</p>
            </div>
            <div>
              <p className="text-text-secondary">Comisión</p>
              <p className="font-bold text-green-300">{money(data.totalComisiones)}</p>
            </div>
            <div>
              <p className="text-text-secondary">Casa</p>
              <p className="font-bold text-accent">{money(data.totalCasa)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: tabla */}
      <table className="hidden w-full table-fixed text-left text-sm md:table">
        <colgroup>
          <col />
          <col style={{ width: '70px' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '130px' }} />
          <col style={{ width: '120px' }} />
        </colgroup>
        <thead className="border-b border-white/10 text-text-secondary">
          <tr>
            <th className="p-4">Barbero</th>
            <th className="p-4 text-right">Turnos</th>
            <th className="p-4 text-right">Monto bruto</th>
            <th className="p-4 text-right">Comision</th>
            <th className="p-4 text-right">Casa</th>
          </tr>
        </thead>
        <tbody>
          {data.filas.map((row) => (
            <tr className="border-b border-white/10" key={row.barberoId}>
              <td className="p-4 font-bold">
                <span className="block truncate">{row.barberoNombre}</span>
              </td>
              <td className="p-4 text-right">{row.turnosRealizados}</td>
              <td className="p-4 text-right">
                <span className="block truncate">{money(row.montoBruto)}</span>
              </td>
              <td className="p-4 text-right text-green-300">
                <span className="block truncate">{money(row.comisionBarbero)}</span>
              </td>
              <td className="p-4 text-right text-accent">
                <span className="block truncate">{money(row.parteCasa)}</span>
              </td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="p-4">Totales</td>
            <td className="p-4 text-right">{data.filas.reduce((total, row) => total + row.turnosRealizados, 0)}</td>
            <td className="p-4 text-right">
              <span className="block truncate">{money(data.totalBruto)}</span>
            </td>
            <td className="p-4 text-right text-green-300">
              <span className="block truncate">{money(data.totalComisiones)}</span>
            </td>
            <td className="p-4 text-right text-accent">
              <span className="block truncate">{money(data.totalCasa)}</span>
            </td>
          </tr>
        </tbody>
      </table>

    </section>
  )
}

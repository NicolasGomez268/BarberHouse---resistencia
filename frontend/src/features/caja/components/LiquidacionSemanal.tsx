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
      <table className="w-full table-fixed text-left text-sm">
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

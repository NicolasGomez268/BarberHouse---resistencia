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
    <section className="overflow-x-auto rounded-lg bg-surface">
      <table className="w-full min-w-[720px] text-left">
        <thead className="border-b border-white/10 text-text-secondary">
          <tr>
            <th className="p-4">Barbero</th>
            <th className="p-4">Turnos</th>
            <th className="p-4">Monto bruto</th>
            <th className="p-4">Comisión barbero</th>
            <th className="p-4">Parte casa</th>
          </tr>
        </thead>
        <tbody>
          {data.filas.map((row) => (
            <tr className="border-b border-white/10" key={row.barberoId}>
              <td className="p-4 font-bold">{row.barberoNombre}</td>
              <td className="p-4">{row.turnosRealizados}</td>
              <td className="p-4">{money(row.montoBruto)}</td>
              <td className="p-4 text-green-300">{money(row.comisionBarbero)}</td>
              <td className="p-4 text-accent">{money(row.parteCasa)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="p-4">Totales</td>
            <td className="p-4">{data.filas.reduce((total, row) => total + row.turnosRealizados, 0)}</td>
            <td className="p-4">{money(data.totalBruto)}</td>
            <td className="p-4 text-green-300">{money(data.totalComisiones)}</td>
            <td className="p-4 text-accent">{money(data.totalCasa)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  )
}

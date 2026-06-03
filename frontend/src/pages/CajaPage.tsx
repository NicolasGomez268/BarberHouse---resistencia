import { useEffect, useState } from 'react'
import { CajaDiaria } from '../features/caja/components/CajaDiaria'
import { LiquidacionSemanal } from '../features/caja/components/LiquidacionSemanal'
import { MetricasMensuales } from '../features/caja/components/MetricasMensuales'
import { PinModal } from '../features/caja/components/PinModal'
import { useCaja } from '../features/caja/hooks/useCaja'
import type { CajaDiariaResumen, SucursalId } from '../types'

type CajaTab = 'diaria' | 'liquidacion' | 'metricas'

const tabs: { id: CajaTab; label: string }[] = [
  { id: 'diaria', label: 'Caja Diaria' },
  { id: 'liquidacion', label: 'Liquidacion Semanal' },
  { id: 'metricas', label: 'Metricas Mensuales' },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoKey(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function money(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

export function CajaPage() {
  const { calcularCajaDiaria, pinValido, sucursales, sucursalesDesbloqueadas, validarPin } = useCaja()
  const [activeTab, setActiveTab] = useState<CajaTab>('diaria')
  const [pinError, setPinError] = useState<string | null>(null)
  const [fecha, setFecha] = useState(todayKey())
  const [sucursalExpandida, setSucursalExpandida] = useState<SucursalId | null>(null)
  const [desde, setDesde] = useState(daysAgoKey(6))
  const [hasta, setHasta] = useState(todayKey())
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [anio, setAnio] = useState(new Date().getFullYear())

  useEffect(() => {
    setSucursalExpandida((current) => {
      if (current && sucursalesDesbloqueadas.includes(current)) {
        return current
      }

      return sucursalesDesbloqueadas[0] ?? null
    })
  }, [sucursalesDesbloqueadas])

  function handlePinSubmit(pin: string) {
    const error = validarPin(pin)
    setPinError(error)
    return error
  }

  function toggleSucursal(id: SucursalId) {
    setSucursalExpandida((current) => (current === id ? null : id))
  }

  return (
    <div className="min-h-screen bg-background pb-10 text-text-primary">
      {!pinValido ? <PinModal error={pinError} onSubmit={handlePinSubmit} /> : null}

      <header>
        <h1 className="text-[30px] font-bold leading-tight text-text-primary">
          Caja: Seguridad, Liquidacion y Metricas
        </h1>
        <p className="mt-2 text-text-secondary">Consulta caja diaria, liquidaciones y metricas por sucursal.</p>
      </header>

      <nav className="mt-8 flex gap-6 overflow-x-auto border-b border-white/10">
        {tabs.map((tab) => (
          <button
            className={`shrink-0 px-4 py-4 font-bold ${
              activeTab === tab.id ? 'border-b-2 border-accent text-text-primary' : 'text-text-secondary'
            }`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'diaria' ? (
        <div className="mt-6">
          <label className="inline-flex flex-col gap-2 font-bold text-text-secondary sm:flex-row sm:items-center">
            Fecha
            <input
              className="rounded-lg border border-accent/40 bg-background px-4 py-3 text-text-primary outline-none focus:border-accent"
              onChange={(event) => setFecha(event.target.value)}
              type="date"
              value={fecha}
            />
          </label>
        </div>
      ) : null}

      {activeTab === 'liquidacion' ? (
        <div className="mt-6 flex flex-col gap-4 rounded-lg bg-surface p-4 sm:flex-row sm:items-end">
          <DateInput label="Desde" onChange={setDesde} value={desde} />
          <DateInput label="Hasta" onChange={setHasta} value={hasta} />
          <button className="rounded-lg bg-accent px-6 py-3 font-bold text-background" type="button">
            Actualizar
          </button>
        </div>
      ) : null}

      {activeTab === 'metricas' ? (
        <div className="mt-6 grid gap-4 rounded-lg bg-surface p-4 sm:grid-cols-[160px_160px_auto] sm:items-end">
          <label className="font-bold text-text-secondary">
            Mes
            <select
              className="mt-2 w-full rounded-lg border border-accent/40 bg-background px-4 py-3 text-text-primary outline-none focus:border-accent"
              onChange={(event) => setMes(Number(event.target.value))}
              value={mes}
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>
                  {month.toLocaleString('es-AR', { minimumIntegerDigits: 2 })}
                </option>
              ))}
            </select>
          </label>
          <label className="font-bold text-text-secondary">
            Anio
            <input
              className="mt-2 w-full rounded-lg border border-accent/40 bg-background px-4 py-3 text-text-primary outline-none focus:border-accent"
              onChange={(event) => setAnio(Number(event.target.value))}
              type="number"
              value={anio}
            />
          </label>
        </div>
      ) : null}

      {pinValido ? (
        <section className="mt-6 flex flex-col gap-6">
          {sucursalesDesbloqueadas.map((sucursalId) => (
            <article className="rounded-2xl border border-white/10 bg-background" key={sucursalId}>
              {activeTab === 'diaria' ? (
                <CajaDiariaSucursalCard
                  data={calcularCajaDiaria(fecha, sucursalId)}
                  expanded={sucursalExpandida === sucursalId}
                  fecha={fecha}
                  name={sucursales[sucursalId]}
                  onToggle={() => toggleSucursal(sucursalId)}
                  sucursalId={sucursalId}
                />
              ) : (
                <>
                  <h2 className="rounded-t-2xl bg-surface px-5 py-4 text-xl font-bold">{sucursales[sucursalId]}</h2>
                  <div className="p-4">
                    {activeTab === 'liquidacion' ? (
                      <LiquidacionSemanal desde={desde} hasta={hasta} sucursalId={sucursalId} />
                    ) : null}
                    {activeTab === 'metricas' ? (
                      <MetricasMensuales anio={anio} mes={mes} sucursalId={sucursalId} />
                    ) : null}
                  </div>
                </>
              )}
            </article>
          ))}
        </section>
      ) : null}
    </div>
  )
}

function CajaDiariaSucursalCard({
  data,
  expanded,
  fecha,
  name,
  onToggle,
  sucursalId,
}: {
  data: CajaDiariaResumen
  expanded: boolean
  fecha: string
  name: string
  onToggle: () => void
  sucursalId: SucursalId
}) {
  const totalServicios =
    data.serviciosPorMetodo.efectivo + data.serviciosPorMetodo.transferencia + data.serviciosPorMetodo.tarjeta

  return (
    <div className="rounded-2xl">
      <button
        className="grid w-full gap-3 rounded-2xl border border-transparent bg-surface p-4 text-left transition hover:border-accent/30 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-center"
        onClick={onToggle}
        type="button"
      >
        <span className="flex items-center gap-2 text-lg font-bold text-text-primary">
          {name}
          <span className="text-accent">{expanded ? '^' : 'v'}</span>
        </span>
        <span className="truncate text-sm text-text-secondary">
          {data.turnosRealizados} turnos - {money(totalServicios)} servicios - {money(data.ventasProductos)} productos
        </span>
        <span className="text-left lg:text-right">
          <span className="block text-xs font-bold uppercase tracking-wide text-text-secondary">Total del dia</span>
          <strong className="text-2xl text-accent">{money(data.totalDia)}</strong>
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-white/10 p-4">
          <CajaDiaria fecha={fecha} sucursalId={sucursalId} />
        </div>
      </div>
    </div>
  )
}

type DateInputProps = {
  label: string
  onChange: (value: string) => void
  value: string
}

function DateInput({ label, onChange, value }: DateInputProps) {
  return (
    <label className="font-bold text-text-secondary">
      {label}
      <input
        className="mt-2 w-full rounded-lg border border-accent/40 bg-background px-4 py-3 text-text-primary outline-none focus:border-accent"
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </label>
  )
}

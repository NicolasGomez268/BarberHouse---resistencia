import { useState } from 'react'
import { CajaDiaria } from '../features/caja/components/CajaDiaria'
import { LiquidacionSemanal } from '../features/caja/components/LiquidacionSemanal'
import { MetricasMensuales } from '../features/caja/components/MetricasMensuales'
import { PinModal } from '../features/caja/components/PinModal'
import { useCaja } from '../features/caja/hooks/useCaja'

type CajaTab = 'diaria' | 'liquidacion' | 'metricas'

const tabs: { id: CajaTab; label: string }[] = [
  { id: 'diaria', label: 'Caja Diaria' },
  { id: 'liquidacion', label: 'Liquidación Semanal' },
  { id: 'metricas', label: 'Métricas Mensuales' },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoKey(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

export function CajaPage() {
  const { pinValido, sucursales, sucursalesDesbloqueadas, validarPin } = useCaja()
  const [activeTab, setActiveTab] = useState<CajaTab>('diaria')
  const [pinError, setPinError] = useState<string | null>(null)
  const [fecha, setFecha] = useState(todayKey())
  const [desde, setDesde] = useState(daysAgoKey(6))
  const [hasta, setHasta] = useState(todayKey())
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [anio, setAnio] = useState(new Date().getFullYear())

  function handlePinSubmit(pin: string) {
    const error = validarPin(pin)
    setPinError(error)
    return error
  }

  return (
    <div className="min-h-screen bg-background pb-10 text-text-primary">
      {!pinValido ? <PinModal error={pinError} onSubmit={handlePinSubmit} /> : null}

      <header>
        <h1 className="text-[30px] font-bold leading-tight text-text-primary">
          Caja: Seguridad, Liquidación y Métricas
        </h1>
        <p className="mt-2 text-text-secondary">Consultá caja diaria, liquidaciones y métricas por sucursal.</p>
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
            Año
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
        <section
          className={`mt-6 grid gap-6 ${sucursalesDesbloqueadas.length > 1 ? '2xl:grid-cols-2' : 'grid-cols-1'}`}
        >
          {sucursalesDesbloqueadas.map((sucursalId) => (
            <article className="space-y-4 rounded-2xl border border-white/10 bg-background" key={sucursalId}>
              <h2 className="rounded-t-2xl bg-surface px-5 py-4 text-xl font-bold">{sucursales[sucursalId]}</h2>
              <div className="px-0 pb-2">
                {activeTab === 'diaria' ? <CajaDiaria fecha={fecha} sucursalId={sucursalId} /> : null}
                {activeTab === 'liquidacion' ? (
                  <LiquidacionSemanal desde={desde} hasta={hasta} sucursalId={sucursalId} />
                ) : null}
                {activeTab === 'metricas' ? (
                  <MetricasMensuales anio={anio} mes={mes} sucursalId={sucursalId} />
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}
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

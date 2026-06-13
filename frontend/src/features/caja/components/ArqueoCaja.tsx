import { useState } from 'react'
import type { SucursalId } from '../../../types'
import { useCierre } from '../hooks/useCierre'

type Props = {
  fecha: string
  sucursalId: SucursalId
  sistemaEfectivo: number
  sistemaTransferencia: number
}

function money(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function diffColor(diff: number) {
  if (diff === 0) return 'text-emerald-400'
  return 'text-red-400'
}

function diffLabel(diff: number) {
  if (diff === 0) return money(0)
  return `${diff > 0 ? '+' : ''}${money(diff)}`
}

export function ArqueoCaja({ fecha, sucursalId, sistemaEfectivo, sistemaTransferencia }: Props) {
  const { cierre, loading, saving, guardarCierre } = useCierre(fecha, sucursalId)
  const [editando, setEditando] = useState(false)
  const [contadoEf, setContadoEf] = useState('')
  const [contadoTr, setContadoTr] = useState('')
  const [oficialEf, setOficialEf] = useState<'sistema' | 'contado'>('sistema')
  const [oficialTr, setOficialTr] = useState<'sistema' | 'contado'>('sistema')

  const numContadoEf = Number(contadoEf) || 0
  const numContadoTr = Number(contadoTr) || 0
  const diffEf = numContadoEf - sistemaEfectivo
  const diffTr = numContadoTr - sistemaTransferencia
  const camposCompletos = contadoEf !== '' && contadoTr !== ''

  if (loading) return null

  if (cierre && !editando) {
    return (
      <div className="mt-6 rounded-xl border border-white/10 bg-surface p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">
            Arqueo de caja{' '}
            <span className="text-emerald-400 text-sm font-normal">✓ Cerrado</span>
          </h3>
          <button
            className="text-xs text-text-secondary underline hover:text-text-primary"
            onClick={() => {
              setContadoEf(String(cierre.contadoEfectivo))
              setContadoTr(String(cierre.contadoTransferencia))
              setOficialEf(cierre.oficialEfectivo === cierre.sistemaEfectivo ? 'sistema' : 'contado')
              setOficialTr(cierre.oficialTransferencia === cierre.sistemaTransferencia ? 'sistema' : 'contado')
              setEditando(true)
            }}
            type="button"
          >
            Modificar
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3 text-sm">
          <span />
          <span className="font-bold text-text-secondary">Efectivo</span>
          <span className="font-bold text-text-secondary">Transferencia</span>

          <span className="text-text-secondary">Sistema</span>
          <span>{money(cierre.sistemaEfectivo)}</span>
          <span>{money(cierre.sistemaTransferencia)}</span>

          <span className="text-text-secondary">Contado</span>
          <span>{money(cierre.contadoEfectivo)}</span>
          <span>{money(cierre.contadoTransferencia)}</span>

          <span className="text-text-secondary">Diferencia</span>
          <span className={diffColor(cierre.diferenciaEfectivo)}>{diffLabel(cierre.diferenciaEfectivo)}</span>
          <span className={diffColor(cierre.diferenciaTransferencia)}>{diffLabel(cierre.diferenciaTransferencia)}</span>

          <span className="text-text-secondary">Oficial</span>
          <span className="font-bold text-accent">{money(cierre.oficialEfectivo)}</span>
          <span className="font-bold text-accent">{money(cierre.oficialTransferencia)}</span>
        </div>
      </div>
    )
  }

  async function handleGuardar() {
    await guardarCierre({
      sucursalId,
      fecha,
      sistemaEfectivo,
      sistemaTransferencia,
      contadoEfectivo: numContadoEf,
      contadoTransferencia: numContadoTr,
      oficialEfectivo: oficialEf === 'sistema' ? sistemaEfectivo : numContadoEf,
      oficialTransferencia: oficialTr === 'sistema' ? sistemaTransferencia : numContadoTr,
    })
    setEditando(false)
  }

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-surface p-4">
      <h3 className="font-bold">Arqueo de caja</h3>
      <p className="mt-1 text-xs text-text-secondary">
        Ingresá lo que contás físicamente y elegí qué valor queda como oficial.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3 text-sm">
        <span />
        <span className="font-bold text-text-secondary">Efectivo</span>
        <span className="font-bold text-text-secondary">Transferencia</span>

        <span className="flex items-center text-text-secondary">Sistema</span>
        <span className="flex items-center font-bold">{money(sistemaEfectivo)}</span>
        <span className="flex items-center font-bold">{money(sistemaTransferencia)}</span>

        <span className="flex items-center text-text-secondary">Lo que contaste</span>
        <input
          className="rounded-lg border border-white/10 bg-background px-3 py-2 text-white outline-none focus:border-accent"
          inputMode="decimal"
          min="0"
          onChange={(e) => setContadoEf(e.target.value)}
          placeholder="0"
          type="number"
          value={contadoEf}
        />
        <input
          className="rounded-lg border border-white/10 bg-background px-3 py-2 text-white outline-none focus:border-accent"
          inputMode="decimal"
          min="0"
          onChange={(e) => setContadoTr(e.target.value)}
          placeholder="0"
          type="number"
          value={contadoTr}
        />

        <span className="flex items-center text-text-secondary">Diferencia</span>
        <span className={`flex items-center font-bold ${camposCompletos ? diffColor(diffEf) : 'text-text-secondary'}`}>
          {camposCompletos ? diffLabel(diffEf) : '—'}
        </span>
        <span className={`flex items-center font-bold ${camposCompletos ? diffColor(diffTr) : 'text-text-secondary'}`}>
          {camposCompletos ? diffLabel(diffTr) : '—'}
        </span>
      </div>

      {camposCompletos ? (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-bold text-text-secondary">¿Qué valor queda guardado como oficial?</p>
          <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3 text-sm">
            <span className="text-text-secondary">Efectivo</span>
            <div className="flex flex-wrap gap-2">
              <OficialBtn
                active={oficialEf === 'sistema'}
                label={`Sistema · ${money(sistemaEfectivo)}`}
                onClick={() => setOficialEf('sistema')}
              />
              <OficialBtn
                active={oficialEf === 'contado'}
                label={`Contado · ${money(numContadoEf)}`}
                onClick={() => setOficialEf('contado')}
              />
            </div>

            <span className="text-text-secondary">Transferencia</span>
            <div className="flex flex-wrap gap-2">
              <OficialBtn
                active={oficialTr === 'sistema'}
                label={`Sistema · ${money(sistemaTransferencia)}`}
                onClick={() => setOficialTr('sistema')}
              />
              <OficialBtn
                active={oficialTr === 'contado'}
                label={`Contado · ${money(numContadoTr)}`}
                onClick={() => setOficialTr('contado')}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex gap-3">
        {editando ? (
          <button
            className="rounded-lg bg-surface-deep px-4 py-2 text-sm text-text-secondary transition hover:text-text-primary"
            onClick={() => setEditando(false)}
            type="button"
          >
            Cancelar
          </button>
        ) : null}
        <button
          className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!camposCompletos || saving}
          onClick={handleGuardar}
          type="button"
        >
          {saving ? 'Guardando...' : 'Cerrar caja'}
        </button>
      </div>
    </div>
  )
}

function OficialBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
        active ? 'bg-accent text-black' : 'bg-surface-deep text-text-secondary hover:text-text-primary'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

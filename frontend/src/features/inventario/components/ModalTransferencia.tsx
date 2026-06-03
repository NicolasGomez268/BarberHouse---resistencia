import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { getStockSucursal } from '../../../shared/utils/stock'
import type { Producto, SucursalId } from '../../../types'
import { BuscadorProducto } from './BuscadorProducto'

type Props = {
  isOpen: boolean
  onClose: () => void
  productoInicial?: Producto
  sucursalOrigen: SucursalId
  onTransferir: (productoId: string, origen: SucursalId, destino: SucursalId, cantidad: number, notas?: string) => void
  productos: Producto[]
}

function getSucursalName(sucursalId: SucursalId) {
  return sucursalId === 's1' ? 'Sucursal 1' : 'Sucursal 2'
}

function getDestino(origen: SucursalId): SucursalId {
  return origen === 's1' ? 's2' : 's1'
}

export function ModalTransferencia({ isOpen, onClose, productoInicial, sucursalOrigen, onTransferir, productos }: Props) {
  const productosActivos = productos.filter((producto) => producto.isActive)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(productoInicial ?? null)
  const [cantidad, setCantidad] = useState('1')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const destino = getDestino(sucursalOrigen)
  const stockOrigen = productoSeleccionado ? getStockSucursal(productoSeleccionado, sucursalOrigen) : 0

  useEffect(() => {
    if (!isOpen) return

    setProductoSeleccionado(productoInicial ?? null)
    setCantidad('1')
    setNotas('')
    setError(null)
  }, [isOpen, productoInicial])

  if (!isOpen) return null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedCantidad = Number(cantidad)

    if (!productoSeleccionado) {
      setError('Selecciona un producto.')
      return
    }
    if (parsedCantidad <= 0) {
      setError('La cantidad debe ser mayor a 0.')
      return
    }
    if (parsedCantidad > stockOrigen) {
      setError('No hay suficiente stock en la sucursal origen.')
      return
    }

    try {
      onTransferir(productoSeleccionado.id, sucursalOrigen, destino, parsedCantidad, notas.trim() || undefined)
      onClose()
    } catch (transferError) {
      setError(transferError instanceof Error ? transferError.message : 'No se pudo transferir stock.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <form className="w-full max-w-[560px] rounded-lg border border-[#6b5600] bg-[#0b0b0d] text-white shadow-2xl" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-[#333333] px-6 py-5">
          <h2 className="text-2xl font-bold">Nueva Transferencia</h2>
          <button aria-label="Cerrar modal" className="text-[#d1d5db] hover:text-white" onClick={onClose} type="button">
            <X className="h-8 w-8" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <label className="block">
            <span className="font-bold">Producto *</span>
            <div className="mt-2">
              <BuscadorProducto
                onChange={setProductoSeleccionado}
                productos={productosActivos}
                sucursalId={sucursalOrigen}
                value={productoSeleccionado}
              />
            </div>
            {productoSeleccionado ? <span className="mt-1 block text-sm text-[#a0a0a0]">Disponible: {stockOrigen} u.</span> : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-bold">Sucursal origen</span>
              <input className="mt-2 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white" readOnly value={getSucursalName(sucursalOrigen)} />
              <span className="mt-1 block text-sm text-[#a0a0a0]">Disponible: {stockOrigen} u.</span>
            </label>
            <label className="block">
              <span className="font-bold">Sucursal destino</span>
              <input className="mt-2 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white" readOnly value={getSucursalName(destino)} />
            </label>
          </div>

          <label className="block">
            <span className="font-bold">Cantidad *</span>
            <input
              className="mt-2 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none focus:border-[#f5c518]"
              max={stockOrigen}
              min="1"
              onChange={(event) => setCantidad(event.target.value)}
              type="number"
              value={cantidad}
            />
          </label>

          <label className="block">
            <span className="font-bold">Notas <span className="font-normal text-[#6b7280]">(opcional)</span></span>
            <textarea
              className="mt-2 min-h-[90px] w-full resize-none rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]"
              onChange={(event) => setNotas(event.target.value)}
              placeholder="Motivo de la transferencia..."
              value={notas}
            />
          </label>

          {error ? <p className="rounded-lg bg-[#2a1618] px-4 py-3 text-sm font-bold text-red-300">{error}</p> : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#333333] px-6 py-5 sm:flex-row sm:justify-end">
          <button className="rounded-lg bg-[#3f3f3f] px-6 py-3 text-white hover:bg-[#6b6b6b]" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="rounded-lg bg-[#e5c04f] px-6 py-3 font-bold text-[#050505] hover:bg-[#f5c518]" type="submit">
            Transferir
          </button>
        </div>
      </form>
    </div>
  )
}

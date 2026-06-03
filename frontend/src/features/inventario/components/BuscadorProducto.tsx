import { X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { getStockSucursal } from '../../../shared/utils/stock'
import type { Producto, SucursalId } from '../../../types'

type Props = {
  productos: Producto[]
  sucursalId: SucursalId
  value: Producto | null
  onChange: (producto: Producto | null) => void
}

function getStockClass(stock: number) {
  if (stock === 0) return 'text-red-300'
  if (stock < 5) return 'text-[#f5c518]'
  return 'text-[#4ade80]'
}

function getStockLabel(stock: number) {
  return stock === 0 ? 'Sin stock' : `${stock} u.`
}

export function BuscadorProducto({ productos, sucursalId, value, onChange }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState(value ? `${value.nombre} ${value.variante ?? ''}`.trim() : '')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return productos.slice(0, 8)

    return productos
      .filter((producto) => {
        const searchable = `${producto.nombre} ${producto.variante ?? ''}`.toLowerCase()
        return searchable.includes(normalizedQuery)
      })
      .slice(0, 8)
  }, [productos, query])

  useEffect(() => {
    setQuery(value ? `${value.nombre} ${value.variante ?? ''}`.trim() : '')
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectProduct(producto: Producto) {
    onChange(producto)
    setQuery(`${producto.nombre} ${producto.variante ?? ''}`.trim())
    setIsOpen(false)
    setHighlightedIndex(0)
  }

  function clearSelection() {
    onChange(null)
    setQuery('')
    setIsOpen(false)
    setHighlightedIndex(0)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      setIsOpen(true)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((current) => Math.min(results.length - 1, current + 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((current) => Math.max(0, current - 1))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const selected = results[highlightedIndex]
      if (selected) selectProduct(selected)
    }
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          className="w-full rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 pr-11 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]"
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
            setHighlightedIndex(0)
            if (value) onChange(null)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar producto por nombre o variante..."
          type="text"
          value={query}
        />
        {query ? (
          <button
            aria-label="Limpiar producto"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#a0a0a0] hover:bg-[#111111] hover:text-white"
            onClick={clearSelection}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border border-[#2f2f2f] bg-[#050505] shadow-2xl shadow-black/60">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#a0a0a0]">No hay productos encontrados.</p>
          ) : (
            results.map((producto, index) => {
              const stock = getStockSucursal(producto, sucursalId)
              const isHighlighted = index === highlightedIndex

              return (
                <button
                  className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition ${
                    isHighlighted ? 'bg-[#111111]' : 'hover:bg-[#111111]'
                  }`}
                  key={producto.id}
                  onClick={() => selectProduct(producto)}
                  type="button"
                >
                  <span>
                    <strong className="block text-white">{producto.nombre} {producto.variante ?? ''}</strong>
                    <span className="mt-1 block text-xs text-[#a0a0a0]">{producto.categoria}</span>
                  </span>
                  <span className={`shrink-0 text-sm font-bold ${getStockClass(stock)}`}>{getStockLabel(stock)}</span>
                </button>
              )
            })
          )}
        </div>
      ) : null}
    </div>
  )
}

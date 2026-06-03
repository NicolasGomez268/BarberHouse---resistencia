import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import type { FormEvent } from 'react'
import { BuscadorProducto } from '../features/inventario/components/BuscadorProducto'
import { ModalTransferencia } from '../features/inventario/components/ModalTransferencia'
import { useInventario } from '../features/inventario/hooks/useInventario'
import { MOCK_BARBEROS } from '../mocks'
import { getStockSucursal, getStockTotal } from '../shared/utils/stock'
import type { MetodoPagoMock, Producto, SucursalId, Venta } from '../types'

type StockTab = 'catalogo' | 'venta' | 'historial' | 'transferencias'

type ProductForm = {
  nombre: string
  variante: string
  categoria: string
  costo: string
  venta: string
  stockS1: string
  stockS2: string
  activo: boolean
  descripcion: string
}

type SaleFormState = {
  sucursalId: SucursalId
  cantidad: string
  metodoPago: MetodoPagoMock
  vendedorId: string
  notas: string
}

const productsPerPage = 6
const emptyForm: ProductForm = {
  nombre: '',
  variante: '',
  categoria: '',
  costo: '0',
  venta: '0',
  stockS1: '0',
  stockS2: '0',
  activo: true,
  descripcion: '',
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function getSucursalName(sucursalId: SucursalId) {
  return sucursalId === 's1' ? 'Sucursal 1' : 'Sucursal 2'
}

function productToForm(product: Producto): ProductForm {
  return {
    nombre: product.nombre,
    variante: product.variante ?? '',
    categoria: product.categoria,
    costo: String(product.precioCosto),
    venta: String(product.precioVenta),
    stockS1: String(getStockSucursal(product, 's1')),
    stockS2: String(getStockSucursal(product, 's2')),
    activo: product.isActive,
    descripcion: product.descripcion ?? '',
  }
}

export function InventarioPage() {
  const {
    productos,
    ventas,
    transferencias,
    agregarProducto,
    actualizarProducto,
    ajustarStock,
    registrarVenta,
    transferirStock,
  } = useInventario()
  const [activeTab, setActiveTab] = useState<StockTab>('catalogo')
  const [sucursalActiva, setSucursalActiva] = useState<SucursalId>('s1')
  const [historySucursal, setHistorySucursal] = useState<SucursalId | 'TODAS'>('TODAS')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferProduct, setTransferProduct] = useState<Producto | undefined>(undefined)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [sale, setSale] = useState<SaleFormState>({
    sucursalId: 's1',
    cantidad: '1',
    metodoPago: 'EFECTIVO',
    vendedorId: '',
    notas: '',
  })
  const [saleError, setSaleError] = useState<string | null>(null)
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().slice(0, 10))
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().slice(0, 10))
  const [historyPayment, setHistoryPayment] = useState<MetodoPagoMock | 'TODOS'>('TODOS')

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return productos.filter((product) => {
      const matchesSearch =
        product.nombre.toLowerCase().includes(normalizedSearch) ||
        (product.variante ?? '').toLowerCase().includes(normalizedSearch) ||
        product.categoria.toLowerCase().includes(normalizedSearch)
      const matchesCategory = categoryFilter === 'Todas' || product.categoria === categoryFilter
      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Activos' && product.isActive) ||
        (statusFilter === 'Inactivos' && !product.isActive)
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [categoryFilter, productos, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const pageProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
  const categories = Array.from(new Set(productos.map((product) => product.categoria).filter(Boolean)))
  const totalProducts = productos.length
  const outOfStock = productos.filter((product) => getStockSucursal(product, sucursalActiva) === 0).length
  const activeProducts = productos.filter((product) => product.isActive).length
  const isEditing = editingProduct !== null
  const margin = Number(form.venta) - Number(form.costo)
  const historyDateError = fechaDesde > fechaHasta ? 'La fecha de inicio no puede ser mayor a la fecha de fin' : null
  const historySales = historyDateError ? [] : ventas.filter(
    (venta) =>
      venta.fecha >= fechaDesde &&
      venta.fecha <= fechaHasta &&
      (historyPayment === 'TODOS' || venta.metodoPago === historyPayment) &&
      (historySucursal === 'TODAS' || venta.sucursalId === historySucursal),
  )

  useEffect(() => {
    setSale((current) => ({ ...current, sucursalId: sucursalActiva }))
  }, [sucursalActiva])

  function openCreateModal() {
    setEditingProduct(null)
    setForm(emptyForm)
    setIsProductModalOpen(true)
  }

  function openEditModal(product: Producto) {
    setEditingProduct(product)
    setForm(productToForm(product))
    setIsProductModalOpen(true)
  }

  function openTransferModal(product?: Producto) {
    setTransferProduct(product)
    setIsTransferModalOpen(true)
  }

  function closeProductModal() {
    setIsProductModalOpen(false)
    setEditingProduct(null)
    setForm(emptyForm)
  }

  function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = {
      nombre: form.nombre.trim(),
      variante: form.variante.trim() || undefined,
      categoria: form.categoria.trim() || 'Sin categoria',
      precioCosto: Number(form.costo) || 0,
      precioVenta: Number(form.venta) || 0,
      stockPorSucursal: [
        { sucursalId: 's1' as const, stockActual: Number(form.stockS1) || 0 },
        { sucursalId: 's2' as const, stockActual: Number(form.stockS2) || 0 },
      ],
      isActive: form.activo,
      descripcion: form.descripcion.trim() || undefined,
    }

    if (!payload.nombre) return
    if (editingProduct) {
      actualizarProducto(editingProduct.id, payload)
    } else {
      agregarProducto(payload)
      setCurrentPage(1)
    }
    closeProductModal()
  }

  function submitSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cantidad = Number(sale.cantidad)
    if (!productoSeleccionado) {
      setSaleError('Selecciona un producto')
      return
    }
    if (cantidad <= 0) return

    try {
      registrarVenta({
        sucursalId: sale.sucursalId,
        fecha: new Date().toISOString().slice(0, 10),
        productoId: productoSeleccionado.id,
        cantidad,
        precioUnitario: productoSeleccionado.precioVenta,
        total: productoSeleccionado.precioVenta * cantidad,
        metodoPago: sale.metodoPago,
        vendedorId: sale.vendedorId || 'barbero-1',
        notas: sale.notas || undefined,
      })
      setSaleError(null)
    } catch (error) {
      setSaleError(error instanceof Error ? error.message : 'No se pudo registrar la venta')
    }
  }

  function handleTransferirStock(productoId: string, origen: SucursalId, destino: SucursalId, cantidad: number, notas?: string) {
    transferirStock(productoId, origen, destino, cantidad, 'barbero-1', notas)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-10 text-white">
      <header>
        <h1 className="text-[30px] font-bold leading-tight text-white">Gestion de Stock</h1>
        <p className="mt-2 text-base text-[#a0a0a0]">Administra tus productos y registra ventas para seguirlas desde Caja.</p>
      </header>

      <nav className="mt-8 flex gap-6 overflow-x-auto border-b border-[#2f2f2f]">
        {[
          { id: 'catalogo', label: 'Catalogo' },
          { id: 'venta', label: 'Registrar Venta' },
          { id: 'historial', label: 'Historial de Ventas' },
          { id: 'transferencias', label: 'Transferencias' },
        ].map((tab) => (
          <button
            className={`shrink-0 px-6 py-4 font-bold ${
              activeTab === tab.id ? 'border-b-2 border-white text-white' : 'text-[#9ca3af]'
            }`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id as StockTab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'catalogo' ? (
        <>
          <section className="mt-6 grid gap-4 rounded-lg bg-[#111111] p-4 lg:grid-cols-[auto_1fr_auto_130px_auto_130px_auto_130px_auto] lg:items-center">
            <label className="font-bold">Buscar:</label>
            <input className="w-full rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]" onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }} placeholder="Nombre, variante, categoria..." type="search" value={search} />
            <label className="font-bold">Categoria:</label>
            <select className="rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white outline-none focus:border-[#f5c518]" onChange={(event) => { setCategoryFilter(event.target.value); setCurrentPage(1) }} value={categoryFilter}>
              <option>Todas</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <label className="font-bold">Estado:</label>
            <select className="rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white outline-none focus:border-[#f5c518]" onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }} value={statusFilter}>
              <option>Todos</option>
              <option>Activos</option>
              <option>Inactivos</option>
            </select>
            <label className="font-bold">Sucursal:</label>
            <select className="rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white outline-none focus:border-[#f5c518]" onChange={(event) => setSucursalActiva(event.target.value as SucursalId)} value={sucursalActiva}>
              <option value="s1">Sucursal 1</option>
              <option value="s2">Sucursal 2</option>
            </select>
            <button className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#e5c04f] px-6 py-3 font-bold text-[#050505] transition hover:bg-[#f5c518]" onClick={openCreateModal} type="button">
              <Plus className="h-6 w-6 text-[#7c3aed]" />
              Nuevo Producto
            </button>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-3">
            <SummaryCard accent="border-l-[#f5c518]" label="Total productos" value={totalProducts} />
            <SummaryCard accent="border-l-[#ef4444]" label="Sin stock" value={outOfStock} />
            <SummaryCard accent="border-l-[#22c55e]" label="Activos" value={activeProducts} />
          </section>

          <section className="mt-5 hidden overflow-hidden rounded-lg border border-[#111111] bg-[#050505] xl:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#111111] text-[#cfcfcf]">
                  <TableHead>Producto</TableHead><TableHead>Categoria</TableHead><TableHead>Costo</TableHead><TableHead>Venta</TableHead><TableHead>Margen</TableHead><TableHead>Stock</TableHead><TableHead>Estado</TableHead><TableHead>Acciones</TableHead>
                </tr>
              </thead>
              <tbody>
                {pageProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    onDelete={(id) => actualizarProducto(id, { isActive: false })}
                    onEdit={openEditModal}
                    onStock={(id) => ajustarStock(id, sucursalActiva, 1, 'agregar')}
                    onTransfer={openTransferModal}
                    product={product}
                    sucursalActiva={sucursalActiva}
                  />
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-5 grid gap-4 xl:hidden">
            {pageProducts.map((product) => (
              <ProductCard
                key={product.id}
                onDelete={(id) => actualizarProducto(id, { isActive: false })}
                onEdit={openEditModal}
                onStock={(id) => ajustarStock(id, sucursalActiva, 1, 'agregar')}
                onTransfer={openTransferModal}
                product={product}
                sucursalActiva={sucursalActiva}
              />
            ))}
          </section>

          <Pagination currentPage={currentPage} onPageChange={setCurrentPage} totalItems={filteredProducts.length} totalPages={totalPages} />
        </>
      ) : null}

      {activeTab === 'venta' ? (
        <SaleForm
          products={productos.filter((product) => product.isActive)}
          productoSeleccionado={productoSeleccionado}
          sale={sale}
          saleError={saleError}
          setProductoSeleccionado={setProductoSeleccionado}
          setSale={setSale}
          sucursalActiva={sucursalActiva}
          onSubmit={submitSale}
        />
      ) : null}
      {activeTab === 'historial' ? (
        <SalesHistory
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          historyDateError={historyDateError}
          historyPayment={historyPayment}
          historySucursal={historySucursal}
          products={productos}
          sales={historySales}
          setFechaDesde={setFechaDesde}
          setFechaHasta={setFechaHasta}
          setHistoryPayment={setHistoryPayment}
          setHistorySucursal={setHistorySucursal}
        />
      ) : null}
      {activeTab === 'transferencias' ? (
        <TransfersTab
          onNewTransfer={() => openTransferModal()}
          products={productos}
          transfers={transferencias}
        />
      ) : null}

      {isProductModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form className="max-h-[92vh] w-full max-w-[672px] overflow-y-auto rounded-lg border border-[#6b5600] bg-[#0b0b0d] text-white shadow-2xl" onSubmit={handleProductSubmit}>
            <div className="flex items-center justify-between border-b border-[#d1d5db] px-6 py-5">
              <h2 className="text-2xl font-bold">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button aria-label="Cerrar modal" className="text-[#d1d5db] hover:text-white" onClick={() => setIsProductModalOpen(false)} type="button"><X className="h-8 w-8" /></button>
            </div>
            <div className="space-y-5 px-6 py-6">
              <label className="block">
                <span className="font-bold">Nombre *</span>
                <input className="mt-2 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]" onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))} placeholder="Ej: Shampoo Keratina, Pomada Mate, Remera Oversize" required type="text" value={form.nombre} />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="Variante" optional onChange={(value) => setForm((current) => ({ ...current, variante: value }))} placeholder="Ej: 250ml, S, Azul, 1kg" value={form.variante} />
                <FormInput label="Categoria" optional onChange={(value) => setForm((current) => ({ ...current, categoria: value }))} placeholder="Ej: Capilar, Ropa, Accesorios" value={form.categoria} />
                <FormInput label="Precio de Costo" onChange={(value) => setForm((current) => ({ ...current, costo: value }))} type="number" value={form.costo} />
                <label className="block">
                  <span className="font-bold">Precio de Venta *</span>
                  <input className="mt-2 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]" min="0" onChange={(event) => setForm((current) => ({ ...current, venta: event.target.value }))} required type="number" value={form.venta} />
                  {isEditing ? <span className="mt-1 block text-sm text-[#22c55e]">Margen: {formatCurrency(margin)}</span> : null}
                </label>
                <FormInput label="Stock Sucursal 1" onChange={(value) => setForm((current) => ({ ...current, stockS1: value }))} type="number" value={form.stockS1} />
                <FormInput label="Stock Sucursal 2" onChange={(value) => setForm((current) => ({ ...current, stockS2: value }))} type="number" value={form.stockS2} />
                <label className="flex items-center gap-3 self-end pb-3 font-bold text-[#d1d5db]">
                  <input checked={form.activo} className="h-5 w-5 accent-[#f5c518]" onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))} type="checkbox" />
                  Activo (disponible para venta)
                </label>
              </div>
              <label className="block">
                <span className="font-bold">Descripcion <span className="font-normal text-[#6b7280]">(opcional)</span></span>
                <textarea className="mt-2 min-h-[66px] w-full resize-none rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]" onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))} placeholder="Descripcion adicional..." value={form.descripcion} />
              </label>
            </div>
            <div className="flex flex-col gap-3 border-t border-[#333333] px-6 py-5 sm:flex-row sm:justify-end">
              <button className="rounded-lg bg-[#3f3f3f] px-6 py-3 text-white hover:bg-[#6b6b6b]" onClick={closeProductModal} type="button">Cancelar</button>
              <button className="rounded-lg bg-[#e5c04f] px-6 py-3 font-bold text-[#050505] hover:bg-[#f5c518]" type="submit">{isEditing ? 'Guardar cambios' : 'Crear producto'}</button>
            </div>
          </form>
        </div>
      ) : null}

      <ModalTransferencia
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false)
          setTransferProduct(undefined)
        }}
        onTransferir={handleTransferirStock}
        productoInicial={transferProduct}
        productos={productos}
        sucursalOrigen={sucursalActiva}
      />
    </div>
  )
}

type SummaryCardProps = { accent: string; label: string; value: number }

function SummaryCard({ accent, label, value }: SummaryCardProps) {
  return <article className={`rounded-lg border-l-4 ${accent} bg-[#111111] p-6`}><p className="font-bold text-[#bdbdbd]">{label}</p><p className="mt-3 text-2xl font-bold text-white">{value}</p></article>
}

type ProductActionsProps = {
  onDelete: (productId: string) => void
  onEdit: (product: Producto) => void
  onStock: (productId: string) => void
  onTransfer: (product: Producto) => void
  product: Producto
  sucursalActiva: SucursalId
}

function ProductActions({ onDelete, onEdit, onStock, onTransfer, product }: ProductActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded bg-[#2a2a2a] px-4 py-3 text-sm font-bold text-white hover:bg-[#3a3a3a]" onClick={() => onEdit(product)} type="button">Editar</button>
      <button className="rounded bg-[#16a34a] px-4 py-3 text-sm font-bold text-white hover:bg-[#15803d]" onClick={() => onStock(product.id)} type="button">Stock</button>
      <button className="rounded bg-[#3f3f3f] px-4 py-3 text-sm text-white hover:bg-[#6b6b6b]" onClick={() => onTransfer(product)} type="button">Transferir</button>
      <button className="rounded bg-[#e9282d] px-4 py-3 text-sm font-bold text-white hover:bg-[#dc2626]" onClick={() => onDelete(product.id)} type="button">Eliminar</button>
    </div>
  )
}

function ProductRow({ onDelete, onEdit, onStock, onTransfer, product, sucursalActiva }: ProductActionsProps) {
  const cost = product.precioCosto
  const sale = product.precioVenta
  const stock = getStockSucursal(product, sucursalActiva)
  const totalStock = getStockTotal(product)
  const margin = sale - cost
  const marginPercent = cost > 0 ? ((sale - cost) / cost) * 100 : 0
  return (
    <tr className={`border-b border-[#111111] text-[#cfcfcf] ${!product.isActive ? 'opacity-50' : ''}`}>
      <TableCell><strong className="block text-white">{product.nombre}</strong><span className="text-sm text-[#6b6b6b]">{product.variante || '-'}</span></TableCell>
      <TableCell>{product.categoria}</TableCell>
      <TableCell>{formatCurrency(cost)}</TableCell>
      <TableCell><strong className="text-white">{formatCurrency(sale)}</strong></TableCell>
      <TableCell><span className="font-bold text-[#22c55e]">+{formatCurrency(margin)}</span> <span className="text-xs text-[#6b6b6b]">({marginPercent.toFixed(1)}%)</span></TableCell>
      <TableCell><span className={`inline-block rounded border px-3 py-1 font-bold ${stock < 5 ? 'border-[#ef4444] bg-[#451a1a] text-[#fca5a5]' : 'border-[#22c55e] bg-[#064e2a] text-[#4ade80]'}`}>{stock} u.</span><span className="mt-1 block text-xs text-[#6b6b6b]">Total: {totalStock}</span></TableCell>
      <TableCell><span className="font-bold text-[#4ade80]">{product.isActive ? 'Activo' : 'Inactivo'}</span></TableCell>
      <TableCell><ProductActions onDelete={onDelete} onEdit={onEdit} onStock={onStock} onTransfer={onTransfer} product={product} sucursalActiva={sucursalActiva} /></TableCell>
    </tr>
  )
}

function ProductCard({ onDelete, onEdit, onStock, onTransfer, product, sucursalActiva }: ProductActionsProps) {
  const cost = product.precioCosto
  const sale = product.precioVenta
  const stock = getStockSucursal(product, sucursalActiva)
  const totalStock = getStockTotal(product)
  const margin = sale - cost
  return (
    <article className={`rounded-lg border border-[#111111] bg-[#050505] p-4 ${!product.isActive ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-white">{product.nombre}</h2><p className="text-sm text-[#6b6b6b]">{product.variante || 'Sin variante'}</p></div><span className={`rounded border px-3 py-1 font-bold ${stock < 5 ? 'border-[#ef4444] bg-[#451a1a] text-[#fca5a5]' : 'border-[#22c55e] bg-[#064e2a] text-[#4ade80]'}`}>{stock} u.</span></div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#cfcfcf]"><p>Categoria: <strong>{product.categoria}</strong></p><p>Total: <strong>{totalStock}</strong></p><p>Costo: <strong>{formatCurrency(cost)}</strong></p><p>Venta: <strong className="text-white">{formatCurrency(sale)}</strong></p><p className="col-span-2">Margen: <strong className="text-[#22c55e]">+{formatCurrency(margin)}</strong></p></div>
      <div className="mt-4"><ProductActions onDelete={onDelete} onEdit={onEdit} onStock={onStock} onTransfer={onTransfer} product={product} sucursalActiva={sucursalActiva} /></div>
    </article>
  )
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-4 font-bold">{children}</th>
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-4 align-middle">{children}</td>
}

function Pagination({ currentPage, onPageChange, totalItems, totalPages }: { currentPage: number; onPageChange: (page: number) => void; totalItems: number; totalPages: number }) {
  return (
    <div className="mt-5 flex flex-col gap-3 text-[#a0a0a0] sm:flex-row sm:items-center sm:justify-between">
      <p>Mostrando pagina {currentPage} de {totalPages} - {totalItems} productos</p>
      <div className="flex gap-2">
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2 text-white disabled:opacity-40" disabled={currentPage === 1} onClick={() => onPageChange(Math.max(1, currentPage - 1))} type="button"><ChevronLeft className="h-4 w-4" />Anterior</button>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2 text-white disabled:opacity-40" disabled={currentPage === totalPages} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} type="button">Siguiente<ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  )
}

function FormInput({ label, onChange, optional = false, placeholder, type = 'text', value }: { label: string; onChange: (value: string) => void; optional?: boolean; placeholder?: string; type?: 'text' | 'number'; value: string }) {
  return (
    <label className="block"><span className="font-bold">{label} {optional ? <span className="font-normal text-[#6b7280]">(opcional)</span> : '*'}</span><input className="mt-2 w-full rounded-lg border border-[#3f3f3f] bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]" min={type === 'number' ? '0' : undefined} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={!optional} type={type} value={value} /></label>
  )
}

function SaleForm({
  onSubmit,
  products,
  productoSeleccionado,
  sale,
  saleError,
  setProductoSeleccionado,
  setSale,
  sucursalActiva,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  products: Producto[]
  productoSeleccionado: Producto | null
  sale: SaleFormState
  saleError: string | null
  setProductoSeleccionado: React.Dispatch<React.SetStateAction<Producto | null>>
  setSale: React.Dispatch<React.SetStateAction<SaleFormState>>
  sucursalActiva: SucursalId
}) {
  const total = (productoSeleccionado?.precioVenta ?? 0) * (Number(sale.cantidad) || 0)
  const stockDisponible = productoSeleccionado ? getStockSucursal(productoSeleccionado, sale.sucursalId) : 0

  return (
    <form className="mt-6 rounded-lg bg-[#111111] p-6" onSubmit={onSubmit}>
      <h2 className="text-xl font-bold">Registrar Venta de Producto</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_150px_140px_140px]">
        <label className="block">
          <span className="font-bold">Producto *</span>
          <div className="mt-2">
            <BuscadorProducto
              onChange={setProductoSeleccionado}
              productos={products}
              sucursalId={sale.sucursalId}
              value={productoSeleccionado}
            />
          </div>
        </label>
        <label className="block"><span className="font-bold">Sucursal *</span><select className="mt-2 w-full rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white outline-none focus:border-[#f5c518]" onChange={(event) => setSale((current) => ({ ...current, sucursalId: event.target.value as SucursalId }))} value={sale.sucursalId}><option value="s1">Sucursal 1</option><option value="s2">Sucursal 2</option></select><span className="mt-1 block text-xs text-[#a0a0a0]">Activa: {getSucursalName(sucursalActiva)} - Disponible: {stockDisponible}</span></label>
        <FormInput label="Cantidad" onChange={(value) => setSale((current) => ({ ...current, cantidad: value }))} type="number" value={sale.cantidad} />
        <FormInput label="Precio unit." onChange={() => undefined} type="number" value={String(productoSeleccionado?.precioVenta ?? 0)} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[176px_1fr]">
        <div className="rounded-lg border border-[#2f2f2f] bg-[#050505] p-4 text-center"><p className="text-xs uppercase text-[#6b6b6b]">Total</p><p className="mt-2 text-xl font-bold text-[#a0a0a0]">{formatCurrency(total)}</p></div>
        <div><p className="mb-2 font-bold">Metodo de pago</p><div className="grid gap-2 md:grid-cols-3">{(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'] as MetodoPagoMock[]).map((method) => <button className={`rounded-lg border px-4 py-3 font-bold ${sale.metodoPago === method ? 'border-[#f5c518] bg-[#f5c518]/10' : 'border-[#2f2f2f]'}`} key={method} onClick={() => setSale((current) => ({ ...current, metodoPago: method }))} type="button">{method}</button>)}</div></div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><FormInput label="Vendedor" onChange={(value) => setSale((current) => ({ ...current, vendedorId: value }))} optional placeholder="Nombre del vendedor" value={sale.vendedorId} /><FormInput label="Notas" onChange={(value) => setSale((current) => ({ ...current, notas: value }))} optional placeholder="Observaciones..." value={sale.notas} /></div>
      {saleError ? <p className="mt-4 text-sm font-bold text-red-300">{saleError}</p> : null}
      <button className="mt-5 w-full rounded-lg bg-[#e5c04f] px-4 py-4 font-bold text-[#050505] hover:bg-[#f5c518]" type="submit">Confirmar Venta</button>
    </form>
  )
}

function SalesHistory({
  fechaDesde,
  fechaHasta,
  historyDateError,
  historyPayment,
  historySucursal,
  products,
  sales,
  setFechaDesde,
  setFechaHasta,
  setHistoryPayment,
  setHistorySucursal,
}: {
  fechaDesde: string
  fechaHasta: string
  historyDateError: string | null
  historyPayment: MetodoPagoMock | 'TODOS'
  historySucursal: SucursalId | 'TODAS'
  products: Producto[]
  sales: Venta[]
  setFechaDesde: (date: string) => void
  setFechaHasta: (date: string) => void
  setHistoryPayment: (method: MetodoPagoMock | 'TODOS') => void
  setHistorySucursal: (sucursal: SucursalId | 'TODAS') => void
}) {
  const total = sales.reduce((sum, sale) => sum + sale.total, 0)
  return (
    <>
      <section className="mt-6 flex flex-col gap-4 rounded-lg bg-[#111111] p-4 sm:flex-row sm:items-center">
        <label className="font-bold">Desde:</label>
        <input className="rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white" onChange={(event) => setFechaDesde(event.target.value)} type="date" value={fechaDesde} />
        <label className="font-bold">Hasta:</label>
        <input className="rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white" onChange={(event) => setFechaHasta(event.target.value)} type="date" value={fechaHasta} />
        <select className="rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white" onChange={(event) => setHistoryPayment(event.target.value as MetodoPagoMock | 'TODOS')} value={historyPayment}><option value="TODOS">Todos</option><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option><option value="TARJETA">Tarjeta</option></select>
        <select className="rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white" onChange={(event) => setHistorySucursal(event.target.value as SucursalId | 'TODAS')} value={historySucursal}><option value="TODAS">Todas las sucursales</option><option value="s1">Sucursal 1</option><option value="s2">Sucursal 2</option></select>
        <button className="rounded-lg bg-[#e5c04f] px-6 py-3 font-bold text-[#050505] hover:bg-[#f5c518]" type="button">Actualizar</button>
      </section>
      {historyDateError ? <p className="mt-4 rounded-lg bg-[#2a1618] px-4 py-3 text-sm font-bold text-red-300">{historyDateError}</p> : null}
      <section className="mt-5 grid gap-4 md:grid-cols-4"><SummaryCard accent="border-l-[#f5c518]" label="Ventas del periodo" value={sales.length} /><article className="rounded-lg bg-[#e5c04f] p-6 text-[#050505] shadow-lg shadow-[#e5c04f]/20"><p className="font-bold">Total vendido</p><p className="mt-3 text-3xl font-bold">{formatCurrency(total)}</p></article><article className="rounded-lg border-l-4 border-l-[#6b6b6b] bg-[#111111] p-6"><p className="font-bold text-[#bdbdbd]">Efectivo</p><p className="mt-3 text-2xl font-bold text-white">{formatCurrency(sales.filter((sale) => sale.metodoPago === 'EFECTIVO').reduce((sum, sale) => sum + sale.total, 0))}</p></article><article className="rounded-lg border-l-4 border-l-[#6b6b6b] bg-[#111111] p-6"><p className="font-bold text-[#bdbdbd]">Transf. + Tarjeta</p><p className="mt-3 text-2xl font-bold text-white">{formatCurrency(sales.filter((sale) => sale.metodoPago !== 'EFECTIVO').reduce((sum, sale) => sum + sale.total, 0))}</p></article></section>
      <section className="mt-5 rounded-lg border border-[#111111] bg-[#050505] p-6 text-[#d1d5db]">{sales.length === 0 ? <p className="p-8 text-center text-[#6b7280]">{historyDateError ? 'Corregi el rango de fechas para ver ventas.' : 'No hay ventas registradas para este periodo.'}</p> : <div className="space-y-3">{sales.map((sale) => <div className="grid gap-2 rounded-lg bg-[#111111] p-4 md:grid-cols-[1fr_auto_auto_auto]" key={sale.id}><span>{products.find((product) => product.id === sale.productoId)?.nombre ?? sale.productoId} - {sale.cantidad} u.</span><span>{getSucursalName(sale.sucursalId)}</span><span>{sale.metodoPago}</span><strong>{formatCurrency(sale.total)}</strong></div>)}</div>}</section>
    </>
  )
}

function TransfersTab({ onNewTransfer, products, transfers }: { onNewTransfer: () => void; products: Producto[]; transfers: Array<{ id: string; productoId: string; sucursalOrigen: SucursalId; sucursalDestino: SucursalId; cantidad: number; fecha: string; solicitadoPor: string; notas?: string }> }) {
  const itemsPorPagina = 10
  const [paginaActual, setPaginaActual] = useState(1)
  const sortedTransfers = [...transfers].sort((first, second) => second.fecha.localeCompare(first.fecha))
  const totalPaginas = Math.max(1, Math.ceil(sortedTransfers.length / itemsPorPagina))
  const transferenciasVisibles = sortedTransfers.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)
  const desde = sortedTransfers.length === 0 ? 0 : (paginaActual - 1) * itemsPorPagina + 1
  const hasta = Math.min(paginaActual * itemsPorPagina, sortedTransfers.length)

  useEffect(() => {
    setPaginaActual(1)
  }, [transfers.length])

  return (
    <section className="mt-6 rounded-lg border border-[#111111] bg-[#050505] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold">Transferencias</h2>
        <button className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#e5c04f] px-6 py-3 font-bold text-[#050505] transition hover:bg-[#f5c518]" onClick={onNewTransfer} type="button">
          <Plus className="h-5 w-5 text-[#7c3aed]" />
          Nueva Transferencia
        </button>
      </div>
      <p className="mt-4 text-sm text-[#a0a0a0]">
        Mostrando {desde}-{hasta} de {sortedTransfers.length} transferencias
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="text-[#cfcfcf]">
            <tr className="border-b border-[#111111]"><TableHead>Fecha</TableHead><TableHead>Producto</TableHead><TableHead>De</TableHead><TableHead>A</TableHead><TableHead>Cantidad</TableHead><TableHead>Solicitado por</TableHead><TableHead>Notas</TableHead></tr>
          </thead>
          <tbody>
            {transferenciasVisibles.map((transfer) => (
              <tr className="border-b border-[#111111] text-[#d1d5db]" key={transfer.id}>
                <TableCell>{transfer.fecha}</TableCell>
                <TableCell>{products.find((product) => product.id === transfer.productoId)?.nombre ?? transfer.productoId}</TableCell>
                <TableCell>{getSucursalName(transfer.sucursalOrigen)}</TableCell>
                <TableCell>{getSucursalName(transfer.sucursalDestino)}</TableCell>
                <TableCell><strong className="text-white">{transfer.cantidad} u.</strong></TableCell>
                <TableCell>{MOCK_BARBEROS.find((barbero) => barbero.id === transfer.solicitadoPor)?.nombre ?? transfer.solicitadoPor}</TableCell>
                <TableCell>{transfer.notas ?? '-'}</TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex flex-col gap-3 text-[#a0a0a0] sm:flex-row sm:items-center sm:justify-between">
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2 text-white disabled:opacity-40"
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual((page) => Math.max(1, page - 1))}
          type="button"
        >
          ← Anterior
        </button>
        <span>Pagina {paginaActual} de {totalPaginas}</span>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2 text-white disabled:opacity-40"
          disabled={paginaActual === totalPaginas}
          onClick={() => setPaginaActual((page) => Math.min(totalPaginas, page + 1))}
          type="button"
        >
          Siguiente →
        </button>
      </div>
    </section>
  )
}

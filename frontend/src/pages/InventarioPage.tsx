import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type StockTab = 'catalogo' | 'venta' | 'historial'

type StockProduct = {
  id: string
  nombre: string
  variante: string
  categoria: string
  costo: number
  venta: number
  stock: number
  activo: boolean
  descripcion: string
}

type ProductForm = {
  nombre: string
  variante: string
  categoria: string
  costo: string
  venta: string
  stock: string
  activo: boolean
  descripcion: string
}

const productsPerPage = 6

const initialProducts: StockProduct[] = [
  {
    id: 'producto-1',
    nombre: 'Aceite para Barba',
    variante: '50ml',
    categoria: 'Capilar',
    costo: 3200,
    venta: 6000,
    stock: 12,
    activo: true,
    descripcion: 'Aceite hidratante con aroma a madera',
  },
  {
    id: 'producto-2',
    nombre: 'Buzo Oversize',
    variante: 'XL',
    categoria: 'Ropa',
    costo: 12000,
    venta: 22000,
    stock: 3,
    activo: true,
    descripcion: 'Buzo premium de la barbería',
  },
  {
    id: 'producto-3',
    nombre: 'Cera para Bigote',
    variante: '30g',
    categoria: 'Capilar',
    costo: 2000,
    venta: 4000,
    stock: 10,
    activo: true,
    descripcion: 'Cera de fijación fuerte',
  },
  {
    id: 'producto-4',
    nombre: 'Navaja de Afeitar',
    variante: '',
    categoria: 'Accesorios',
    costo: 6500,
    venta: 12000,
    stock: 6,
    activo: true,
    descripcion: 'Navaja profesional metálica',
  },
  {
    id: 'producto-5',
    nombre: 'Peine de Madera',
    variante: '',
    categoria: 'Accesorios',
    costo: 1500,
    venta: 3000,
    stock: 25,
    activo: true,
    descripcion: 'Peine antiestático para barba y cabello',
  },
  {
    id: 'producto-6',
    nombre: 'Pomada Mate',
    variante: '100g',
    categoria: 'Capilar',
    costo: 3500,
    venta: 6500,
    stock: 15,
    activo: true,
    descripcion: 'Pomada de acabado mate',
  },
  {
    id: 'producto-7',
    nombre: 'Remera Barbería',
    variante: 'L',
    categoria: 'Ropa',
    costo: 5000,
    venta: 9500,
    stock: 5,
    activo: true,
    descripcion: 'Remera negra con logo',
  },
  {
    id: 'producto-8',
    nombre: 'Remera Barbería',
    variante: 'M',
    categoria: 'Ropa',
    costo: 5000,
    venta: 9500,
    stock: 8,
    activo: true,
    descripcion: 'Remera negra con logo',
  },
  {
    id: 'producto-9',
    nombre: 'Shampoo Keratina',
    variante: '250ml',
    categoria: 'Capilar',
    costo: 4200,
    venta: 7800,
    stock: 0,
    activo: true,
    descripcion: 'Shampoo fortalecedor',
  },
  {
    id: 'producto-10',
    nombre: 'Cepillo Fade',
    variante: '',
    categoria: 'Accesorios',
    costo: 2800,
    venta: 5200,
    stock: 9,
    activo: true,
    descripcion: 'Cepillo para terminaciones',
  },
]

const emptyForm: ProductForm = {
  nombre: '',
  variante: '',
  categoria: '',
  costo: '0',
  venta: '0',
  stock: '0',
  activo: true,
  descripcion: '',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value)
}

function productToForm(product: StockProduct): ProductForm {
  return {
    nombre: product.nombre,
    variante: product.variante,
    categoria: product.categoria,
    costo: String(product.costo),
    venta: String(product.venta),
    stock: String(product.stock),
    activo: product.activo,
    descripcion: product.descripcion,
  }
}

export function InventarioPage() {
  const [activeTab, setActiveTab] = useState<StockTab>('catalogo')
  const [products, setProducts] = useState<StockProduct[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<StockProduct | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        product.nombre.toLowerCase().includes(normalizedSearch) ||
        product.variante.toLowerCase().includes(normalizedSearch) ||
        product.categoria.toLowerCase().includes(normalizedSearch)
      const matchesCategory = categoryFilter === 'Todas' || product.categoria === categoryFilter
      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Activos' && product.activo) ||
        (statusFilter === 'Inactivos' && !product.activo)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [categoryFilter, products, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const pageProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
  const categories = Array.from(new Set(products.map((product) => product.categoria))).filter(Boolean)
  const totalProducts = products.length
  const outOfStock = products.filter((product) => product.stock === 0).length
  const activeProducts = products.filter((product) => product.activo).length
  const isEditing = editingProduct !== null
  const margin = Number(form.venta) - Number(form.costo)

  function openCreateModal() {
    setEditingProduct(null)
    setForm(emptyForm)
    setIsProductModalOpen(true)
  }

  function openEditModal(product: StockProduct) {
    setEditingProduct(product)
    setForm(productToForm(product))
    setIsProductModalOpen(true)
  }

  function closeProductModal() {
    setIsProductModalOpen(false)
    setEditingProduct(null)
    setForm(emptyForm)
  }

  function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nombre = form.nombre.trim()
    if (!nombre) return

    const payload = {
      nombre,
      variante: form.variante.trim(),
      categoria: form.categoria.trim() || 'Sin categoría',
      costo: Number(form.costo) || 0,
      venta: Number(form.venta) || 0,
      stock: Number(form.stock) || 0,
      activo: form.activo,
      descripcion: form.descripcion.trim(),
    }

    if (editingProduct) {
      setProducts((currentProducts) =>
        currentProducts.map((product) => (product.id === editingProduct.id ? { ...product, ...payload } : product)),
      )
    } else {
      setProducts((currentProducts) => [{ id: crypto.randomUUID(), ...payload }, ...currentProducts])
      setCurrentPage(1)
    }

    closeProductModal()
  }

  function deleteProduct(productId: string) {
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId))
    setCurrentPage(1)
  }

  function updateSearch(value: string) {
    setSearch(value)
    setCurrentPage(1)
  }

  function updateCategory(value: string) {
    setCategoryFilter(value)
    setCurrentPage(1)
  }

  function updateStatus(value: string) {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-10 text-white">
      <header>
        <h1 className="text-[30px] font-bold leading-tight text-white">Gestión de Stock</h1>
        <p className="mt-2 text-base text-[#a0a0a0]">Administrá tus productos y registrá ventas para seguirlas desde Caja.</p>
      </header>

      <nav className="mt-8 flex gap-6 overflow-x-auto border-b border-[#334155]">
        {[
          { id: 'catalogo', label: 'Catálogo' },
          { id: 'venta', label: 'Registrar Venta' },
          { id: 'historial', label: 'Historial de Ventas' },
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
          <section className="mt-6 grid gap-4 rounded-lg bg-[#1f2937] p-4 lg:grid-cols-[auto_1fr_auto_130px_auto_130px_auto] lg:items-center">
            <label className="font-bold">Buscar:</label>
            <input
              className="w-full rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]"
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Nombre, variante, categoría..."
              type="search"
              value={search}
            />
            <label className="font-bold">Categoría:</label>
            <select
              className="rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white outline-none focus:border-[#f5c518]"
              onChange={(event) => updateCategory(event.target.value)}
              value={categoryFilter}
            >
              <option>Todas</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <label className="font-bold">Estado:</label>
            <select
              className="rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white outline-none focus:border-[#f5c518]"
              onChange={(event) => updateStatus(event.target.value)}
              value={statusFilter}
            >
              <option>Todos</option>
              <option>Activos</option>
              <option>Inactivos</option>
            </select>
            <button
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#e5c04f] px-6 py-3 font-bold text-[#111827] transition hover:bg-[#f5c518]"
              onClick={openCreateModal}
              type="button"
            >
              <Plus className="h-6 w-6 text-[#7c3aed]" />
              Nuevo Producto
            </button>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-3">
            <SummaryCard accent="border-l-[#3b82f6]" label="Total productos" value={totalProducts} />
            <SummaryCard accent="border-l-[#ef4444]" label="Sin stock" value={outOfStock} />
            <SummaryCard accent="border-l-[#22c55e]" label="Activos" value={activeProducts} />
          </section>

          <section className="mt-5 hidden overflow-hidden rounded-lg border border-[#1f2937] bg-[#111827] xl:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-[#b6c7dc]">
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Margen</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </tr>
              </thead>
              <tbody>
                {pageProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    onDelete={deleteProduct}
                    onEdit={openEditModal}
                    product={product}
                  />
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-5 grid gap-4 xl:hidden">
            {pageProducts.map((product) => (
              <ProductCard key={product.id} onDelete={deleteProduct} onEdit={openEditModal} product={product} />
            ))}
          </section>

          <Pagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalItems={filteredProducts.length}
            totalPages={totalPages}
          />
        </>
      ) : null}

      {activeTab === 'venta' ? <SaleForm products={products.filter((product) => product.activo && product.stock > 0)} /> : null}
      {activeTab === 'historial' ? <SalesHistory /> : null}

      {isProductModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            className="max-h-[92vh] w-full max-w-[672px] overflow-y-auto rounded-lg border border-[#6b5600] bg-[#0b0b0d] text-white shadow-2xl"
            onSubmit={handleProductSubmit}
          >
            <div className="flex items-center justify-between border-b border-[#d1d5db] px-6 py-5">
              <h2 className="text-2xl font-bold">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button aria-label="Cerrar modal" className="text-[#d1d5db] hover:text-white" onClick={closeProductModal} type="button">
                <X className="h-8 w-8" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <label className="block">
                <span className="font-bold">Nombre *</span>
                <input
                  className="mt-2 w-full rounded-lg border border-[#475569] bg-[#1f2937] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]"
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, nombre: event.target.value }))}
                  placeholder="Ej: Shampoo Keratina, Pomada Mate, Remera Oversize"
                  required
                  type="text"
                  value={form.nombre}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="Variante" optional onChange={(value) => setForm((currentForm) => ({ ...currentForm, variante: value }))} placeholder="Ej: 250ml, S, Azul, 1kg" value={form.variante} />
                <FormInput label="Categoría" optional onChange={(value) => setForm((currentForm) => ({ ...currentForm, categoria: value }))} placeholder="Ej: Capilar, Ropa, Accesorios" value={form.categoria} />
                <FormInput label="Precio de Costo" onChange={(value) => setForm((currentForm) => ({ ...currentForm, costo: value }))} type="number" value={form.costo} />
                <label className="block">
                  <span className="font-bold">Precio de Venta *</span>
                  <input
                    className="mt-2 w-full rounded-lg border border-[#475569] bg-[#1f2937] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]"
                    min="0"
                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, venta: event.target.value }))}
                    required
                    type="number"
                    value={form.venta}
                  />
                  {isEditing ? <span className="mt-1 block text-sm text-[#22c55e]">Margen: {formatCurrency(margin)}</span> : null}
                </label>
                <FormInput label="Stock inicial" onChange={(value) => setForm((currentForm) => ({ ...currentForm, stock: value }))} type="number" value={form.stock} />
                <label className="flex items-center gap-3 self-end pb-3 font-bold text-[#d1d5db]">
                  <input
                    checked={form.activo}
                    className="h-5 w-5 accent-[#f5c518]"
                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, activo: event.target.checked }))}
                    type="checkbox"
                  />
                  Activo (disponible para venta)
                </label>
              </div>

              <label className="block">
                <span className="font-bold">Descripción <span className="font-normal text-[#6b7280]">(opcional)</span></span>
                <textarea
                  className="mt-2 min-h-[66px] w-full resize-none rounded-lg border border-[#475569] bg-[#1f2937] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]"
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, descripcion: event.target.value }))}
                  placeholder="Descripción adicional..."
                  value={form.descripcion}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#374151] px-6 py-5 sm:flex-row sm:justify-end">
              <button className="rounded-lg bg-[#475569] px-6 py-3 text-white hover:bg-[#64748b]" onClick={closeProductModal} type="button">
                Cancelar
              </button>
              <button className="rounded-lg bg-[#e5c04f] px-6 py-3 font-bold text-[#111827] hover:bg-[#f5c518]" type="submit">
                {isEditing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

type SummaryCardProps = {
  accent: string
  label: string
  value: number
}

function SummaryCard({ accent, label, value }: SummaryCardProps) {
  return (
    <article className={`rounded-lg border-l-4 ${accent} bg-[#1f2937] p-6`}>
      <p className="font-bold text-[#9fb3ca]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </article>
  )
}

type ProductActionsProps = {
  onDelete: (productId: string) => void
  onEdit: (product: StockProduct) => void
  product: StockProduct
}

function ProductActions({ onDelete, onEdit, product }: ProductActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded bg-[#2563eb] px-4 py-3 text-sm font-bold text-white hover:bg-[#1d4ed8]" onClick={() => onEdit(product)} type="button">
        Editar
      </button>
      <button className="rounded bg-[#16a34a] px-4 py-3 text-sm font-bold text-white hover:bg-[#15803d]" type="button">
        Stock
      </button>
      <button className="rounded bg-[#475569] px-4 py-3 text-sm text-white hover:bg-[#64748b]" type="button">
        {product.activo ? 'Desactivar' : 'Activar'}
      </button>
      <button className="rounded bg-[#e9282d] px-4 py-3 text-sm font-bold text-white hover:bg-[#dc2626]" onClick={() => onDelete(product.id)} type="button">
        Eliminar
      </button>
    </div>
  )
}

function ProductRow({ onDelete, onEdit, product }: ProductActionsProps) {
  const margin = product.venta - product.costo
  const marginPercent = product.costo > 0 ? (margin / product.costo) * 100 : 0

  return (
    <tr className="border-b border-[#1f2937] text-[#b6c7dc]">
      <TableCell>
        <strong className="block text-white">{product.nombre}</strong>
        <span className="text-sm text-[#64748b]">{product.variante || '-'}</span>
      </TableCell>
      <TableCell>{product.categoria}</TableCell>
      <TableCell>{formatCurrency(product.costo)}</TableCell>
      <TableCell><strong className="text-white">{formatCurrency(product.venta)}</strong></TableCell>
      <TableCell>
        <span className="font-bold text-[#22c55e]">+{formatCurrency(margin)}</span>{' '}
        <span className="text-xs text-[#64748b]">({marginPercent.toFixed(2)}%)</span>
      </TableCell>
      <TableCell><span className="rounded border border-[#22c55e] bg-[#064e2a] px-3 py-1 font-bold text-[#4ade80]">{product.stock} u.</span></TableCell>
      <TableCell><span className="font-bold text-[#4ade80]">{product.activo ? 'Activo' : 'Inactivo'}</span></TableCell>
      <TableCell><ProductActions onDelete={onDelete} onEdit={onEdit} product={product} /></TableCell>
    </tr>
  )
}

function ProductCard({ onDelete, onEdit, product }: ProductActionsProps) {
  const margin = product.venta - product.costo

  return (
    <article className="rounded-lg border border-[#1f2937] bg-[#111827] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-white">{product.nombre}</h2>
          <p className="text-sm text-[#64748b]">{product.variante || 'Sin variante'}</p>
        </div>
        <span className="rounded border border-[#22c55e] bg-[#064e2a] px-3 py-1 font-bold text-[#4ade80]">{product.stock} u.</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#b6c7dc]">
        <p>Categoría: <strong>{product.categoria}</strong></p>
        <p>Estado: <strong className="text-[#4ade80]">{product.activo ? 'Activo' : 'Inactivo'}</strong></p>
        <p>Costo: <strong>{formatCurrency(product.costo)}</strong></p>
        <p>Venta: <strong className="text-white">{formatCurrency(product.venta)}</strong></p>
        <p className="col-span-2">Margen: <strong className="text-[#22c55e]">+{formatCurrency(margin)}</strong></p>
      </div>
      <div className="mt-4">
        <ProductActions onDelete={onDelete} onEdit={onEdit} product={product} />
      </div>
    </article>
  )
}

type CellProps = {
  children: React.ReactNode
}

function TableHead({ children }: CellProps) {
  return <th className="px-4 py-4 font-bold">{children}</th>
}

function TableCell({ children }: CellProps) {
  return <td className="px-4 py-4 align-middle">{children}</td>
}

type PaginationProps = {
  currentPage: number
  onPageChange: (page: number) => void
  totalItems: number
  totalPages: number
}

function Pagination({ currentPage, onPageChange, totalItems, totalPages }: PaginationProps) {
  return (
    <div className="mt-5 flex flex-col gap-3 text-[#a0a0a0] sm:flex-row sm:items-center sm:justify-between">
      <p>
        Mostrando página {currentPage} de {totalPages} · {totalItems} productos
      </p>
      <div className="flex gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-[#1f2937] px-4 py-2 text-white disabled:opacity-40"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-[#1f2937] px-4 py-2 text-white disabled:opacity-40"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          type="button"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

type FormInputProps = {
  label: string
  onChange: (value: string) => void
  optional?: boolean
  placeholder?: string
  type?: 'text' | 'number'
  value: string
}

function FormInput({ label, onChange, optional = false, placeholder, type = 'text', value }: FormInputProps) {
  return (
    <label className="block">
      <span className="font-bold">
        {label} {optional ? <span className="font-normal text-[#6b7280]">(opcional)</span> : '*'}
      </span>
      <input
        className="mt-2 w-full rounded-lg border border-[#475569] bg-[#1f2937] px-4 py-3 text-white outline-none placeholder:text-[#9ca3af] focus:border-[#f5c518]"
        min={type === 'number' ? '0' : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={!optional}
        type={type}
        value={value}
      />
    </label>
  )
}

type SaleFormProps = {
  products: StockProduct[]
}

function SaleForm({ products }: SaleFormProps) {
  return (
    <section className="mt-6 rounded-lg bg-[#1f2937] p-6">
      <h2 className="text-xl font-bold">Registrar Venta de Producto</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_140px_140px]">
        <label className="block">
          <span className="font-bold">Producto *</span>
          <select className="mt-2 w-full rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white outline-none focus:border-[#f5c518]">
            <option>Buscá por nombre, variante o categoría...</option>
            {products.map((product) => (
              <option key={product.id}>{product.nombre} {product.variante}</option>
            ))}
          </select>
        </label>
        <FormInput label="Cantidad" onChange={() => undefined} type="number" value="1" />
        <FormInput label="Precio unit." onChange={() => undefined} type="number" value="0.00" />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[176px_1fr]">
        <div className="rounded-lg border border-[#334155] bg-[#111827] p-4 text-center">
          <p className="text-xs uppercase text-[#64748b]">Total</p>
          <p className="mt-2 text-xl font-bold text-[#a0a0a0]">-</p>
        </div>
        <div>
          <p className="mb-2 font-bold">Método de pago</p>
          <div className="grid gap-2 md:grid-cols-3">
            {['Efectivo', 'Transferencia', 'Tarjeta'].map((method, index) => (
              <button className={`rounded-lg border px-4 py-3 font-bold ${index === 0 ? 'border-[#f5c518] bg-[#f5c518]/10' : 'border-[#334155]'}`} key={method} type="button">
                {method}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FormInput label="Vendedor" onChange={() => undefined} optional placeholder="Nombre del vendedor" value="" />
        <FormInput label="Notas" onChange={() => undefined} optional placeholder="Observaciones..." value="" />
      </div>
      <button className="mt-5 w-full rounded-lg bg-[#e5c04f] px-4 py-4 font-bold text-[#111827] hover:bg-[#f5c518]" type="button">
        Confirmar Venta
      </button>
    </section>
  )
}

function SalesHistory() {
  return (
    <>
      <section className="mt-6 flex flex-col gap-4 rounded-lg bg-[#1f2937] p-4 sm:flex-row sm:items-center">
        <label className="font-bold">Fecha:</label>
        <input className="rounded-lg border border-[#6b5600] bg-[#0a0a0a] px-4 py-3 text-white" type="date" defaultValue="2026-05-31" />
        <button className="rounded-lg bg-[#e5c04f] px-6 py-3 font-bold text-[#111827] hover:bg-[#f5c518]" type="button">
          Actualizar
        </button>
      </section>
      <section className="mt-5 grid gap-4 md:grid-cols-4">
        <SummaryCard accent="border-l-[#3b82f6]" label="Ventas del día" value={0} />
        <article className="rounded-lg bg-[#e5c04f] p-6 text-[#111827] shadow-lg shadow-[#e5c04f]/20">
          <p className="font-bold">Total vendido</p>
          <p className="mt-3 text-3xl font-bold">$0,00</p>
        </article>
        <article className="rounded-lg border-l-4 border-l-[#64748b] bg-[#1f2937] p-6">
          <p className="font-bold text-[#9fb3ca]">Efectivo</p>
          <p className="mt-3 text-2xl font-bold text-white">$0,00</p>
        </article>
        <article className="rounded-lg border-l-4 border-l-[#64748b] bg-[#1f2937] p-6">
          <p className="font-bold text-[#9fb3ca]">Transf. + Tarjeta</p>
          <p className="mt-3 text-2xl font-bold text-white">$0,00</p>
        </article>
      </section>
      <section className="mt-5 rounded-lg border border-[#1f2937] bg-[#111827] p-14 text-center text-[#6b7280]">
        No hay ventas registradas para esta fecha.
      </section>
    </>
  )
}

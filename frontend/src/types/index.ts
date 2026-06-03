export type ID = string

export type Estado = 'PENDIENTE' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO' | 'NO_ASISTIO' | 'AUSENTE_FIJO'
export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta'
export type MetodoPagoMock = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA'
export type Rol = 'admin' | 'peluquero'
export type SucursalId = 's1' | 's2'

export type Usuario = {
  id: ID
  email: string
  nombre: string
  rol: 'admin' | 'barbero' | 'cajero'
}

export type UserProfile = {
  uid: string
  rol: Rol
  nombre: string
  email: string
  sucursalesConAccesoCaja: SucursalId[]
}

export type Sucursal = {
  id: SucursalId | string
  nombre: string
  direccion?: string
}

export type Barbero = {
  id: string
  nombre: string
  telefono?: string
  fotoUrl?: string
  isActive?: boolean
  isOwner?: boolean
  porcentajeCasa: number
  colorHex?: string
  sucursalId?: SucursalId
  fechaIngreso?: string
  activo?: boolean
  esDueno?: boolean
}

export type HorarioDia = {
  activo: boolean
  horaInicio: string
  horaFin: string
  descansoInicio?: string
  descansoFin?: string
}

export type HorarioSemanal = {
  barberoId: string
  dias: Record<number, HorarioDia>
}

export type Servicio = {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  duracionMinutos: number
  isActive?: boolean
}

export type Turno = {
  id: string
  clientId?: ID
  sucursalId?: SucursalId
  fecha?: string
  hora?: string
  horaFin?: string
  barberoId?: string
  servicioId: string
  clienteNombre?: string
  clienteTelefono?: string
  estado: Estado | 'pendiente' | 'confirmado' | 'cancelado' | 'finalizado'
  metodoPago?: MetodoPago | MetodoPagoMock
  esFijo?: boolean
  turnoFijoId?: string
  esReemplazoFijo?: boolean
  turnoOriginalId?: string
  notas?: string
  creadoPor?: string
  cliente?: string
  profesionalId?: ID
  fechaInicio?: string
}

export type TurnoFijo = {
  id: string
  sucursalId: SucursalId
  barberoId: string
  servicioId: string
  clienteNombre: string
  clienteTelefono?: string
  diaSemana?: number
  hora: string
  fechasAgendadas: string[]
  activo: boolean
  proximaFecha: string
  pausadoHasta?: string
}

export type StockSucursal = {
  sucursalId: SucursalId
  stockActual: number
}

export type Producto = {
  id: string
  nombre: string
  variante?: string
  categoria: string
  precioCosto: number
  precioVenta: number
  stockPorSucursal: StockSucursal[]
  descripcion?: string
  isActive: boolean
  stockMinimo?: number
}

export type TransferenciaStock = {
  id: string
  productoId: string
  sucursalOrigen: SucursalId
  sucursalDestino: SucursalId
  cantidad: number
  fecha: string
  solicitadoPor: string
  notas?: string
}

export type Venta = {
  id: string
  sucursalId: SucursalId
  fecha: string
  productoId: string
  cantidad: number
  precioUnitario: number
  total: number
  metodoPago: MetodoPagoMock
  vendedorId: string
  notas?: string
}

export type MovimientoCaja = {
  id: ID
  concepto: string
  monto: number
  tipo: 'ingreso' | 'egreso'
  fecha: string
}

export type CajaTurnoRealizado = {
  id: ID
  sucursalId: SucursalId
  fecha: string
  hora: string
  cliente: string
  servicio: string
  barberoId: ID
  barberoNombre: string
  monto: number
  metodoPago: MetodoPago
  estado: 'realizado'
  porcentajeCasa: number
  isOwner: boolean
}

export type CajaVentaProducto = {
  id: ID
  sucursalId: SucursalId
  fecha: string
  hora: string
  producto: string
  cantidad: number
  monto: number
  metodoPago: MetodoPago
}

export type CajaMockData = {
  pines: Record<string, SucursalId[]>
  sucursales: Record<SucursalId, string>
  turnos: CajaTurnoRealizado[]
  ventas: CajaVentaProducto[]
}

export type MontosPorMetodo = Record<MetodoPago, number>

export type CajaMovimiento = {
  id: ID
  tipo: 'servicio' | 'producto'
  hora: string
  descripcion: string
  detalle: string
  monto: number
  metodoPago: MetodoPago
}

export type CajaDiariaResumen = {
  turnosRealizados: number
  ventasProductos: number
  totalDia: number
  serviciosPorMetodo: MontosPorMetodo
  productosPorMetodo: MontosPorMetodo
  movimientos: CajaMovimiento[]
}

export type LiquidacionBarbero = {
  barberoId: ID
  barberoNombre: string
  turnosRealizados: number
  montoBruto: number
  comisionBarbero: number
  parteCasa: number
}

export type LiquidacionResumen = {
  filas: LiquidacionBarbero[]
  totalBruto: number
  totalComisiones: number
  totalCasa: number
}

export type MetricaServicio = {
  servicio: string
  cantidad: number
  total: number
}

export type MetricaBarbero = {
  barberoId: ID
  barberoNombre: string
  turnos: number
  recaudado: number
  comision: number
}

export type MetricaProducto = {
  producto: string
  unidades: number
  total: number
}

export type MetricasMensualesResumen = {
  totalMes: number
  totalServicios: number
  totalProductos: number
  turnosRealizados: number
  servicios: MetricaServicio[]
  barberos: MetricaBarbero[]
  productos: MetricaProducto[]
}

export type Notification = {
  id: ID
  message: string
  type: 'success' | 'error' | 'info'
}

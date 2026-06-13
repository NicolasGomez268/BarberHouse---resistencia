export type ID = string

export type Estado = 'PENDIENTE' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO' | 'NO_ASISTIO' | 'AUSENTE_FIJO'
export type MetodoPagoCaja = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA'
export type MetodoPago = MetodoPagoCaja | 'MIXTO' | 'PREPAGO'
export type SucursalId = 's1' | 's2'

export type Usuario = {
  id: ID
  email: string
  nombre: string
  rol: 'admin' | 'barbero'
  sucursalesConAccesoCaja: SucursalId[]
  barberoId?: string
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
  activo?: boolean
  esDueno?: boolean
  porcentajeCasa: number
  colorHex?: string
  sucursalId?: SucursalId
  fechaIngreso?: string
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
  activo?: boolean
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
  metodoPago?: MetodoPago
  montoEfectivo?: number
  montoTransferencia?: number
  esFijo?: boolean
  turnoFijoId?: string
  esReemplazoFijo?: boolean
  turnoOriginalId?: string
  prepagado?: boolean
  paquetePrepagId?: string
  notas?: string
  creadoPor?: string
  cliente?: string
  profesionalId?: ID
  fechaInicio?: string
  fechaPago?: string
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
  proximaFecha: string
  prepagado?: boolean
  paquetePrepagId?: string
}

export type PaquetePrepago = {
  id: string
  sucursalId: string
  clienteNombre: string
  clienteTelefono: string
  cantidadTotal: number
  cantidadUsada: number
  precioTotal: number
  metodoPago: MetodoPago
  montoEfectivo?: number
  montoTransferencia?: number
  fecha: string
  hora: string
  creadoPor?: string
}

export type Producto = {
  id: string
  nombre: string
  variante?: string
  categoria?: string
  precioCosto?: number
  precioVenta?: number
  stockActual?: number
  stockMinimo?: number
  descripcion?: string
  activo?: boolean
}

export type Venta = {
  id: string
  sucursalId: SucursalId
  fecha: string
  productoId: string
  productoNombre?: string
  cantidad: number
  precioUnitario: number
  total: number
  metodoPago: MetodoPago
  vendedorId: string
  notas?: string
}

export type CierreDeCaja = {
  id: string
  sucursalId: string
  fecha: string
  sistemaEfectivo: number
  sistemaTransferencia: number
  contadoEfectivo: number
  contadoTransferencia: number
  oficialEfectivo: number
  oficialTransferencia: number
  diferenciaEfectivo: number
  diferenciaTransferencia: number
}

export type MovimientoCaja = {
  id: ID
  concepto: string
  monto: number
  tipo: 'ingreso' | 'egreso'
  fecha: string
}

export type MontosPorMetodo = Record<MetodoPagoCaja, number>

export type CajaMovimiento = {
  id: ID
  tipo: 'servicio' | 'producto' | 'paquete'
  hora: string
  descripcion: string
  detalle: string
  monto: number
  metodoPago: MetodoPago
  montoEfectivo?: number
  montoTransferencia?: number
}

export type CajaDiariaResumen = {
  turnosRealizados: number
  ventasProductos: number
  totalDia: number
  serviciosPorMetodo: MontosPorMetodo
  productosPorMetodo: MontosPorMetodo
  paquetesPorMetodo: MontosPorMetodo
  movimientos: CajaMovimiento[]
  paquetesMovimientos: CajaMovimiento[]
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

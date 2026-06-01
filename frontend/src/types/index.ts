export type ID = string

export type Usuario = {
  id: ID
  email: string
  nombre: string
  rol: 'admin' | 'barbero' | 'cajero'
}

export type Barbero = {
  id: ID
  nombre: string
  telefono?: string
  activo: boolean
  esDueno: boolean
  porcentajeCasa: number
  fotoUrl: string
}

export type Sucursal = {
  id: ID
  nombre: string
}

export type Turno = {
  id: ID
  cliente: string
  servicioId: ID
  profesionalId: ID
  fechaInicio: string
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'finalizado'
}

export type Servicio = {
  id: ID
  nombre: string
  precio: number
  duracionMinutos: number
}

export type Producto = {
  id: ID
  nombre: string
  stock: number
  stockMinimo: number
}

export type MovimientoCaja = {
  id: ID
  concepto: string
  monto: number
  tipo: 'ingreso' | 'egreso'
  fecha: string
}

export type Notification = {
  id: ID
  message: string
  type: 'success' | 'error' | 'info'
}

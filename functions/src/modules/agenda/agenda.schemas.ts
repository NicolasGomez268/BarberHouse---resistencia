import { z } from 'zod'

export const sucursalIdSchema = z.enum(['s1', 's2'])

export const estadoSchema = z.enum(['PENDIENTE', 'CONFIRMADO', 'REALIZADO', 'CANCELADO', 'NO_ASISTIO', 'AUSENTE_FIJO'])

export const metodoPagoSchema = z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'])

// GET /agenda — query params
export const turnosFiltersSchema = z.object({
  sucursalId: sucursalIdSchema.optional(),
  barberoId: z.string().optional(),
  fecha: z.string().optional(),
})
export type TurnosFilters = z.infer<typeof turnosFiltersSchema>

// POST /agenda
export const createTurnoSchema = z.object({
  sucursalId: sucursalIdSchema,
  barberoId: z.string().min(1),
  servicioId: z.string().min(1),
  clienteNombre: z.string().min(1),
  clienteTelefono: z.string().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  horaFin: z.string().optional(),
  esFijo: z.boolean().optional(),
  turnoFijoId: z.string().optional(),
  notas: z.string().optional(),
})
export type CreateTurnoInput = z.infer<typeof createTurnoSchema>

// Turno devuelto por la API
export const turnoDataSchema = z.object({
  id: z.string(),
  sucursalId: sucursalIdSchema.optional(),
  barberoId: z.string().optional(),
  servicioId: z.string(),
  clienteNombre: z.string().optional(),
  clienteTelefono: z.string().optional(),
  fecha: z.string().optional(),
  hora: z.string().optional(),
  horaFin: z.string().optional(),
  estado: estadoSchema,
  metodoPago: metodoPagoSchema.optional(),
  esFijo: z.boolean().optional(),
  turnoFijoId: z.string().optional(),
  esReemplazoFijo: z.boolean().optional(),
  turnoOriginalId: z.string().optional(),
  notas: z.string().optional(),
  creadoPor: z.string().optional(),
})
export type TurnoData = z.infer<typeof turnoDataSchema>

// PATCH /agenda/:id/realizado
export const realizadoSchema = z.object({
  metodoPago: metodoPagoSchema,
})
export type RealizadoInput = z.infer<typeof realizadoSchema>

// POST /agenda/:id/reemplazo-fijo
export const reemplazoFijoSchema = z.object({
  clienteNombre: z.string().min(1),
  clienteTelefono: z.string().optional(),
  servicioId: z.string().min(1),
  metodoPago: metodoPagoSchema.optional(),
})
export type ReemplazoFijoInput = z.infer<typeof reemplazoFijoSchema>

// GET /agenda/fijos — query params
export const turnosFijosFiltersSchema = z.object({
  sucursalId: sucursalIdSchema.optional(),
  barberoId: z.string().optional(),
})
export type TurnosFijosFilters = z.infer<typeof turnosFijosFiltersSchema>

// POST /agenda/fijos
export const createTurnoFijoSchema = z.object({
  sucursalId: sucursalIdSchema,
  barberoId: z.string().min(1),
  servicioId: z.string().min(1),
  clienteNombre: z.string().min(1),
  clienteTelefono: z.string().optional(),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  fechasAgendadas: z.array(z.string()).min(1),
  proximaFecha: z.string(),
  diaSemana: z.number().int().min(0).max(6).optional(),
})
export type CreateTurnoFijoInput = z.infer<typeof createTurnoFijoSchema>

// PATCH /agenda/fijos/:id
export const updateTurnoFijoSchema = createTurnoFijoSchema.partial().extend({
  cascadeToFutureTurnos: z.boolean().optional(),
})
export type UpdateTurnoFijoInput = z.infer<typeof updateTurnoFijoSchema>

// PATCH /agenda/:id
export const updateTurnoSchema = z.object({
  hora: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  horaFin: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  barberoId: z.string().min(1).optional(),
  sucursalId: sucursalIdSchema.optional(),
  servicioId: z.string().min(1).optional(),
})
export type UpdateTurnoInput = z.infer<typeof updateTurnoSchema>

// TurnoFijo devuelto por la API
export const turnoFijoDataSchema = createTurnoFijoSchema.extend({
  id: z.string(),
})
export type TurnoFijoData = z.infer<typeof turnoFijoDataSchema>

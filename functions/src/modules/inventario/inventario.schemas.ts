import { z } from 'zod'

export const productoSchema = z.object({
  nombre: z.string().min(1),
  variante: z.string().optional(),
  categoria: z.string().optional(),
  precioCosto: z.number().positive().optional(),
  precioVenta: z.number().positive().optional(),
  stockActual: z.number().int().min(0).optional().default(0),
  stockMinimo: z.number().int().min(0).optional().default(0),
  descripcion: z.string().optional(),
  activo: z.boolean().optional().default(true),
})

export type ProductoInput = z.infer<typeof productoSchema>

export const productoUpdateSchema = productoSchema.partial()

export type ProductoUpdateInput = z.infer<typeof productoUpdateSchema>

export const ajusteStockSchema = z.object({
  operacion: z.enum(['agregar', 'restar', 'establecer']),
  cantidad: z.number().int().positive(),
})

export type AjusteStockInput = z.infer<typeof ajusteStockSchema>

export const ventaSchema = z.object({
  sucursalId: z.string().min(1),
  productoId: z.string().min(1),
  cantidad: z.number().int().positive(),
  metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA']),
  vendedorId: z.string().min(1),
  notas: z.string().optional(),
})

export type VentaInput = z.infer<typeof ventaSchema>

export const ventaItemSchema = z.object({
  productoId: z.string().min(1),
  cantidad: z.number().int().positive(),
})

export const ventaMultipleSchema = z.object({
  sucursalId: z.string().min(1),
  items: z.array(ventaItemSchema).min(1),
  metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA']),
  vendedorId: z.string().min(1),
  notas: z.string().optional(),
})

export type VentaItemInput = z.infer<typeof ventaItemSchema>
export type VentaMultipleInput = z.infer<typeof ventaMultipleSchema>

export const ventaDataSchema = ventaSchema.extend({
  id: z.string(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().optional(),
  productoNombre: z.string().optional(),
  precioUnitario: z.number().positive(),
  total: z.number().positive(),
})

export type VentaData = z.infer<typeof ventaDataSchema>

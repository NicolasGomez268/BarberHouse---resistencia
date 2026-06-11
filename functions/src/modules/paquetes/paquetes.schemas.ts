import { z } from 'zod'
import { metodoPagoVentaSchema, sucursalIdSchema } from '../agenda/agenda.schemas'

export const createPaqueteSchema = z
  .object({
    sucursalId: sucursalIdSchema,
    clienteNombre: z.string().min(1),
    clienteTelefono: z.string().min(1),
    cantidadTotal: z.number().int().positive(),
    precioTotal: z.number().positive(),
    metodoPago: metodoPagoVentaSchema,
    montoEfectivo: z.number().positive().optional(),
    montoTransferencia: z.number().positive().optional(),
  })
  .refine(
    (data) =>
      data.metodoPago !== 'MIXTO' ||
      ((data.montoEfectivo ?? 0) > 0 && (data.montoTransferencia ?? 0) > 0),
    { message: 'Para pago mixto se requieren montoEfectivo y montoTransferencia positivos' },
  )

export type CreatePaqueteInput = z.infer<typeof createPaqueteSchema>

export type PaqueteData = {
  id: string
  sucursalId: string
  clienteNombre: string
  clienteTelefono: string
  cantidadTotal: number
  cantidadUsada: number
  precioTotal: number
  metodoPago: string
  montoEfectivo?: number
  montoTransferencia?: number
  fecha: string
  hora: string
  creadoPor?: string
}

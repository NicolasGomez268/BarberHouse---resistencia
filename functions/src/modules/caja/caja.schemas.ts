import { z } from 'zod'

export const movimientoCajaSchema = z.object({
  concepto: z.string().min(1),
  monto: z.number(),
  tipo: z.enum(['ingreso', 'egreso']),
})

export type MovimientoCajaInput = z.infer<typeof movimientoCajaSchema>

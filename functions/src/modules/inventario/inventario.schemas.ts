import { z } from 'zod'

export const productoSchema = z.object({
  nombre: z.string().min(1),
  stock: z.number().int().nonnegative(),
  stockMinimo: z.number().int().nonnegative(),
})

export type ProductoInput = z.infer<typeof productoSchema>

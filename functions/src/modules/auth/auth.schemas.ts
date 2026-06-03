import { z } from 'zod'

export const loginSchema = z.object({
  token: z.string().min(1),
})

export type LoginInput = z.infer<typeof loginSchema>

export const sucursalIdSchema = z.enum(['s1', 's2'])
export type SucursalId = z.infer<typeof sucursalIdSchema>

export const usuarioSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nombre: z.string(),
  rol: z.literal('admin'),
  sucursalesConAccesoCaja: z.array(sucursalIdSchema),
})

export type UsuarioData = z.infer<typeof usuarioSchema>

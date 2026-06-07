import { z } from 'zod'

export const loginSchema = z.object({
  token: z.string().min(1),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registroSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})
export type RegistroInput = z.infer<typeof registroSchema>

export const sucursalIdSchema = z.enum(['s1', 's2'])
export type SucursalId = z.infer<typeof sucursalIdSchema>

export const rolSchema = z.enum(['admin', 'barbero'])
export type Rol = z.infer<typeof rolSchema>

export const usuarioSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nombre: z.string(),
  rol: rolSchema,
  sucursalesConAccesoCaja: z.array(sucursalIdSchema).default([]),
  barberoId: z.string().optional(),
})
export type UsuarioData = z.infer<typeof usuarioSchema>

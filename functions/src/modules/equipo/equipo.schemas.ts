import { z } from 'zod'

export const barberoSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().optional(),
  fotoUrl: z.string().optional(),
  porcentajeCasa: z.number().min(0).max(100),
  colorHex: z.string().optional(),
  sucursalId: z.string().optional(),
  fechaIngreso: z.string().optional(),
  activo: z.boolean().optional().default(true),
  esDueno: z.boolean().optional().default(false),
})

export type BarberoInput = z.infer<typeof barberoSchema>

export const barberoUpdateSchema = barberoSchema.partial()

export type BarberoUpdateInput = z.infer<typeof barberoUpdateSchema>

export const horarioSchema = z.object({
  barberoId: z.string().min(1),
  dias: z.record(
    z.coerce.number(),
    z.object({
      activo: z.boolean(),
      horaInicio: z.string(),
      horaFin: z.string(),
      descansoInicio: z.string().optional(),
      descansoFin: z.string().optional(),
    }),
  ),
})

export type HorarioInput = z.infer<typeof horarioSchema>

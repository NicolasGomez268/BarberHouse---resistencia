import { z } from 'zod'

export const turnoSchema = z.object({
  cliente: z.string().min(1),
  servicioId: z.string().min(1),
  profesionalId: z.string().min(1),
  fechaInicio: z.string().min(1),
})

export type TurnoInput = z.infer<typeof turnoSchema>

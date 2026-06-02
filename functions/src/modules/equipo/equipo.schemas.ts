import { z } from 'zod'

export const miembroEquipoSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  rol: z.enum(['admin', 'barbero', 'cajero']),
})

export type MiembroEquipoInput = z.infer<typeof miembroEquipoSchema>

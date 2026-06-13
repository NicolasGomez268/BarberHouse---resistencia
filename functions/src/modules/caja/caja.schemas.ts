import { z } from 'zod'

export const validarPinSchema = z.object({
  pin: z.string().min(1),
})
export type ValidarPinInput = z.infer<typeof validarPinSchema>

export const cajaDiariaParamsSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sucursalId: z.string().min(1),
})
export type CajaDiariaParams = z.infer<typeof cajaDiariaParamsSchema>

export const liquidacionParamsSchema = z.object({
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sucursalId: z.string().min(1),
})
export type LiquidacionParams = z.infer<typeof liquidacionParamsSchema>

export const metricasParamsSchema = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  anio: z.coerce.number().int().min(2020),
  sucursalId: z.string().min(1),
})
export type MetricasParams = z.infer<typeof metricasParamsSchema>

export const createCierreSchema = z.object({
  sucursalId: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sistemaEfectivo: z.number().min(0),
  sistemaTransferencia: z.number().min(0),
  contadoEfectivo: z.number().min(0),
  contadoTransferencia: z.number().min(0),
  oficialEfectivo: z.number().min(0),
  oficialTransferencia: z.number().min(0),
})
export type CreateCierreInput = z.infer<typeof createCierreSchema>

export const getCierreParamsSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sucursalId: z.string().min(1),
})
export type GetCierreParams = z.infer<typeof getCierreParamsSchema>

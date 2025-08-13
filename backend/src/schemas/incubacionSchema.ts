// src/schemas/incubacionSchema.ts
import { z } from "zod"

const norm = (s: string) => s.trim().replace(/\s+/g, " ")

// ===== Schemas =====
export const createIncubacionSchema = z.object({
  id_incubadora: z.number({ required_error: "Incubadora es obligatoria" }).int().positive(),
  fecha_inicio: z.string().min(1, "Fecha de inicio es obligatoria"), // YYYY-MM-DD
  lote: z.string().transform(norm).optional().nullable(),
  temperatura: z.number().optional().nullable(),
  cantidad_huevos: z.number().int().positive().optional().nullable(),
  observaciones: z.string().transform(norm).optional().nullable(),
})

export const updateIncubacionSchema = z
  .object({
    id_incubadora: z.number().int().positive().optional(),
    fecha_inicio: z.string().optional(),
    lote: z.string().transform(norm).optional().nullable(),
    temperatura: z.number().optional().nullable(),
    cantidad_huevos: z.number().int().positive().optional().nullable(),
    observaciones: z.string().transform(norm).optional().nullable(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "Debe enviar al menos un campo para actualizar" })

export const changeEstadoSchema = z.object({
  estado: z.enum(["activo", "completado", "cancelado"]),
})

export const incubacionIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID debe ser un número válido"),
})

export const filtroIncubacionesSchema = z.object({
  id_incubadora: z.string().regex(/^\d+$/).optional(),
  estado: z.enum(["activo", "completado", "cancelado"]).optional(),
  desde: z.string().optional(), // YYYY-MM-DD
  hasta: z.string().optional(), // YYYY-MM-DD
  q: z.string().optional(),
})

// ===== Funciones de validación esperadas por validationEngine =====
// Nota: usamos .parse() (NO safeParse) para que lance ZodError si es inválido.
export const validateIncubacion = (data: unknown) => createIncubacionSchema.parse(data)
export const validateIncubacionUpdate = (data: unknown) => updateIncubacionSchema.parse(data)

// (Opcional si alguna parte lo necesita)
export const validateIncubacionEstado = (data: unknown) => changeEstadoSchema.parse(data)

export type CreateIncubacionData = z.infer<typeof createIncubacionSchema>
export type UpdateIncubacionData = z.infer<typeof updateIncubacionSchema>
export type ChangeEstadoData = z.infer<typeof changeEstadoSchema>
export type IncubacionIdParams = z.infer<typeof incubacionIdParamsSchema>
export type FiltroIncubaciones = z.infer<typeof filtroIncubacionesSchema>

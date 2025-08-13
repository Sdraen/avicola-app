import { z } from "zod"

const norm = (s: string) => s.trim().replace(/\s+/g, " ")

// ===== Schemas =====
export const createNacimientoSchema = z.object({
  id_incubacion: z.number({ required_error: "Incubación es obligatoria" }).int().positive(),
  fecha_nacimiento: z.string().min(1, "Fecha de nacimiento es obligatoria"), // YYYY-MM-DD
  sexo: z.string().transform(norm).optional().nullable(),
  observaciones: z.string().transform(norm).optional().nullable(),
})

// Si necesitas edición parcial de nacimiento (opcional)
export const updateNacimientoSchema = z
  .object({
    fecha_nacimiento: z.string().optional(),
    sexo: z.string().transform(norm).optional().nullable(),
    observaciones: z.string().transform(norm).optional().nullable(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Debe enviar al menos un campo para actualizar",
  })

export const nacimientoIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID debe ser un número válido"),
})

// ===== Funciones de validación esperadas por validationEngine =====
export const validateNacimiento = (data: unknown) => createNacimientoSchema.parse(data)
export const validateNacimientoUpdate = (data: unknown) => updateNacimientoSchema.parse(data)

export type CreateNacimientoData = z.infer<typeof createNacimientoSchema>
export type UpdateNacimientoData = z.infer<typeof updateNacimientoSchema>
export type NacimientoIdParams = z.infer<typeof nacimientoIdParamsSchema>

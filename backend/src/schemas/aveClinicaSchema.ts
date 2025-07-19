import { z } from "zod"

// Schema para crear un registro clínico
export const createAveClinicaSchema = z.object({
  id_ave: z.number().int().positive("El ID del ave debe ser un número positivo"),
  id_jaula: z.number().int().positive("El ID de la jaula debe ser un número positivo"),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de inicio debe tener formato YYYY-MM-DD"),
  fecha_fin: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de fin debe tener formato YYYY-MM-DD")
    .optional(),
  descripcion: z
    .string()
    .min(1, "La descripción es requerida")
    .max(500, "La descripción no puede exceder 500 caracteres"),
})

// Schema para actualizar un registro clínico
export const updateAveClinicaSchema = z.object({
  fecha_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de inicio debe tener formato YYYY-MM-DD")
    .optional(),
  fecha_fin: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de fin debe tener formato YYYY-MM-DD")
    .optional(),
  descripcion: z
    .string()
    .min(1, "La descripción es requerida")
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
})

// Schema para registrar fallecimiento
export const createAveFallecidaSchema = z.object({
  id_ave: z.number().int().positive("El ID del ave debe ser un número positivo"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),
  motivo: z.string().min(1, "El motivo es requerido").max(200, "El motivo no puede exceder 200 caracteres"),
})

// Schema para parámetros de ID
export const aveIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El ID debe ser un número positivo",
    }),
})

export type CreateAveClinicaInput = z.infer<typeof createAveClinicaSchema>
export type UpdateAveClinicaInput = z.infer<typeof updateAveClinicaSchema>
export type CreateAveFallecidaInput = z.infer<typeof createAveFallecidaSchema>

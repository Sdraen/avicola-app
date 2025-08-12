import { z } from "zod"

/**
 * =========================
 *  VACUNA SCHEMAS
 *  (fecha_administracion OBLIGATORIA)
 * =========================
 */

// Base
export const vacunaBaseSchema = z.object({
  nombre: z
    .string({ required_error: "Nombre es obligatorio" })
    .trim()
    .min(1, "Nombre es obligatorio")
  ,
  dosis: z
    .string({ required_error: "Dosis es obligatoria" })
    .trim()
    .min(1, "Dosis es obligatoria")
  ,
  fecha_administracion: z
    .string({ required_error: "Fecha de administración es obligatoria" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe estar en formato YYYY-MM-DD")
    .refine((d) => new Date(d) <= new Date(), "La fecha no puede ser futura"),
})

// Crear
export const createVacunaSchema = vacunaBaseSchema

// Actualizar (al menos 1 campo)
export const updateVacunaSchema = vacunaBaseSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Debe enviar al menos un campo para actualizar" })

// Params :id
export const vacunaIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID debe ser un número válido"),
})

/**
 * =========================
 *  Validadores (funciones)
 * =========================
 */
export const validateVacuna = (data: unknown) => createVacunaSchema.parse(data)
export const validateVacunaUpdate = (data: unknown) => updateVacunaSchema.parse(data)
export const validateVacunaId = (params: unknown) => vacunaIdSchema.parse(params)

/**
 * =========================
 *  (Opcional) Aplicación
 *  - útil si activas endpoints /vacunas/aplicar
 * =========================
 */
export const aplicacionVacunaSchema = z.object({
  id_vacuna: z.number().int().positive(),
  id_jaula: z.number().int().positive(),
  fecha_administracion: z
    .string({ required_error: "Fecha de administración es obligatoria" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe estar en formato YYYY-MM-DD")
    .refine((d) => new Date(d) <= new Date(), "La fecha no puede ser futura"),
})

export const validateAplicacionVacuna = (data: unknown) => aplicacionVacunaSchema.parse(data)

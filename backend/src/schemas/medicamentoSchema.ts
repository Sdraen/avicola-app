import { z } from "zod"

/**
 * =========================
 *  MEDICAMENTO SCHEMAS
 *  (acorde al backend Opción A)
 * =========================
 */

// Base
export const medicamentoBaseSchema = z.object({
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
})

// Crear
export const createMedicamentoSchema = medicamentoBaseSchema

// Actualizar (al menos 1 campo)
export const updateMedicamentoSchema = medicamentoBaseSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Debe enviar al menos un campo para actualizar" })

// Params :id
export const medicamentoIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID debe ser un número válido"),
})

/**
 * =========================
 *  Validadores (funciones)
 * =========================
 */
export const validateMedicamento = (data: unknown) => createMedicamentoSchema.parse(data)
export const validateMedicamentoUpdate = (data: unknown) => updateMedicamentoSchema.parse(data)
export const validateMedicamentoId = (params: unknown) => medicamentoIdSchema.parse(params)

/**
 * =========================
 *  (Opcional) Aplicación
 *  - útil si activas endpoints /medicamentos/aplicar
 * =========================
 */
export const aplicacionMedicamentoSchema = z.object({
  id_medicamento: z.number().int().positive(),
  id_estanque: z.number().int().positive(),
  fecha_administracion: z
    .string({ required_error: "Fecha de administración es obligatoria" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe estar en formato YYYY-MM-DD")
    .refine((d) => new Date(d) <= new Date(), "La fecha no puede ser futura"),
})

export const validateAplicacionMedicamento = (data: unknown) => aplicacionMedicamentoSchema.parse(data)

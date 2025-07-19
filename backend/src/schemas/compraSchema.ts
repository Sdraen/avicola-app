import { z } from "zod"

// Schema para crear una compra
export const createCompraSchema = z.object({
  fecha: z.string().optional(),
  costo_total: z.number().positive("El costo total debe ser mayor a 0"),
  proveedor: z.string().optional(),
  implementos: z
    .array(
      z.object({
        nombre: z.string().min(1, "El nombre es requerido"),
        cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
        precio_unitario: z.number().positive("El precio unitario debe ser mayor a 0"),
        categoria: z.string().optional(),
        descripcion: z.string().optional(),
        estado: z.string().optional(),
        ubicacion: z.string().optional(),
      }),
    )
    .optional(),
})

// Schema para actualizar una compra
export const updateCompraSchema = z.object({
  fecha: z.string().optional(),
  costo_total: z.number().positive("El costo total debe ser mayor a 0").optional(),
  proveedor: z.string().optional(),
})

// Tipos derivados de los schemas
export type CreateCompraInput = z.infer<typeof createCompraSchema>
export type UpdateCompraInput = z.infer<typeof updateCompraSchema>

// Validaciones legacy (mantenidas para compatibilidad)
import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS } from "./constants"

export const compraValidationRules: ValidationRule[] = [
  {
    field: "fecha",
    required: false,
    type: "date",
    custom: (value) => {
      if (value && new Date(value) > new Date()) {
        return "fecha no puede ser futura"
      }
      return null
    },
  },
  {
    field: "costo_total",
    required: true,
    type: "number",
    min: 0.01,
    max: VALIDATION_LIMITS.PRECIO_MAX,
    custom: (value) => {
      if (typeof value === "number" && value > 50000) {
        return "costo_total parece muy alto, verificar"
      }
      if (typeof value === "number" && (value * 100) % 1 !== 0) {
        return "costo_total no puede tener más de 2 decimales"
      }
      return null
    },
  },
]

export const validateCompra = (data: any) => {
  return BaseValidator.validate(data, compraValidationRules)
}

export const validateCompraUpdate = (data: any) => {
  const updateRules = compraValidationRules.map((rule) => ({
    ...rule,
    required: false,
  }))
  return BaseValidator.validate(data, updateRules)
}

// Validation for implementos
export const implementoValidationRules: ValidationRule[] = [
  {
    field: "nombre",
    required: true,
    type: "string",
    minLength: VALIDATION_LIMITS.NOMBRE_MIN,
    maxLength: VALIDATION_LIMITS.NOMBRE_MAX,
  },
  {
    field: "cantidad",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "precio_unitario",
    required: false,
    type: "number",
    min: 0,
  },
  {
    field: "id_compra",
    required: false,
    type: "number",
    min: 1,
  },
]

export const validateImplemento = (data: any) => {
  return BaseValidator.validate(data, implementoValidationRules)
}

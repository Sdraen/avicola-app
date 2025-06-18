import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS, VALIDATION_PATTERNS } from "./constants"

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
    type: "string",
    pattern: VALIDATION_PATTERNS.DECIMAL,
    custom: (value) => {
      const num = Number.parseFloat(value)
      if (num <= 0) {
        return "cantidad debe ser mayor a 0"
      }
      return null
    },
  },
  {
    field: "costo_unitario",
    required: false,
    type: "string",
    pattern: VALIDATION_PATTERNS.DECIMAL,
    custom: (value) => {
      if (value) {
        const num = Number.parseFloat(value)
        if (num < 0) {
          return "costo_unitario no puede ser negativo"
        }
      }
      return null
    },
  },
  {
    field: "id_compras",
    required: false,
    type: "number",
    min: 1,
  },
]

export const validateImplemento = (data: any) => {
  return BaseValidator.validate(data, implementoValidationRules)
}

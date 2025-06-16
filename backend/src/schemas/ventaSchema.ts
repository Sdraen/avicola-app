import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS, VALIDATION_PATTERNS } from "./constants"

export const ventaValidationRules: ValidationRule[] = [
  {
    field: "id_cliente",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "codigo_barras",
    required: true,
    type: "number",
    min: 1,
    custom: (value) => {
      if (!VALIDATION_PATTERNS.CODIGO_BARRAS.test(value.toString())) {
        return "codigo_barras debe tener entre 8 y 13 dígitos"
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
      if (typeof value === "number" && value > 10000) {
        return "costo_total parece muy alto, verificar"
      }
      // Check for more than 2 decimal places
      if (typeof value === "number" && (value * 100) % 1 !== 0) {
        return "costo_total no puede tener más de 2 decimales"
      }
      return null
    },
  },
  {
    field: "cantidad_total",
    required: true,
    type: "number",
    min: 1,
    max: VALIDATION_LIMITS.CANTIDAD_MAX,
  },
  {
    field: "fecha_venta",
    required: false,
    type: "date",
    custom: (value) => {
      if (value && new Date(value) > new Date()) {
        return "fecha_venta no puede ser futura"
      }
      return null
    },
  },
]

export const validateVenta = (data: any) => {
  const baseValidation = BaseValidator.validate(data, ventaValidationRules)

  // Business logic validation: price per unit should be reasonable
  if (baseValidation.isValid && data.costo_total && data.cantidad_total) {
    const precioUnitario = data.costo_total / data.cantidad_total
    if (precioUnitario < 0.1) {
      baseValidation.errors.push("El precio por unidad es muy bajo (menos de $0.10)")
      baseValidation.isValid = false
    }
  }

  return baseValidation
}

export const validateVentaUpdate = (data: any) => {
  const updateRules = ventaValidationRules.map((rule) => ({
    ...rule,
    required: false,
  }))
  return validateVenta(data)
}

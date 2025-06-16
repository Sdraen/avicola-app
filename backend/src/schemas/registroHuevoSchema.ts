import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS } from "./constants"

export const registroHuevoValidationRules: ValidationRule[] = [
  {
    field: "fecha_recoleccion",
    required: true,
    type: "date",
    custom: (value) => {
      if (value && new Date(value) > new Date()) {
        return "fecha_recoleccion no puede ser futura"
      }
      return null
    },
  },
  {
    field: "cantidad_total",
    required: true,
    type: "number",
    min: 1,
    max: 1000, // Max eggs per day for entire farm
  },
  {
    field: "huevos_cafe_chico",
    required: false,
    type: "number",
    min: 0,
  },
  {
    field: "huevos_cafe_mediano",
    required: false,
    type: "number",
    min: 0,
  },
  {
    field: "huevos_cafe_grande",
    required: false,
    type: "number",
    min: 0,
  },
  {
    field: "huevos_cafe_jumbo",
    required: false,
    type: "number",
    min: 0,
  },
  {
    field: "huevos_blanco_chico",
    required: false,
    type: "number",
    min: 0,
  },
  {
    field: "huevos_blanco_mediano",
    required: false,
    type: "number",
    min: 0,
  },
  {
    field: "huevos_blanco_grande",
    required: false,
    type: "number",
    min: 0,
  },
  {
    field: "huevos_blanco_jumbo",
    required: false,
    type: "number",
    min: 0,
  },
  {
    field: "observaciones",
    required: false,
    type: "string",
    maxLength: VALIDATION_LIMITS.OBSERVACIONES_MAX,
  },
]

export const validateRegistroHuevo = (data: any) => {
  const baseValidation = BaseValidator.validate(data, registroHuevoValidationRules)

  // Additional validation: sum of classified eggs should not exceed total
  if (baseValidation.isValid) {
    const totalClasificado =
      (data.huevos_cafe_chico || 0) +
      (data.huevos_cafe_mediano || 0) +
      (data.huevos_cafe_grande || 0) +
      (data.huevos_cafe_jumbo || 0) +
      (data.huevos_blanco_chico || 0) +
      (data.huevos_blanco_mediano || 0) +
      (data.huevos_blanco_grande || 0) +
      (data.huevos_blanco_jumbo || 0)

    if (totalClasificado > data.cantidad_total) {
      baseValidation.errors.push(
        `Los huevos clasificados (${totalClasificado}) no pueden exceder el total (${data.cantidad_total})`,
      )
      baseValidation.isValid = false
    }
  }

  return baseValidation
}

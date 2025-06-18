import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS } from "./constants"

export const huevoValidationRules: ValidationRule[] = [
  {
    field: "id_jaula",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "fecha_recoleccion",
    required: true,
    type: "date",
    custom: (value) => {
      const today = new Date()
      const inputDate = new Date(value)
      const diffDays = Math.ceil((today.getTime() - inputDate.getTime()) / (1000 * 3600 * 24))

      if (diffDays > 7) {
        return "fecha_recoleccion no puede ser mayor a 7 días en el pasado"
      }
      if (diffDays < -1) {
        return "fecha_recoleccion no puede ser en el futuro"
      }
      return null
    },
  },
  {
    field: "cantidad_total",
    required: true,
    type: "number",
    min: 1,
    max: VALIDATION_LIMITS.HUEVOS_POR_JAULA_MAX,
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

export const validateHuevo = (data: any) => {
  const baseValidation = BaseValidator.validate(data, huevoValidationRules)

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

export const validateHuevoUpdate = (data: any) => {
  const updateRules = huevoValidationRules.map((rule) => ({
    ...rule,
    required: false,
  }))
  return validateHuevo(data) // Use the same logic for updates
}

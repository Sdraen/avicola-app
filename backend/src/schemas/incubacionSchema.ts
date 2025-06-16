import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALID_ENUMS } from "./constants"

export const incubacionValidationRules: ValidationRule[] = [
  {
    field: "id_incubadora",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "id_huevo",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "fecha_inicio",
    required: true,
    type: "date",
    custom: (value) => {
      if (value && new Date(value) > new Date()) {
        return "fecha_inicio no puede ser futura"
      }
      return null
    },
  },
  {
    field: "fecha_fin",
    required: false,
    type: "date",
    custom: (value, data) => {
      if (value && data?.fecha_inicio) {
        const inicio = new Date(data.fecha_inicio)
        const fin = new Date(value)
        if (fin <= inicio) {
          return "fecha_fin debe ser posterior a fecha_inicio"
        }
        // Check if incubation period is reasonable (max 25 days)
        const diffDays = (fin.getTime() - inicio.getTime()) / (1000 * 3600 * 24)
        if (diffDays > 25) {
          return "el período de incubación no puede exceder 25 días"
        }
      }
      return null
    },
  },
  {
    field: "estado",
    required: true,
    type: "string",
    enum: VALID_ENUMS.ESTADO_INCUBACION,
  },
]

export const validateIncubacion = (data: any) => {
  return BaseValidator.validate(data, incubacionValidationRules)
}

export const validateIncubacionUpdate = (data: any) => {
  const updateRules = incubacionValidationRules.map((rule) => ({
    ...rule,
    required: false,
  }))
  return BaseValidator.validate(data, updateRules)
}

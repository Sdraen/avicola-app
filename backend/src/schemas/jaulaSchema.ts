import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS, VALID_ENUMS } from "./constants"

export const jaulaValidationRules: ValidationRule[] = [
  {
    field: "id_estanque",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "descripcion",
    required: false,
    type: "string",
    maxLength: VALIDATION_LIMITS.DESCRIPCION_MAX,
  },
]

export const validateJaula = (data: any) => {
  return BaseValidator.validate(data, jaulaValidationRules)
}

export const validateJaulaUpdate = (data: any) => {
  const updateRules = jaulaValidationRules.map((rule) => ({
    ...rule,
    required: false,
  }))
  return BaseValidator.validate(data, updateRules)
}

// Validation for hygiene services
export const servicioHigieneValidationRules: ValidationRule[] = [
  {
    field: "tipo",
    required: true,
    type: "string",
    enum: VALID_ENUMS.TIPO_HIGIENE,
  },
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
    field: "descripcion",
    required: false,
    type: "string",
    maxLength: VALIDATION_LIMITS.DESCRIPCION_MAX,
  },
]

export const validateServicioHigiene = (data: any) => {
  return BaseValidator.validate(data, servicioHigieneValidationRules)
}

import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS, VALIDATION_PATTERNS } from "./constants"

export const razaValidationRules: ValidationRule[] = [
  {
    field: "nombre",
    required: true,
    type: "string",
    minLength: VALIDATION_LIMITS.NOMBRE_MIN,
    maxLength: VALIDATION_LIMITS.NOMBRE_MAX,
    pattern: VALIDATION_PATTERNS.LETTERS_ONLY,
    custom: (value) => {
      if (typeof value === "string" && value.trim().length === 0) {
        return "nombre no puede estar vacío"
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
  {
    field: "activa",
    required: false,
    type: "boolean",
  },
]

export const validateRaza = (data: any) => {
  return BaseValidator.validate(data, razaValidationRules)
}

export const validateRazaUpdate = (data: any) => {
  const updateRules = razaValidationRules.map((rule) => ({
    ...rule,
    required: false,
  }))
  return BaseValidator.validate(data, updateRules)
}

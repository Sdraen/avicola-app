import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS } from "./constants"

export const vacunaValidationRules: ValidationRule[] = [
  {
    field: "nombre",
    required: true,
    type: "string",
    minLength: VALIDATION_LIMITS.NOMBRE_MIN,
    maxLength: VALIDATION_LIMITS.NOMBRE_MAX,
  },
  {
    field: "dosis",
    required: false,
    type: "string",
    maxLength: 100,
  },
  {
    field: "fecha_adminstracion",
    required: false,
    type: "date",
    custom: (value) => {
      if (value && new Date(value) > new Date()) {
        return "fecha_adminstracion no puede ser futura"
      }
      return null
    },
  },
]

export const validateVacuna = (data: any) => {
  return BaseValidator.validate(data, vacunaValidationRules)
}

export const validateVacunaUpdate = (data: any) => {
  const updateRules = vacunaValidationRules.map((rule) => ({
    ...rule,
    required: false,
  }))
  return BaseValidator.validate(data, updateRules)
}

// Validation for vaccine application
export const aplicacionVacunaValidationRules: ValidationRule[] = [
  {
    field: "id_vacuna",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "id_jaula",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "fecha_aplicacion",
    required: false,
    type: "date",
    custom: (value) => {
      if (value && new Date(value) > new Date()) {
        return "fecha_aplicacion no puede ser futura"
      }
      return null
    },
  },
  {
    field: "dosis_aplicada",
    required: false,
    type: "string",
    maxLength: 50,
  },
]

export const validateAplicacionVacuna = (data: any) => {
  return BaseValidator.validate(data, aplicacionVacunaValidationRules)
}

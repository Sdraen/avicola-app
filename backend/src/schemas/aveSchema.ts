import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_PATTERNS, VALIDATION_LIMITS, VALID_ENUMS } from "./constants"

export const aveValidationRules: ValidationRule[] = [
  {
    field: "id_jaula",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "color_anillo",
    required: true,
    type: "string",
    minLength: 3,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.COLOR_ANILLO,
    custom: (value) => {
      if (typeof value === "string" && value.includes(" ")) {
        return "color_anillo no puede contener espacios"
      }
      return null
    },
  },
  {
    field: "edad",
    required: true,
    type: "string",
    pattern: VALIDATION_PATTERNS.POSITIVE_INTEGER,
    custom: (value) => {
      const age = Number.parseInt(value)
      if (age < VALIDATION_LIMITS.EDAD_MIN || age > VALIDATION_LIMITS.EDAD_MAX) {
        return `edad debe estar entre ${VALIDATION_LIMITS.EDAD_MIN} y ${VALIDATION_LIMITS.EDAD_MAX} semanas`
      }
      return null
    },
  },
  {
    field: "estado_puesta",
    required: true,
    type: "string",
    enum: VALID_ENUMS.ESTADO_PUESTA,
  },
  {
    field: "raza",
    required: true,
    type: "string",
    minLength: VALIDATION_LIMITS.NOMBRE_MIN,
    maxLength: VALIDATION_LIMITS.NOMBRE_MAX,
    pattern: VALIDATION_PATTERNS.LETTERS_ONLY,
  },
  {
    field: "fecha_registro",
    required: false,
    type: "date",
    custom: (value) => {
      if (value && new Date(value) > new Date()) {
        return "fecha_registro no puede ser futura"
      }
      return null
    },
  },
]

export const validateAve = (data: any) => {
  return BaseValidator.validate(data, aveValidationRules)
}

export const validateAveUpdate = (data: any) => {
  // For updates, make all fields optional except those being updated
  const updateRules = aveValidationRules.map((rule) => ({
    ...rule,
    required: false,
  }))
  return BaseValidator.validate(data, updateRules)
}

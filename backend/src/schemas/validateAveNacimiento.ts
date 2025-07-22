import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_PATTERNS, VALIDATION_LIMITS } from "./constants"

export const aveNacimientoRules: ValidationRule[] = [
  {
    field: "id_jaula",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "id_anillo",
    required: true,
    type: "string",
    minLength: 1,
    maxLength: 10,
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
    field: "raza",
    required: true,
    type: "string",
    minLength: VALIDATION_LIMITS.NOMBRE_MIN,
    maxLength: VALIDATION_LIMITS.NOMBRE_MAX,
    pattern: VALIDATION_PATTERNS.LETTERS_ONLY,
  },
  {
    field: "sexo",
    required: true,
    type: "string",
    enum: ["macho", "hembra"],
  },
  {
    field: "fecha_nacimiento",
    required: true,
    type: "date",
    custom: (value) => {
      if (new Date(value) > new Date()) {
        return "La fecha de nacimiento no puede ser futura"
      }
      return null
    },
  },
]

export const validateAveNacimiento = (data: any) => {
  return BaseValidator.validate(data, aveNacimientoRules)
}

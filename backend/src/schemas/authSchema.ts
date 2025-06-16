import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS, VALID_ENUMS, VALIDATION_PATTERNS } from "./constants"

export const usuarioValidationRules: ValidationRule[] = [
  {
    field: "email",
    required: true,
    type: "email",
    maxLength: 255,
  },
  {
    field: "password",
    required: true,
    type: "string",
    minLength: 6,
    maxLength: 100,
    custom: (value) => {
      if (typeof value === "string") {
        // Password must contain at least one lowercase, one uppercase, and one number
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "password debe contener al menos una minúscula, una mayúscula y un número"
        }
      }
      return null
    },
  },
  {
    field: "nombre",
    required: true,
    type: "string",
    minLength: VALIDATION_LIMITS.NOMBRE_MIN,
    maxLength: VALIDATION_LIMITS.NOMBRE_MAX,
    pattern: VALIDATION_PATTERNS.NO_SPECIAL_CHARS,
  },
  {
    field: "rol",
    required: false,
    type: "string",
    enum: VALID_ENUMS.ROL_USUARIO,
  },
]

export const loginValidationRules: ValidationRule[] = [
  {
    field: "email",
    required: true,
    type: "email",
  },
  {
    field: "password",
    required: true,
    type: "string",
    minLength: 1,
  },
]

export const validateUsuario = (data: any) => {
  return BaseValidator.validate(data, usuarioValidationRules)
}

export const validateLogin = (data: any) => {
  return BaseValidator.validate(data, loginValidationRules)
}

export const validateUsuarioUpdate = (data: any) => {
  // For user updates, password is not required
  const updateRules = usuarioValidationRules
    .filter((rule) => rule.field !== "password")
    .map((rule) => ({
      ...rule,
      required: false,
    }))
  return BaseValidator.validate(data, updateRules)
}

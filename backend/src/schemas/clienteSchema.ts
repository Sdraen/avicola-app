import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS, VALID_ENUMS, VALIDATION_PATTERNS } from "./constants"

export const clienteValidationRules: ValidationRule[] = [
  {
    field: "nombre",
    required: true,
    type: "string",
    minLength: VALIDATION_LIMITS.NOMBRE_MIN,
    maxLength: VALIDATION_LIMITS.NOMBRE_MAX,
    pattern: VALIDATION_PATTERNS.NO_SPECIAL_CHARS,
    custom: (value) => {
      if (typeof value === "string" && value.trim().length === 0) {
        return "nombre no puede estar vacío"
      }
      return null
    },
  },
  {
    field: "direccion",
    required: false,
    type: "string",
    maxLength: VALIDATION_LIMITS.DESCRIPCION_MAX,
  },
  {
    field: "telefono",
    required: false,
    type: "phone",
  },
  {
    field: "tipo_cliente",
    required: false,
    type: "string",
    enum: VALID_ENUMS.TIPO_CLIENTE,
  },
]

export const validateCliente = (data: any) => {
  return BaseValidator.validate(data, clienteValidationRules)
}

export const validateClienteUpdate = (data: any) => {
  const updateRules = clienteValidationRules.map((rule) => ({
    ...rule,
    required: false,
  }))
  return BaseValidator.validate(data, updateRules)
}

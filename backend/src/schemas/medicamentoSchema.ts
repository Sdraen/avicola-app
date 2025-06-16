import { BaseValidator, type ValidationRule } from "./baseValidation"
import { VALIDATION_LIMITS } from "./constants"

export const medicamentoValidationRules: ValidationRule[] = [
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
]

export const validateMedicamento = (data: any) => {
  return BaseValidator.validate(data, medicamentoValidationRules)
}

export const validateMedicamentoUpdate = (data: any) => {
  const updateRules = medicamentoValidationRules.map((rule) => ({
    ...rule,
    required: false,
  }))
  return BaseValidator.validate(data, updateRules)
}

// Validation for medication application
export const aplicacionMedicamentoValidationRules: ValidationRule[] = [
  {
    field: "id_medicamento",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "id_estanque",
    required: true,
    type: "number",
    min: 1,
  },
  {
    field: "fecha_administracion",
    required: false,
    type: "date",
    custom: (value) => {
      if (value && new Date(value) > new Date()) {
        return "fecha_administracion no puede ser futura"
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
  {
    field: "motivo",
    required: false,
    type: "string",
    maxLength: VALIDATION_LIMITS.DESCRIPCION_MAX,
  },
]

export const validateAplicacionMedicamento = (data: any) => {
  return BaseValidator.validate(data, aplicacionMedicamentoValidationRules)
}

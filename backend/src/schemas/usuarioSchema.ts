import { createValidator, type ValidationResult } from "./validationHelpers"
import { ValidationLimits, ValidEnums, ValidationPatterns } from "./commonValidation"

export interface UsuarioCreateData {
  email: string
  password: string
  nombre: string
  rol?: string
}

export interface UsuarioUpdateData extends Partial<Omit<UsuarioCreateData, "password">> {}

export interface LoginData {
  email: string
  password: string
}

export const validateUsuarioCreate = (data: UsuarioCreateData): ValidationResult => {
  const validator = createValidator()

  return (
    validator
      // email validation
      .required(data.email, "email")
      .string(data.email, "email")
      .email(data.email, "email")
      .maxLength(data.email, 255, "email")

      // password validation
      .required(data.password, "password")
      .string(data.password, "password")
      .minLength(data.password, 6, "password")
      .maxLength(data.password, 100, "password")
      .custom(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password),
        "password debe contener al menos una minúscula, una mayúscula y un número",
      )

      // nombre validation
      .required(data.nombre, "nombre")
      .string(data.nombre, "nombre")
      .minLength(data.nombre, ValidationLimits.NOMBRE_MIN, "nombre")
      .maxLength(data.nombre, ValidationLimits.NOMBRE_MAX, "nombre")
      .pattern(
        data.nombre,
        ValidationPatterns.NO_SPECIAL_CHARS,
        "nombre",
        "nombre solo puede contener letras, números, espacios, guiones y guiones bajos",
      )

      // rol validation (optional, defaults to 'operador')
      .enum(data.rol || "operador", ValidEnums.ROL_USUARIO, "rol")

      .getResult()
  )
}

export const validateUsuarioUpdate = (data: UsuarioUpdateData): ValidationResult => {
  const validator = createValidator()

  // Only validate provided fields
  if (data.email !== undefined) {
    validator.string(data.email, "email").email(data.email, "email").maxLength(data.email, 255, "email")
  }

  if (data.nombre !== undefined) {
    validator
      .string(data.nombre, "nombre")
      .minLength(data.nombre, ValidationLimits.NOMBRE_MIN, "nombre")
      .maxLength(data.nombre, ValidationLimits.NOMBRE_MAX, "nombre")
      .pattern(
        data.nombre,
        ValidationPatterns.NO_SPECIAL_CHARS,
        "nombre",
        "nombre solo puede contener letras, números, espacios, guiones y guiones bajos",
      )
  }

  if (data.rol !== undefined) {
    validator.enum(data.rol, ValidEnums.ROL_USUARIO, "rol")
  }

  return validator.getResult()
}

export const validateLogin = (data: LoginData): ValidationResult => {
  const validator = createValidator()

  return (
    validator
      // email validation
      .required(data.email, "email")
      .string(data.email, "email")
      .email(data.email, "email")

      // password validation
      .required(data.password, "password")
      .string(data.password, "password")
      .minLength(data.password, 1, "password")

      .getResult()
  )
}

export const validateEmailAvailability = (email: string): ValidationResult => {
  const validator = createValidator()

  return validator
    .required(email, "email")
    .string(email, "email")
    .email(email, "email")
    .maxLength(email, 255, "email")
    .getResult()
}

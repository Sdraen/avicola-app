import { ZodError } from "zod"
import type { ValidationResult } from "./validationHelpers"
import * as schemas from "./index"

// Wrapper sin 'data' (solo isValid y errors)
const wrapValidator =
  <T>(fn: (data: any) => T) =>
  (data: any): ValidationResult => {
    try {
      fn(data) // si parsea, es válido
      return { isValid: true, errors: [] }
    } catch (err: any) {
      if (err instanceof ZodError) {
        return { isValid: false, errors: err.errors.map((e) => e.message) }
      }
      return { isValid: false, errors: [err?.message || "Validation error"] }
    }
  }

// ===== Validación por entidad
export const validateEntityData = (
  entity: string,
  data: any,
  operation: "create" | "update" = "create",
): ValidationResult => {
  const key = entity.toLowerCase()

  const createMap: Record<string, (d: any) => ValidationResult> = {
    huevo: wrapValidator(schemas.validateHuevo),
    venta: wrapValidator(schemas.validateVenta),
    compra: wrapValidator(schemas.validateCompra),
    medicamento: wrapValidator(schemas.validateMedicamento),
    vacuna: wrapValidator(schemas.validateVacuna),
    incubacion: wrapValidator(schemas.validateIncubacion),
    nacimiento: wrapValidator(schemas.validateNacimiento),
    raza: wrapValidator(schemas.validateRaza),
    registro_huevo: wrapValidator(schemas.validateRegistroHuevo),
    registro_huevos: wrapValidator(schemas.validateRegistroHuevo),
    usuario: wrapValidator(schemas.validateUsuario),
    login: wrapValidator(schemas.validateLogin),
  }

  const updateMap: Record<string, (d: any) => ValidationResult> = {
    huevo: wrapValidator(schemas.validateHuevoUpdate),
    venta: wrapValidator(schemas.validateVentaUpdate),
    compra: wrapValidator(schemas.validateCompraUpdate),
    medicamento: wrapValidator(schemas.validateMedicamentoUpdate),
    vacuna: wrapValidator(schemas.validateVacunaUpdate),
    incubacion: wrapValidator(schemas.validateIncubacionUpdate),
    nacimiento: wrapValidator(schemas.validateNacimientoUpdate),
    raza: wrapValidator(schemas.validateRazaUpdate),
    usuario: wrapValidator(schemas.validateUsuarioUpdate),
  }

  const map = operation === "update" ? updateMap : createMap
  const validator = map[key]
  if (!validator) return { isValid: false, errors: [`Unknown entity type: ${entity}`] }
  return validator(data)
}

// ===== Operaciones especiales
export const validateSpecialOperation = (operation: string, data: any): ValidationResult => {
  const key = operation.toLowerCase()

  const operationMap: Record<string, (d: any) => ValidationResult> = {
    huevos_bulk: wrapValidator(schemas.validateHuevo),

    aplicacion_medicamento: wrapValidator(schemas.validateAplicacionMedicamento),
    medicamento_aplicacion: wrapValidator(schemas.validateAplicacionMedicamento),

    aplicacion_vacuna: wrapValidator(schemas.validateAplicacionVacuna),
    vacuna_aplicacion: wrapValidator(schemas.validateAplicacionVacuna),

    implemento: wrapValidator(schemas.validateImplemento),

    medicamento_search: wrapValidator(schemas.validateMedicamento),
    vacuna_search: wrapValidator(schemas.validateVacuna),

    email_availability: wrapValidator(schemas.validateUsuario),
  }

  const validator = operationMap[key]
  if (!validator) return { isValid: false, errors: [`Unknown operation: ${operation}`] }
  return validator(data)
}

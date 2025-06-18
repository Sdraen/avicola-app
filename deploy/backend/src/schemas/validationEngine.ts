import type { ValidationResult } from "./validationHelpers"
import * as schemas from "./index"

// Main validation engine that routes to appropriate schema
export const validateEntityData = (
  entity: string,
  data: any,
  operation: "create" | "update" = "create",
): ValidationResult => {
  try {
    const entityMap: Record<string, (data: any) => ValidationResult> = {
      ave: schemas.validateAve,
      huevo: schemas.validateHuevo,
      cliente: schemas.validateCliente,
      venta: schemas.validateVenta,
      compra: schemas.validateCompra,
      jaula: schemas.validateJaula,
      medicamento: schemas.validateMedicamento,
      vacuna: schemas.validateVacuna,
      incubacion: schemas.validateIncubacion,
      raza: schemas.validateRaza,
      registro_huevo: schemas.validateRegistroHuevo,
      registro_huevos: schemas.validateRegistroHuevo,
      usuario: schemas.validateUsuario,
      login: schemas.validateLogin,
    };

    const key = entity.toLowerCase();
    const validator = entityMap[key];
    if (validator) {
      return validator(data);
    } else {
      return {
        isValid: false,
        errors: [`Unknown entity type: ${entity}`],
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}


// Validate specific operations
export const validateSpecialOperation = (operation: string, data: any): ValidationResult => {
  try {
    const operationMap: Record<string, (data: any) => ValidationResult> = {
      huevos_bulk: (d) => schemas.validateHuevo(d),
      medicamento_aplicacion: (d) => schemas.validateMedicamento(d),
      vacuna_aplicacion: (d) => schemas.validateVacuna(d),
      servicio_higiene: (d) => schemas.validateServicioHigiene(d),
      incubadora_create: (d) => schemas.validateIncubacion(d),
      nacimiento_create: (d) => schemas.validateIncubacion(d),
      implemento: (d) => schemas.validateImplemento(d),
      cliente_search: (d) => schemas.validateCliente(d),
      medicamento_search: (d) => schemas.validateMedicamento(d),
      vacuna_search: (d) => schemas.validateVacuna(d),
      email_availability: (d) => schemas.validateUsuario(d),
    };

    const key = operation.toLowerCase();
    const validator = operationMap[key];
    if (validator) {
      return validator(data);
    } else {
      return {
        isValid: false,
        errors: [`Unknown operation: ${operation}`],
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}

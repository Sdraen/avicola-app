// Exportar todas las validaciones de schemas
export * from "./aveSchema"
export * from "./clienteSchema"
export * from "./huevoSchema"
export * from "./jaulaSchema"
export * from "./ventaSchema"
export * from "./medicamentoSchema"

// Función principal de validación que usa el patrón tipado
export const validateEntityData = (entity: string, data: any): { isValid: boolean; errors: string[] } => {
  switch (entity) {
    case "ave":
      const { validateAveData } = require("./aveSchema")
      return validateAveData(data)
    case "cliente":
      const { validateClienteData } = require("./clienteSchema")
      return validateClienteData(data)
    case "huevo":
      const { validateHuevoData } = require("./huevoSchema")
      return validateHuevoData(data)
    case "jaula":
      const { validateJaulaData } = require("./jaulaSchema")
      return validateJaulaData(data)
    case "venta":
      const { validateVentaData } = require("./ventaSchema")
      return validateVentaData(data)
    case "medicamento":
      const { validateMedicamentoData } = require("./medicamentoSchema")
      return validateMedicamentoData(data)
    default:
      return { isValid: true, errors: [] }
  }
}

// Función para obtener las reglas de validación de una entidad
export const getValidationRules = (entity: string): any => {
  switch (entity) {
    case "ave":
      const { aveValidationRules } = require("./aveSchema")
      return aveValidationRules
    case "cliente":
      const { clienteValidationRules } = require("./clienteSchema")
      return clienteValidationRules
    case "huevo":
      const { huevoValidationRules } = require("./huevoSchema")
      return huevoValidationRules
    case "jaula":
      const { jaulaValidationRules } = require("./jaulaSchema")
      return jaulaValidationRules
    case "venta":
      const { ventaValidationRules } = require("./ventaSchema")
      return ventaValidationRules
    case "medicamento":
      const { medicamentoValidationRules } = require("./medicamentoSchema")
      return medicamentoValidationRules
    default:
      return {}
  }
}

// ✅ Función para obtener los valores por defecto de una entidad
export const getDefaultValues = (entity: string): any => {
  const today = new Date().toISOString().split("T")[0]

  switch (entity) {
    case "huevo":
      return {
        fecha_recoleccion: today,
        huevos_cafe_chico: 0,
        huevos_cafe_mediano: 0,
        huevos_cafe_grande: 0,
        huevos_cafe_jumbo: 0,
        huevos_blanco_chico: 0,
        huevos_blanco_mediano: 0,
        huevos_blanco_grande: 0,
        huevos_blanco_jumbo: 0,
      }
    case "venta":
      return {
        fecha_venta: today,
      }
    case "ave":
      return {
        fecha_registro: today,
        estado_puesta: "activa",
      }
    case "jaula":
      return {
        estado: "activa",
        capacidad_maxima: 20,
      }
    case "medicamento":
      return {
        activo: true,
      }
    default:
      return {}
  }
}

// Función para obtener los campos requeridos de una entidad
export const getRequiredFields = (entity: string): string[] => {
  const rules = getValidationRules(entity)
  const required: string[] = []

  Object.keys(rules).forEach((field) => {
    const rule = rules[field]
    if (rule && rule.required === true) {
      required.push(field)
    }
  })

  return required
}

export interface MedicamentoValidationRules {
  nombre: {
    required: true
    type: "string"
    minLength: 3
    maxLength: 100
  }
  dosis: {
    required: true
    type: "string"
    pattern: RegExp
  }
  tipo: {
    type: "string"
    enum: string[]
  }
  fecha_vencimiento: {
    type: "string"
    pattern: RegExp
  }
  lote: {
    type: "string"
    pattern: RegExp
  }
}

// Patrones de validación
export const DOSIS_PATTERN = /^\d+(\.\d+)?\s*(mg|ml|g|l|cc|UI)(\s*\/\s*(kg|ave|día))?$/i
export const FECHA_VENCIMIENTO_PATTERN = /^\d{4}-\d{2}-\d{2}$/
export const LOTE_PATTERN = /^[A-Z0-9-]+$/

// Enums válidos
export const TIPOS_MEDICAMENTO = ["antibiótico", "vitamina", "antiparasitario", "antiinflamatorio", "probiótico"]

// Función de validación para medicamentos
export const validateMedicamentoData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validar nombre
  if (!data.nombre) {
    errors.push("nombre es requerido")
  } else if (typeof data.nombre !== "string") {
    errors.push("nombre debe ser texto")
  } else if (data.nombre.length < 3 || data.nombre.length > 100) {
    errors.push("nombre debe tener entre 3 y 100 caracteres")
  }

  // Validar dosis
  if (!data.dosis) {
    errors.push("dosis es requerida")
  } else if (typeof data.dosis !== "string") {
    errors.push("dosis debe ser texto")
  } else if (!DOSIS_PATTERN.test(data.dosis)) {
    errors.push("dosis debe tener formato válido (ej: 5mg/kg, 10ml/ave)")
  }

  // Validar tipo (opcional)
  if (data.tipo && !TIPOS_MEDICAMENTO.includes(data.tipo)) {
    errors.push(`tipo debe ser uno de: ${TIPOS_MEDICAMENTO.join(", ")}`)
  }

  // Validar fecha_vencimiento (opcional)
  if (data.fecha_vencimiento) {
    if (typeof data.fecha_vencimiento !== "string") {
      errors.push("fecha_vencimiento debe ser texto")
    } else if (!FECHA_VENCIMIENTO_PATTERN.test(data.fecha_vencimiento)) {
      errors.push("fecha_vencimiento debe tener formato YYYY-MM-DD")
    } else {
      const fechaVencimiento = new Date(data.fecha_vencimiento)
      const hoy = new Date()
      if (fechaVencimiento <= hoy) {
        errors.push("fecha_vencimiento debe ser futura")
      }
    }
  }

  // Validar lote (opcional)
  if (data.lote) {
    if (typeof data.lote !== "string") {
      errors.push("lote debe ser texto")
    } else if (!LOTE_PATTERN.test(data.lote)) {
      errors.push("lote debe contener solo letras mayúsculas, números y guiones")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

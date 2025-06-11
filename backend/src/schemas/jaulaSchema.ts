export interface JaulaValidationRules {
  id_estanque: {
    required: true
    type: "number"
    min: 1
  }
  descripcion: {
    required: true
    type: "string"
    minLength: 5
    maxLength: 100
    pattern: RegExp
  }
  capacidad_maxima: {
    type: "number"
    min: 1
    max: 100
    default: 20
  }
}

// Patrones de validación
export const DESCRIPCION_PATTERN = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/

// Función de validación para jaulas
export const validateJaulaData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validar id_estanque
  if (!data.id_estanque) {
    errors.push("id_estanque es requerido")
  } else if (typeof data.id_estanque !== "number" || data.id_estanque < 1) {
    errors.push("id_estanque debe ser un número mayor a 0")
  }

  // Validar descripcion
  if (!data.descripcion) {
    errors.push("descripcion es requerida")
  } else if (typeof data.descripcion !== "string") {
    errors.push("descripcion debe ser texto")
  } else if (data.descripcion.length < 5 || data.descripcion.length > 100) {
    errors.push("descripcion debe tener entre 5 y 100 caracteres")
  } else if (!DESCRIPCION_PATTERN.test(data.descripcion)) {
    errors.push("descripcion contiene caracteres no válidos")
  }

  // Validar capacidad_maxima (opcional)
  if (data.capacidad_maxima !== undefined) {
    if (typeof data.capacidad_maxima !== "number") {
      errors.push("capacidad_maxima debe ser un número")
    } else if (data.capacidad_maxima < 1 || data.capacidad_maxima > 100) {
      errors.push("capacidad_maxima debe estar entre 1 y 100")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

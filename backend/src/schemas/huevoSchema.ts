export interface IdJaulaRule {
  required: true
  type: "number"
  min: number
  exists: "jaula"
}

export interface FechaRecoleccionRule {
  required: true
  type: "string"
  pattern: RegExp
  validate: "notFuture"
}

export interface CantidadTotalRule {
  required: true
  type: "number"
  min: number
  max: number
}

export interface HuevosCafeRule {
  type: "number"
  min: number
  max: number
}

export interface HuevosBlancoRule {
  type: "number"
  min: number
  max: number
}

export interface ObservacionesRule {
  type: "string"
  maxLength: number
}

export interface RegistradoPorRule {
  required: true
  type: "number"
  exists: "usuario"
}

export interface HuevoValidationRules {
  id_jaula: IdJaulaRule // ✅ Cambiado de id_ave a id_jaula
  fecha_recoleccion: FechaRecoleccionRule
  cantidad_total: CantidadTotalRule
  huevos_cafe_chico?: HuevosCafeRule
  huevos_cafe_mediano?: HuevosCafeRule
  huevos_cafe_grande?: HuevosCafeRule
  huevos_cafe_jumbo?: HuevosCafeRule
  huevos_blanco_chico?: HuevosBlancoRule
  huevos_blanco_mediano?: HuevosBlancoRule
  huevos_blanco_grande?: HuevosBlancoRule
  huevos_blanco_jumbo?: HuevosBlancoRule
  observaciones?: ObservacionesRule
  registrado_por: RegistradoPorRule
}

export const huevoValidationRules: HuevoValidationRules = {
  id_jaula: {
    // ✅ Cambiado de id_ave a id_jaula
    required: true,
    type: "number",
    min: 1,
    exists: "jaula",
  },
  fecha_recoleccion: {
    required: true,
    type: "string",
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    validate: "notFuture",
  },
  cantidad_total: {
    required: true,
    type: "number",
    min: 1,
    max: 500, // ✅ Reducido de 1000 a 500 por jaula
  },
  huevos_cafe_chico: {
    type: "number",
    min: 0,
    max: 500,
  },
  huevos_cafe_mediano: {
    type: "number",
    min: 0,
    max: 500,
  },
  huevos_cafe_grande: {
    type: "number",
    min: 0,
    max: 500,
  },
  huevos_cafe_jumbo: {
    type: "number",
    min: 0,
    max: 500,
  },
  huevos_blanco_chico: {
    type: "number",
    min: 0,
    max: 500,
  },
  huevos_blanco_mediano: {
    type: "number",
    min: 0,
    max: 500,
  },
  huevos_blanco_grande: {
    type: "number",
    min: 0,
    max: 500,
  },
  huevos_blanco_jumbo: {
    type: "number",
    min: 0,
    max: 500,
  },
  observaciones: {
    type: "string",
    maxLength: 500,
  },
  registrado_por: {
    required: true,
    type: "number",
    exists: "usuario",
  },
}

export const validateNotFutureDate = (fecha: string): boolean => {
  const fechaRecoleccion = new Date(fecha)
  const hoy = new Date()
  hoy.setHours(23, 59, 59, 999) // Permitir hasta el final del día actual
  return fechaRecoleccion <= hoy
}

export const validateEggClassificationSum = (data: any): boolean => {
  const totalClasificado =
    (data.huevos_cafe_chico || 0) +
    (data.huevos_cafe_mediano || 0) +
    (data.huevos_cafe_grande || 0) +
    (data.huevos_cafe_jumbo || 0) +
    (data.huevos_blanco_chico || 0) +
    (data.huevos_blanco_mediano || 0) +
    (data.huevos_blanco_grande || 0) +
    (data.huevos_blanco_jumbo || 0)

  return totalClasificado <= data.cantidad_total
}

export const validateHuevoData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // ✅ Validar id_jaula (cambiado de id_ave)
  if (!data.id_jaula) {
    errors.push("id_jaula es requerido")
  } else if (typeof data.id_jaula !== "number" || data.id_jaula < huevoValidationRules.id_jaula.min) {
    errors.push("id_jaula debe ser un número mayor a 0")
  }

  // Validar fecha_recoleccion
  if (!data.fecha_recoleccion) {
    errors.push("fecha_recoleccion es requerida")
  } else if (typeof data.fecha_recoleccion !== "string") {
    errors.push("fecha_recoleccion debe ser texto")
  } else if (!huevoValidationRules.fecha_recoleccion.pattern.test(data.fecha_recoleccion)) {
    errors.push("fecha_recoleccion debe tener formato YYYY-MM-DD")
  } else if (!validateNotFutureDate(data.fecha_recoleccion)) {
    errors.push("fecha_recoleccion no puede ser futura")
  }

  // Validar cantidad_total
  if (!data.cantidad_total) {
    errors.push("cantidad_total es requerida")
  } else if (typeof data.cantidad_total !== "number") {
    errors.push("cantidad_total debe ser un número")
  } else if (
    data.cantidad_total < huevoValidationRules.cantidad_total.min ||
    data.cantidad_total > huevoValidationRules.cantidad_total.max
  ) {
    errors.push(
      `cantidad_total debe estar entre ${huevoValidationRules.cantidad_total.min} y ${huevoValidationRules.cantidad_total.max}`,
    )
  }

  // Validar clasificación de huevos (opcional)
  const eggFields = [
    "huevos_cafe_chico",
    "huevos_cafe_mediano",
    "huevos_cafe_grande",
    "huevos_cafe_jumbo",
    "huevos_blanco_chico",
    "huevos_blanco_mediano",
    "huevos_blanco_grande",
    "huevos_blanco_jumbo",
  ]

  for (const field of eggFields) {
    if (data[field] !== undefined) {
      if (typeof data[field] !== "number") {
        errors.push(`${field} debe ser un número`)
      } else if (data[field] < 0 || data[field] > 500) {
        errors.push(`${field} debe estar entre 0 y 500`)
      }
    }
  }

  // Validar que la suma de clasificación no exceda el total
  if (data.cantidad_total && !validateEggClassificationSum(data)) {
    errors.push("La suma de huevos clasificados no puede exceder el total")
  }

  // Validar observaciones (opcional)
  if (data.observaciones) {
    if (typeof data.observaciones !== "string") {
      errors.push("observaciones debe ser texto")
    } else if (data.observaciones.length > huevoValidationRules.observaciones!.maxLength) {
      errors.push(`observaciones no puede exceder ${huevoValidationRules.observaciones!.maxLength} caracteres`)
    }
  }

  // Validar registrado_por
  if (!data.registrado_por) {
    errors.push("registrado_por es requerido")
  } else if (typeof data.registrado_por !== "number") {
    errors.push("registrado_por debe ser un número")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export interface HuevoValidationRules {
  id_ave: {
    required: true
    type: "number"
    min: 1
  }
  tipo_huevo: {
    required: true
    type: "string"
    enum: string[]
  }
  fecha_recoleccion: {
    type: "string"
    pattern: RegExp
  }
  peso: {
    type: "number"
    min: 20
    max: 100
  }
  calidad: {
    type: "string"
    enum: string[]
  }
}

// Enums válidos
export const TIPOS_HUEVO = ["fértil", "infértil", "roto", "deforme", "doble_yema"]
export const CALIDADES_HUEVO = ["excelente", "buena", "regular", "mala"]

// Patrones de validación
export const FECHA_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// Función de validación para huevos
export const validateHuevoData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validar id_ave
  if (!data.id_ave) {
    errors.push("id_ave es requerido")
  } else if (typeof data.id_ave !== "number" || data.id_ave < 1) {
    errors.push("id_ave debe ser un número mayor a 0")
  }

  // Validar tipo_huevo
  if (!data.tipo_huevo) {
    errors.push("tipo_huevo es requerido")
  } else if (!TIPOS_HUEVO.includes(data.tipo_huevo)) {
    errors.push(`tipo_huevo debe ser uno de: ${TIPOS_HUEVO.join(", ")}`)
  }

  // Validar fecha_recoleccion (opcional)
  if (data.fecha_recoleccion) {
    if (typeof data.fecha_recoleccion !== "string") {
      errors.push("fecha_recoleccion debe ser texto")
    } else if (!FECHA_PATTERN.test(data.fecha_recoleccion)) {
      errors.push("fecha_recoleccion debe tener formato YYYY-MM-DD")
    } else {
      const fecha = new Date(data.fecha_recoleccion)
      const hoy = new Date()
      if (fecha > hoy) {
        errors.push("fecha_recoleccion no puede ser futura")
      }
    }
  }

  // Validar peso (opcional)
  if (data.peso !== undefined) {
    if (typeof data.peso !== "number") {
      errors.push("peso debe ser un número")
    } else if (data.peso < 20 || data.peso > 100) {
      errors.push("peso debe estar entre 20 y 100 gramos")
    }
  }

  // Validar calidad (opcional)
  if (data.calidad && !CALIDADES_HUEVO.includes(data.calidad)) {
    errors.push(`calidad debe ser uno de: ${CALIDADES_HUEVO.join(", ")}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

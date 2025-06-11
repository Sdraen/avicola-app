export interface IdJaulaRule {
  required: true
  type: "number"
  min: number
  exists: "jaula"
}

export interface ColorAnilloRule {
  required: true
  type: "string"
  minLength: number
  maxLength: number
  pattern: RegExp
  unique: true
}

export interface EdadRule {
  required: true
  type: "string"
  pattern: RegExp
  validate: "ageRange"
}

export interface EstadoPuestaRule {
  required: true
  type: "string"
  enum: Array<"activa" | "inactiva" | "en_desarrollo" | "retirada">
}

export interface RazaRule {
  required: true
  type: "string"
  minLength: number
  maxLength: number
  enum: Array<"leghorn white" | "leghorn brown">
}

export interface PesoRule {
  type: "number"
  min: number
  max: number
}

export interface AveValidationRules {
  id_jaula: IdJaulaRule
  color_anillo: ColorAnilloRule
  edad: EdadRule
  estado_puesta: EstadoPuestaRule
  raza: RazaRule
  peso?: PesoRule
}

export const aveValidationRules: AveValidationRules = {
  id_jaula: {
    required: true,
    type: "number",
    min: 1,
    exists: "jaula", // Verificar que la jaula existe
  },
  color_anillo: {
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 20,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, // Solo letras y espacios
    unique: true, // Color único por jaula
  },
  edad: {
    required: true,
    type: "string",
    pattern: /^\d+\s+(días?|semanas?|meses?|años?)$/, // "6 meses", "2 años"
    validate: "ageRange", // Función personalizada
  },
  estado_puesta: {
    required: true,
    type: "string",
    enum: ["activa", "inactiva", "en_desarrollo", "retirada"],
  },
  raza: {
    required: true,
    type: "string",
    minLength: 3,
    maxLength: 50,
    enum: ["leghorn white", "leghorn brown"],
  },
  peso: {
    type: "number",
    min: 0.5, // kg
    max: 5.0, // kg
  },
}

export const validateAveAge = (edad: string): boolean => {
  const agePattern = /^(\d+)\s+(días?|semanas?|meses?|años?)$/
  const match = edad.match(agePattern)

  if (!match) return false

  const [, number, unit] = match
  const num = Number.parseInt(number)

  switch (unit.toLowerCase()) {
    case "día":
    case "días":
      return num >= 1 && num <= 365
    case "semana":
    case "semanas":
      return num >= 1 && num <= 52
    case "mes":
    case "meses":
      return num >= 1 && num <= 60 // 5 años máximo
    case "año":
    case "años":
      return num >= 1 && num <= 5
    default:
      return false
  }
}

// Función de validación principal que usa las reglas
export const validateAveData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validar id_jaula
  if (!data.id_jaula) {
    errors.push("id_jaula es requerido")
  } else if (typeof data.id_jaula !== "number" || data.id_jaula < aveValidationRules.id_jaula.min) {
    errors.push("id_jaula debe ser un número mayor a 0")
  }

  // Validar color_anillo
  if (!data.color_anillo) {
    errors.push("color_anillo es requerido")
  } else if (typeof data.color_anillo !== "string") {
    errors.push("color_anillo debe ser texto")
  } else if (
    data.color_anillo.length < aveValidationRules.color_anillo.minLength ||
    data.color_anillo.length > aveValidationRules.color_anillo.maxLength
  ) {
    errors.push(
      `color_anillo debe tener entre ${aveValidationRules.color_anillo.minLength} y ${aveValidationRules.color_anillo.maxLength} caracteres`,
    )
  } else if (!aveValidationRules.color_anillo.pattern.test(data.color_anillo)) {
    errors.push("color_anillo contiene caracteres no válidos")
  }

  // Validar edad
  if (!data.edad) {
    errors.push("edad es requerida")
  } else if (typeof data.edad !== "string") {
    errors.push("edad debe ser texto")
  } else if (!aveValidationRules.edad.pattern.test(data.edad)) {
    errors.push("edad debe tener formato: número + unidad (ej: 5 semanas)")
  } else if (!validateAveAge(data.edad)) {
    errors.push("edad está fuera del rango válido")
  }

  // Validar estado_puesta
  if (!data.estado_puesta) {
    errors.push("estado_puesta es requerido")
  } else if (!aveValidationRules.estado_puesta.enum.includes(data.estado_puesta)) {
    errors.push(`estado_puesta debe ser uno de: ${aveValidationRules.estado_puesta.enum.join(", ")}`)
  }

  // Validar raza
  if (!data.raza) {
    errors.push("raza es requerida")
  } else if (!aveValidationRules.raza.enum.includes(data.raza)) {
    errors.push(`raza debe ser una de: ${aveValidationRules.raza.enum.join(", ")}`)
  }

  // Validar peso (opcional)
  if (data.peso !== undefined) {
    if (typeof data.peso !== "number") {
      errors.push("peso debe ser un número")
    } else if (data.peso < aveValidationRules.peso!.min || data.peso > aveValidationRules.peso!.max) {
      errors.push(`peso debe estar entre ${aveValidationRules.peso!.min} y ${aveValidationRules.peso!.max} kg`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

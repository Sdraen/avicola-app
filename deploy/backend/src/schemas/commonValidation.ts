// Common validation patterns and utilities
export const ValidationPatterns = {
  // Dates
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,

  // Numbers
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  NON_NEGATIVE_INTEGER: /^(0|[1-9]\d*)$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/,

  // Text
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s\-_]+$/,

  // Contact
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{8,15}$/,

  // Specific to poultry system
  COLOR_ANILLO: /^[A-Z]+-[A-Z0-9]+$/,
  CODIGO_BARRAS: /^\d{8,13}$/,
}

export const ValidationLimits = {
  // Text lengths
  NOMBRE_MIN: 2,
  NOMBRE_MAX: 100,
  DESCRIPCION_MAX: 500,
  OBSERVACIONES_MAX: 1000,

  // Numeric limits
  EDAD_MIN: 1,
  EDAD_MAX: 200, // weeks
  CANTIDAD_MIN: 0,
  CANTIDAD_MAX: 1000,
  PRECIO_MIN: 0,
  PRECIO_MAX: 999999.99,

  // Specific limits
  HUEVOS_POR_JAULA_MAX: 500,
  AVES_POR_JAULA_MAX: 20,
  CAPACIDAD_INCUBADORA_MAX: 1000,
}

export const ValidEnums = {
  ESTADO_PUESTA: ["activa", "inactiva", "descanso"] as const,
  TIPO_CLIENTE: ["mayorista", "minorista", "distribuidor"] as const,
  ROL_USUARIO: ["admin", "operador"] as const,
  ESTADO_INCUBACION: ["activo", "completado", "cancelado"] as const,
  ESTADO_INCUBADORA: ["disponible", "en_uso", "mantenimiento", "fuera_servicio"] as const,
  SEXO_AVE: ["macho", "hembra", "indeterminado"] as const,
  ESTADO_SALUD: ["saludable", "debil", "enfermo", "fallecido"] as const,
  TIPO_HIGIENE: ["limpieza_general", "desinfeccion", "fumigacion", "mantenimiento"] as const,
  TIPO_HUEVO: ["cafe", "blanco"] as const,
  TAMANO_HUEVO: ["chico", "mediano", "grande", "jumbo"] as const,
}

// Common validation functions
export const CommonValidations = {
  isValidDate: (date: string): boolean => {
    if (!ValidationPatterns.DATE_ISO.test(date)) return false
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime()) && parsedDate.toISOString().split("T")[0] === date
  },

  isValidDateTime: (datetime: string): boolean => {
    if (!ValidationPatterns.DATETIME_ISO.test(datetime)) return false
    const parsedDate = new Date(datetime)
    return !isNaN(parsedDate.getTime())
  },

  isValidEmail: (email: string): boolean => {
    return ValidationPatterns.EMAIL.test(email)
  },

  isValidPhone: (phone: string): boolean => {
    return ValidationPatterns.PHONE.test(phone)
  },

  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max
  },

  isValidLength: (text: string, min: number, max: number): boolean => {
    return text.length >= min && text.length <= max
  },

  isValidEnum: <T extends readonly string[]>(value: string, enumArray: T): value is T[number] => {
    return enumArray.includes(value as T[number])
  },

  sanitizeText: (text: string): string => {
    return text.trim().replace(/\s+/g, " ")
  },

  isPositiveNumber: (value: number): boolean => {
    return typeof value === "number" && value > 0 && !isNaN(value)
  },

  isNonNegativeNumber: (value: number): boolean => {
    return typeof value === "number" && value >= 0 && !isNaN(value)
  },
}

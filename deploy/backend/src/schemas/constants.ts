// Validation constants and patterns for the poultry system
export const VALIDATION_PATTERNS = {
  // Date patterns
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,

  // Text patterns
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s\-_]+$/,
  LETTERS_ONLY: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,

  // Numbers
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  NON_NEGATIVE_INTEGER: /^(0|[1-9]\d*)$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/,

  // Contact
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{8,15}$/,

  // Specific to poultry system
  COLOR_ANILLO: /^[A-Z]+-[A-Z0-9]+$/,
  CODIGO_BARRAS: /^\d{8,13}$/,
}

export const VALIDATION_LIMITS = {
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

export const VALID_ENUMS = {
  ESTADO_PUESTA: ["activa", "inactiva", "descanso"],
  TIPO_CLIENTE: ["mayorista", "minorista", "distribuidor"],
  ROL_USUARIO: ["admin", "operador"],
  ESTADO_INCUBACION: ["activo", "completado", "cancelado"],
  ESTADO_INCUBADORA: ["disponible", "en_uso", "mantenimiento", "fuera_servicio"],
  SEXO_AVE: ["macho", "hembra", "indeterminado"],
  ESTADO_SALUD: ["saludable", "debil", "enfermo", "fallecido"],
  TIPO_HIGIENE: ["limpieza_general", "desinfeccion", "fumigacion", "mantenimiento"],
  TIPO_HUEVO: ["cafe", "blanco"],
  TAMANO_HUEVO: ["chico", "mediano", "grande", "jumbo"],
}

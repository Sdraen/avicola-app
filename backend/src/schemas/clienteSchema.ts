export interface ClienteValidationRules {
  nombre: {
    required: true
    type: "string"
    minLength: 2
    maxLength: 100
    pattern: RegExp
  }
  direccion: {
    type: "string"
    minLength: 10
    maxLength: 200
  }
  telefono: {
    type: "string"
    pattern: RegExp
  }
  email: {
    type: "string"
    pattern: RegExp
  }
  tipo_cliente: {
    required: true
    type: "string"
    enum: string[]
  }
  limite_credito: {
    type: "number"
    min: 0
    max: 1000000
  }
}

// Patrones de validación
export const NOMBRE_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/
export const TELEFONO_PATTERN = /^(\+56)?\s?(\d{9})$/
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Enums válidos
export const TIPOS_CLIENTE = ["mayorista", "minorista", "distribuidor", "restaurante", "particular"]

// Función de validación para clientes
export const validateClienteData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validar nombre
  if (!data.nombre) {
    errors.push("nombre es requerido")
  } else if (typeof data.nombre !== "string") {
    errors.push("nombre debe ser texto")
  } else if (data.nombre.length < 2 || data.nombre.length > 100) {
    errors.push("nombre debe tener entre 2 y 100 caracteres")
  } else if (!NOMBRE_PATTERN.test(data.nombre)) {
    errors.push("nombre contiene caracteres no válidos")
  }

  // Validar direccion (opcional)
  if (data.direccion) {
    if (typeof data.direccion !== "string") {
      errors.push("direccion debe ser texto")
    } else if (data.direccion.length < 10 || data.direccion.length > 200) {
      errors.push("direccion debe tener entre 10 y 200 caracteres")
    }
  }

  // Validar telefono (opcional)
  if (data.telefono) {
    if (typeof data.telefono !== "string") {
      errors.push("telefono debe ser texto")
    } else if (!TELEFONO_PATTERN.test(data.telefono)) {
      errors.push("formato de teléfono no válido")
    }
  }

  // Validar email (opcional)
  if (data.email) {
    if (typeof data.email !== "string") {
      errors.push("email debe ser texto")
    } else if (!EMAIL_PATTERN.test(data.email)) {
      errors.push("formato de email no válido")
    }
  }

  // Validar tipo_cliente
  if (!data.tipo_cliente) {
    errors.push("tipo_cliente es requerido")
  } else if (!TIPOS_CLIENTE.includes(data.tipo_cliente)) {
    errors.push(`tipo_cliente debe ser uno de: ${TIPOS_CLIENTE.join(", ")}`)
  }

  // Validar limite_credito (opcional)
  if (data.limite_credito !== undefined) {
    if (typeof data.limite_credito !== "number") {
      errors.push("limite_credito debe ser un número")
    } else if (data.limite_credito < 0 || data.limite_credito > 1000000) {
      errors.push("limite_credito debe estar entre 0 y 1,000,000")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

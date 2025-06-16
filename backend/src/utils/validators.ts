export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== ""
}

export const validateNumber = (value: any): boolean => {
  return !isNaN(Number(value)) && isFinite(Number(value))
}

export const validateDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  return dateRegex.test(date) && !isNaN(Date.parse(date))
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10,15}$/
  return phoneRegex.test(phone.replace(/\D/g, ""))
}

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, "")
}

export const validateRole = (rol: string): boolean => {
  return ["admin", "operador"].includes(rol)
}

export const validateUserRegistration = (data: any) => {
  const errors: string[] = []

  if (!validateRequired(data.email)) errors.push("email es requerido")
  if (!validateRequired(data.password)) errors.push("password es requerido")
  if (!validateRequired(data.nombre)) errors.push("nombre es requerido")

  // Validaciones adicionales
  if (data.email && !validateEmail(data.email)) errors.push("formato de email inválido")
  if (data.password && data.password.length < 6) errors.push("password debe tener al menos 6 caracteres")
  if (data.rol && !validateRole(data.rol)) errors.push("rol debe ser 'admin' o 'operador'")

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateAve = (data: any) => {
  const errors: string[] = []

  if (!validateRequired(data.id_jaula)) errors.push("id_jaula es requerido")
  if (!validateRequired(data.color_anillo)) errors.push("color_anillo es requerido")
  if (!validateRequired(data.edad)) errors.push("edad es requerida")
  if (!validateRequired(data.estado_puesta)) errors.push("estado_puesta es requerido")
  if (!validateRequired(data.raza)) errors.push("raza es requerida")

  // Validaciones adicionales
  if (data.edad && !validateNumber(data.edad)) errors.push("edad debe ser un número")
  if (data.fecha_registro && !validateDate(data.fecha_registro))
    errors.push("fecha_registro debe tener formato YYYY-MM-DD")

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateCliente = (data: any) => {
  const errors: string[] = []

  if (!validateRequired(data.nombre)) errors.push("nombre es requerido")

  // Validaciones adicionales
  if (data.telefono) {
    if (!validatePhone(data.telefono.toString())) errors.push("formato de teléfono inválido")
  }

  if (data.tipo_cliente && !["mayorista", "minorista", "distribuidor", "otro"].includes(data.tipo_cliente)) {
    errors.push("tipo_cliente debe ser mayorista, minorista, distribuidor u otro")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateHuevo = (data: any) => {
  const errors: string[] = []

  if (!validateRequired(data.id_ave)) errors.push("id_ave es requerido")
  if (!validateRequired(data.tipo_huevo)) errors.push("tipo_huevo es requerido")

  // Validaciones adicionales
  if (data.fecha_recoleccion) {
    if (!validateDate(data.fecha_recoleccion)) errors.push("fecha_recoleccion debe tener formato YYYY-MM-DD")
  }

  if (data.tipo_huevo && !["fértil", "infértil", "roto", "otro"].includes(data.tipo_huevo)) {
    errors.push("tipo_huevo debe ser fértil, infértil, roto u otro")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

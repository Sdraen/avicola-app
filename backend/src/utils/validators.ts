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

export const validateAve = (data: any) => {
  const errors: string[] = []

  if (!validateRequired(data.id_jaula)) errors.push("id_jaula is required")
  if (!validateRequired(data.color_anillo)) errors.push("color_anillo is required")
  if (!validateRequired(data.edad)) errors.push("edad is required")
  if (!validateRequired(data.estado_puesta)) errors.push("estado_puesta is required")
  if (!validateRequired(data.raza)) errors.push("raza is required")

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateCliente = (data: any) => {
  const errors: string[] = []

  if (!validateRequired(data.nombre)) errors.push("nombre is required")
  if (data.telefono && !validatePhone(data.telefono.toString())) errors.push("telefono format is invalid")

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateHuevo = (data: any) => {
  const errors: string[] = []

  if (!validateRequired(data.id_ave)) errors.push("id_ave is required")
  if (!validateRequired(data.tipo_huevo)) errors.push("tipo_huevo is required")
  if (data.fecha_recoleccion && !validateDate(data.fecha_recoleccion)) {
    errors.push("fecha_recoleccion must be a valid date")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

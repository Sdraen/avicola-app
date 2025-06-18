export const validateAve = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data.id_jaula) {
    errors.push("id_jaula is required")
  }

  if (!data.color_anillo) {
    errors.push("color_anillo is required")
  }

  if (!data.edad || data.edad < 0) {
    errors.push("edad must be a positive number")
  }

  if (!data.estado_puesta) {
    errors.push("estado_puesta is required")
  }

  if (!data.raza) {
    errors.push("raza is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateCliente = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data.nombre || data.nombre.trim().length === 0) {
    errors.push("nombre is required")
  }

  if (data.telefono && !/^\d{8,15}$/.test(data.telefono)) {
    errors.push("telefono must be between 8 and 15 digits")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateHuevo = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data.id_jaula) {
    errors.push("id_jaula is required")
  }

  if (!data.fecha_recoleccion) {
    errors.push("fecha_recoleccion is required")
  }

  if (!data.cantidad_total || data.cantidad_total <= 0) {
    errors.push("cantidad_total must be greater than 0")
  }

  if (data.cantidad_total > 500) {
    errors.push("cantidad_total cannot exceed 500 eggs per cage per day")
  }

  // Validate egg classification totals
  const totalClasificado =
    (data.huevos_cafe_chico || 0) +
    (data.huevos_cafe_mediano || 0) +
    (data.huevos_cafe_grande || 0) +
    (data.huevos_cafe_jumbo || 0) +
    (data.huevos_blanco_chico || 0) +
    (data.huevos_blanco_mediano || 0) +
    (data.huevos_blanco_grande || 0) +
    (data.huevos_blanco_jumbo || 0)

  if (totalClasificado > data.cantidad_total) {
    errors.push(`Classified eggs (${totalClasificado}) cannot exceed total (${data.cantidad_total})`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

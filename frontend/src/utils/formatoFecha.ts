/**
 * Formato corto: dd-MM-yyyy
 * Ejemplo: 23-07-2025
 */

/**
 * Formato corto: dd-MM-yyyy (con Intl.DateTimeFormat)
 */
export const formatearFechaChilena = (fechaISO: string): string => {
  try {
    const date = new Date(fechaISO)
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC", // Opcional, pero ayuda a evitar desfases
    }).format(date)
  } catch (err) {
    console.error("Error formateando fecha:", fechaISO, err)
    return "Fecha inválida"
  }
}

/**
 * Formato largo: 23 de julio de 2025
 */
export const formatearFechaLarga = (fechaISO: string): string => {
  try {
    const date = new Date(fechaISO)
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC", // Opcional, pero ayuda a evitar desfases
    }).format(date)
  } catch (err) {
    console.error("Error formateando fecha:", fechaISO, err)
    return "Fecha inválida"
  }
}

/**
 * Formato corto con hora: dd-MM-yyyy HH:mm
 * Ejemplo: 23-07-2025 14:30
 */
export const formatearFechaHoraChilena = (fechaISO: string): string => {
  try {
    const date = new Date(fechaISO)
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC", // Opcional, pero ayuda a evitar desfases
    }).format(date)
  } catch (err) {
    console.error("Error formateando fecha:", fechaISO, err)
    return "Fecha inválida"
  }
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD sin problemas de zona horaria
 */
export const obtenerFechaLocalHoy = (): string => {
  const hoy = new Date()
  const año = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, "0")
  const dia = String(hoy.getDate()).padStart(2, "0")
  return `${año}-${mes}-${dia}`
}

/**
 * Convierte una fecha en formato YYYY-MM-DD a formato chileno dd-MM-yyyy
 */
export const convertirFechaInputAChilena = (fechaInput: string): string => {
  if (!fechaInput) return ""
  const [año, mes, dia] = fechaInput.split("-")
  return `${dia}-${mes}-${año}`
}

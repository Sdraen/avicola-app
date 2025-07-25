import { format } from '@formkit/tempo'
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
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC', // Opcional, pero ayuda a evitar desfases
    }).format(date)
  } catch (err) {
    console.error("Error formateando fecha:", fechaISO, err)
    return "Fecha inválida"
  }
}


export const formatearFechaHoraChilena = (fechaISO: string): string => {
  try {
    const date = new Date(fechaISO)
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC', // Opcional, pero ayuda a evitar desfases
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
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC', // Opcional, pero ayuda a evitar desfases
    }).format(date)
  } catch (err) {
    console.error("Error formateando fecha:", fechaISO, err)
    return "Fecha inválida"
  }
}

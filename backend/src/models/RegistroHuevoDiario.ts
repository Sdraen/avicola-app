// ✅ NUEVA: Tabla para registro diario de huevos
export interface RegistroHuevosDiario {
  id: number
  fecha_recoleccion: string
  cantidad_total: number

  // Huevos café por tamaño
  huevos_cafe_chico: number
  huevos_cafe_mediano: number
  huevos_cafe_grande: number
  huevos_cafe_jumbo: number

  // Huevos blancos por tamaño
  huevos_blanco_chico: number
  huevos_blanco_mediano: number
  huevos_blanco_grande: number
  huevos_blanco_jumbo: number

  observaciones?: string
  registrado_por: number // id del usuario
  fecha_registro: string
}

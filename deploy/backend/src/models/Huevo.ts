export interface Huevo {
  id_huevo: number
  id_jaula: number // ✅ Cambiado de id_ave a id_jaula
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
  registrado_por: number
  fecha_registro: string
}

export interface HuevoBandeja {
  codigo_barras: number
  id_huevo: number
}

export interface Bandeja {
  codigo_barras: number
  id_huevo: number
  cantidad_huevos: number
  tipo_bandeja: string
}

// ✅ Tipos para clasificación
export type TipoHuevo = "cafe" | "blanco"
export type TamanoHuevo = "chico" | "mediano" | "grande" | "jumbo"

// ✅ Interface para estadísticas por jaula
export interface EstadisticasHuevosPorJaula {
  id_jaula: number
  descripcion_jaula: string
  totalDia: number
  totalSemana: number
  totalMes: number
  promedioDiario: number
  distribucionTipo: {
    cafe: number
    blanco: number
  }
  distribucionTamano: {
    chico: number
    mediano: number
    grande: number
    jumbo: number
  }
}

// ✅ Interface para estadísticas generales
export interface EstadisticasHuevos {
  totalDia: number
  totalSemana: number
  totalMes: number
  promedioDiario: number
  jaulasProductivas: number
  mejorJaula: {
    id_jaula: number
    descripcion: string
    produccion: number
  }
  distribucionTipo: {
    cafe: number
    blanco: number
  }
  distribucionTamano: {
    chico: number
    mediano: number
    grande: number
    jumbo: number
  }
}

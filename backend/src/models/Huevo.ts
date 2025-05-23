export interface Huevo {
  id_huevo: number
  id_ave: number
  tipo_huevo: string
  fecha_recoleccion: string
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

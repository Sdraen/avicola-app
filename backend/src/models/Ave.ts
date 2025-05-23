export interface Ave {
  id_ave: number
  id_jaula: number
  color_anillo: string
  edad: string
  estado_puesta: string
  fecha_registro: string
  raza: string
}

export interface AveClinica {
  id_ave: number
  id_jaula: number
  fecha_inicio: string
  fecha_fin: string
  descripcion: string
}

export interface AvesFallecidas {
  id_ave: number
  fecha: string
  motivo: string
}

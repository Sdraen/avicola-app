export interface Incubacion {
  id_incubacion: number
  id_incubadora: number
  id_huevo: number
  fecha_inicio: string
  fecha_fin: string
  estado: string
}

export interface Incubadora {
  id_incubadora: number
  nombre: string
  capacidad: number
  estado: string
}

export interface Nacimiento {
  id_nacimiento: number
  id_incubacion: number
  fecha_nacimiento: string
  sexo: string
  observaciones: string
}

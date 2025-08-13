export interface Incubacion {
  id_incubacion: number
  id_incubadora: number
  lote?: string | null
  temperatura?: number | null
  cantidad_huevos?: number | null
  fecha_inicio: string
  fecha_estimada_eclo: string
  observaciones?: string | null
  estado: "activo" | "completado" | "cancelado"
}

export interface Incubadora {
  id_incubadora: number
  nombre: string
  capacidad: number
  estado: string // o enum si tienes valores controlados
}

export interface Nacimiento {
  id_nacimiento: number
  id_incubacion: number
  fecha_nacimiento: string
  sexo?: string | null
  observaciones?: string | null
}

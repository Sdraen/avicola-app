export interface Jaula {
  id_jaula: number
  id_estanque: number
  codigo_jaula: string
  descripcion: string
}

export interface JaulasVacuna {
  id_jauvacu: number
  id_jaula: number
  id_vacuna: number
}

export interface ServicioHigiene {
  id_higiene: number
  id_jaula: number
  tipo: string
  fecha: string
}

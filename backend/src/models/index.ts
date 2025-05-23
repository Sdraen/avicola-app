// Database types based on your Supabase schema
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

export interface Bandeja {
  codigo_barras: number
  id_huevo: number
  cantidad_huevos: number
  tipo_bandeja: string
}

export interface Cliente {
  id_cliente: number
  nombre: string
  direccion: string
  telefono: number
  tipo_cliente: string
}

export interface Compras {
  id_compras: number
  fecha: string
  costo_total: string
}

export interface Estanque {
  id_estanque: number
}

export interface EstanqueMedicamento {
  id_esmed: number
  id_medicamento: number
  id_estanque: number
  fecha_administracion: string
}

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

export interface Implementos {
  id_implementos: number
  id_compras: number
  nombre: string
  cantidad: string
  costo_unitario: string
}

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

export interface Jaula {
  id_jaula: number
  id_estanque: number
  descripcion: string
}

export interface JaulasVacuna {
  id_jauvacu: number
  id_jaula: number
  id_vacuna: number
}

export interface Medicamento {
  id_medicamento: number
  nombre: string
  dosis: string
}

export interface Nacimiento {
  id_nacimiento: number
  id_incubacion: number
  fecha_nacimiento: string
  sexo: string
  observaciones: string
}

export interface ServicioHigiene {
  id_higiene: number
  id_jaula: number
  tipo: string
  fecha: string
}

export interface Usuario {
  id_user: number
  rol: string
  nombre: string
  correo: string
}

export interface Vacuna {
  id_vacuna: number
  nombre: string
  dosis: string
  fecha_adminstracion: string
}

export interface Venta {
  id_venta: number
  id_cliente: number
  codigo_barras: number
  fecha_venta: string
  costo_total: number
  cantidad_total: number
}

// Export all models from a single file for convenience
export * from "./Ave"
export * from "./Huevo"
export * from "./Jaula"
export * from "./Estanque"
export * from "./Incubacion"
export * from "./Cliente"
export * from "./Venta"
export * from "./Compra"
export * from "./Implemento"
export * from "./Medicamento"
export * from "./Vacuna"
export * from "./Usuario"

// Additional types that might be used across the application
export interface PaginationParams {
  page: number
  limit: number
}

export interface DateRangeParams {
  startDate: string
  endDate: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface StatsResponse {
  [key: string]: number | string | Array<any> | object
}

// backend/src/models/Bandeja.ts

// Valores permitidos
export type TipoHuevo = "cafe" | "blanco"
export type TamanoHuevo = "chico" | "mediano" | "grande" | "jumbo"
export type EstadoBandeja = "disponible" | "vendida"

// Fecha tipo DATE en Postgres -> string "YYYY-MM-DD"
export type ISODate = string

export interface Bandeja {
  id_bandeja: number
  tipo_huevo: TipoHuevo
  tamaño_huevo: TamanoHuevo
  cantidad_huevos: number
  estado: EstadoBandeja
  fecha_creacion: ISODate        // viene como "YYYY-MM-DD"
  id_venta: number | null        // puede ser null
}

export interface BandejaInsert {
  tipo_huevo: TipoHuevo
  tamaño_huevo: TamanoHuevo
  cantidad_huevos: number
  estado?: EstadoBandeja         // por defecto "disponible"
  fecha_creacion?: ISODate       // si no la envías, la BD usa current_date
  id_venta?: number | null
}

export interface BandejaUpdate {
  tipo_huevo?: TipoHuevo
  tamaño_huevo?: TamanoHuevo
  cantidad_huevos?: number
  estado?: EstadoBandeja
  fecha_creacion?: ISODate
  id_venta?: number | null
}

/**
 * Relación huevos <-> bandeja
 * Relevante para descontar y RESTITUIR stock al eliminar la bandeja.
 * Asegúrate de tener la columna cantidad_usada en public.huevo_bandeja
 * (integer not null default 0).
 */
export interface HuevoBandeja {
  id_bandeja: number
  id_huevo: number
  cantidad_usada: number // cuántos huevos de ese registro se usaron en la bandeja
}

export interface HuevoBandejaInsert {
  id_bandeja: number
  id_huevo: number
  cantidad_usada: number
}

export interface HuevoBandejaUpdate {
  cantidad_usada?: number
}

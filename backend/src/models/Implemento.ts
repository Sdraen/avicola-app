export interface Implementos {
  id_implemento: number
  id_compra: number
  nombre: string
  categoria?: string
  descripcion?: string
  cantidad: number
  precio_unitario: number
  estado?: string
  fecha_compra?: string  // formato ISO: yyyy-mm-dd
  proveedor?: string
  ubicacion?: string
  compra?: {
    id_compra: number
    fecha: string
    costo_total: number
  }
}

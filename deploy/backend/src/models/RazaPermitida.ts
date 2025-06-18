// ✅ NUEVA: Tabla para razas configurables por el administrador
export interface RazaPermitida {
  id_raza: number
  nombre: string
  descripcion?: string
  activa: boolean
  fecha_creacion: string
  creado_por: number // id del usuario admin
}

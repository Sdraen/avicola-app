export interface Ave {
  id_ave: number
  id_jaula: number
  id_anillo: string
  color_anillo: string
  edad: string
  estado_puesta: string
  fecha_registro: string
  raza: string
  jaula?: Jaula
}

export interface Jaula {
  id_jaula: number
  id_estanque: number
  codigo_jaula: string
  descripcion: string
  estanque?: Estanque
  aves?: Ave[]
}

export interface Estanque {
  id_estanque: number
}

export interface Huevo {
  id_huevo: number
  id_jaula: number
  fecha_recoleccion: string
  cantidad_total: number
  huevos_cafe_chico: number
  huevos_cafe_mediano: number
  huevos_cafe_grande: number
  huevos_cafe_jumbo: number
  huevos_blanco_chico: number
  huevos_blanco_mediano: number
  huevos_blanco_grande: number
  huevos_blanco_jumbo: number
  observaciones?: string
  registrado_por: number
  fecha_registro: string
  jaula?: Jaula
}

export interface Cliente {
  id_cliente: number
  nombre: string
  direccion: string
  telefono: number
  tipo_cliente: string
}

export interface Bandeja {
  id_bandeja: number
  tipo_huevo: string
  tamaño_huevo: string
  cantidad_huevos: number
  fecha_creacion: string
  estado: "disponible" | "vendida" | "reservada"
  id_venta?: number
  huevo_bandeja?: HuevoBandeja[]
}


export interface Venta {
  id_venta: number
  id_cliente: number
  fecha_venta: string
  costo_total: number
  cantidad_total: number
  cliente?: Cliente
  bandeja?: Bandeja[]
}

export interface Compra {
  id_compras: number
  fecha: string
  costo_total: string
  implementos?: Implemento[]
}

export interface Implemento {
  id_implementos: number
  id_compras: number
  nombre: string
  cantidad: string
  costo_unitario: string
  compra?: Compra
}

export interface Medicamento {
  id_medicamento: number
  nombre: string
  dosis: string
}

export interface Vacuna {
  id_vacuna: number
  nombre: string
  dosis: string
  fecha_adminstracion: string
}

export interface Incubacion {
  id_incubacion: number
  id_incubadora: number
  id_huevo: number
  fecha_inicio: string
  fecha_fin: string
  estado: string
  incubadora?: Incubadora
  huevo?: Huevo
}

export interface Incubadora {
  id_incubadora: number
  nombre: string
  capacidad: number
  estado: string
}

export interface Raza {
  id_raza: number
  nombre: string
  descripcion?: string
  activa: boolean
  fecha_creacion: string
  creado_por: number
}

export interface RegistroHuevosDiario {
  id: number
  fecha_recoleccion: string
  cantidad_total: number
  huevos_cafe_chico: number
  huevos_cafe_mediano: number
  huevos_cafe_grande: number
  huevos_cafe_jumbo: number
  huevos_blanco_chico: number
  huevos_blanco_mediano: number
  huevos_blanco_grande: number
  huevos_blanco_jumbo: number
  observaciones?: string
  registrado_por: number
  fecha_registro: string
}

export interface HuevoBandeja {
  id_bandeja: number
  id_huevo: number
}

export interface User {
  id: number
  email: string
  rol: "admin" | "operador"
}

export interface AveFormData {
  id_jaula: number
  color_anillo: string
  edad: string
  estado_puesta: string
  raza: string
}

export interface DashboardStats {
  totalBirds: number
  deceasedThisMonth: number
  layingStats: any[]
  breedStats: any[]
  totalEggs: number
  totalSales: number
  totalRevenue: number
}

// Interfaces para huevos disponibles en bandejas
export interface HuevoDisponible {
  id_huevo: number
  id_jaula: number
  fecha_recoleccion: string
  cantidad_disponible: number
  jaula?: {
    descripcion: string
  }
  tipo: string
  tamaño: string
}
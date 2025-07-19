export interface Usuario {
  id_usuario: number
  nombre: string
  email: string
  rol: "admin" | "empleado"
  activo: boolean
  fecha_creacion: string
}

export interface Raza {
  id_raza: number
  nombre: string
  descripcion?: string
  origen?: string
  caracteristicas?: string
  peso_promedio?: number
  produccion_huevos_anual?: number
  activa: boolean
  fecha_creacion: string
  creado_por?: number
}

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

export interface HuevoBandeja {
  id_bandeja: number
  id_huevo: number
}

export interface Cliente {
  id_cliente: number
  nombre: string
  apellido?: string
  email?: string
  telefono?: string
  direccion?: string
  tipo_cliente: "mayorista" | "minorista" | "distribuidor"
  activo: boolean
  fecha_registro: string
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

// Compras - ACTUALIZADO para usar id_compra
export interface Compra {
  id_compra: number
  fecha: string
  costo_total: number
  proveedor?: string
  implementos?: Implemento[]
}

// Implementos - ACTUALIZADO para usar id_compra
export interface Implemento {
  id_implemento: number
  id_compra?: number
  nombre: string
  cantidad: number
  precio_unitario: number
  categoria?: string
  descripcion?: string
  estado?: string
  ubicacion?: string
  fecha_registro: string
  compra?: Compra
}

// Interfaces para el sistema clínico
export interface AveClinica {
  id_ave: number
  id_jaula: number
  fecha_inicio: string
  fecha_fin?: string
  descripcion: string
  ave?: {
    id_ave: number
    id_anillo: string
    raza: string
  }
  jaula?: {
    id_jaula: number
    descripcion: string
    codigo_jaula: string
  }
}

export interface AveFallecida {
  id_ave: number
  fecha: string
  motivo: string
  ave?: {
    id_ave: number
    id_anillo: string
    raza: string
    color_anillo: string
  }
}

export interface HistorialClinico {
  historial_clinico: AveClinica[]
  ave_fallecida: AveFallecida | null
  esta_fallecida: boolean
}


export interface Medicamento {
  id_medicamento: number
  nombre: string
  tipo_medicamento: "antibiotico" | "vitamina" | "vacuna" | "desparasitante" | "otros"
  descripcion?: string
  dosis_recomendada?: string
  fecha_vencimiento?: string
  stock_actual: number
  precio_unitario?: number
  proveedor?: string
  observaciones?: string
  activo: boolean
  fecha_registro: string
  dosis?: string
}

export interface Vacuna {
  id_vacuna: number
  nombre: string
  tipo_vacuna: "viral" | "bacteriana" | "parasitaria" | "otros"
  descripcion?: string
  edad_aplicacion?: string
  dosis?: string
  fecha_vencimiento?: string
  stock_actual: number
  precio_unitario?: number
  proveedor?: string
  observaciones?: string
  activa: boolean
  fecha_registro: string
  fecha_adminstracion?: string
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

export interface VentaFormData {
  id_cliente: number
  fecha_venta: string
  costo_total: number
  cantidad_total: number
  bandeja_ids: number[]
}

export interface VentaCreatePayload {
  id_cliente: number
  costo_total: number
  cantidad_total: number
  bandeja_ids: number[]
}

// Tipos para formularios
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  nombre: string
  email: string
  password: string
  confirmPassword: string
  rol?: "admin" | "empleado"
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}

// Tipos para estadísticas
export interface EstadisticasGenerales {
  totalAves: number
  totalHuevos: number
  totalVentas: number
  totalClientes: number
  ventasDelMes: number
  huevosDelMes: number
}

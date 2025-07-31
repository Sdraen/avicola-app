import axios from "axios"
import { processApiError } from "../utils/errorHandler"

const API_BASE_URL = "http://localhost:5000/api"

// Configuración base de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos de timeout
})

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(processApiError(error))
  },
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si es error 401 y no hemos intentado refrescar ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      console.log("🔄 Error 401 detectado, limpiando sesión")

      // Limpiar sesión inmediatamente
      localStorage.removeItem("token")
      localStorage.removeItem("user")

      // Redirigir al login solo si no estamos ya ahí
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }

      return Promise.reject(processApiError(error))
    }

    // Si es error de red o timeout
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      console.log("🌐 Error de conexión detectado")
      return Promise.reject({
        ...processApiError(error),
        isNetworkError: true,
        message: "Error de conexión. Verifica tu internet y que el servidor esté funcionando.",
      })
    }

    return Promise.reject(processApiError(error))
  },
)

// Servicios de autenticación
export const authAPI = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (email: string, password: string, rol: "admin" | "operador", nombre: string) =>
    api.post("/auth/register", { email, password, rol, nombre }),
  verifyToken: () => api.get("/auth/me"),
  checkRoleAvailability: () => api.get("/auth/roles/availability"),
  checkEmailAvailability: (email: string) => api.get(`/auth/email/check/${email}`),
}

// Servicios de aves
export const avesAPI = {
  getAll: () => api.get("/aves"),
  getById: (id: number) => api.get(`/aves/${id}`),
  create: (data: {
    id_jaula: number
    id_anillo: string
    color_anillo: string
    edad: string
    estado_puesta: string
    raza: string
  }) => api.post("/aves", data),
  update: (id: number, data: any) => api.put(`/aves/${id}`, data),
  delete: (id: number) => api.delete(`/aves/${id}`),
  getByJaula: (id_jaula: number) => api.get(`/aves/jaula/${id_jaula}`),
  getStats: () => api.get("/aves/stats/overview"),
  reactivar: (id: number) => api.patch(`/aves/${id}/reactivar`),
}

// Servicios de huevos
export const huevosAPI = {
  getAll: () => api.get("/huevos"),
  getById: (id: number) => api.get(`/huevos/${id}`),
  create: (data: any) => api.post("/huevos", data),
  createBulk: (records: any[]) => api.post("/huevos/bulk", { records }),
  update: (id: number, data: any) => api.put(`/huevos/${id}`, data),
  delete: (id: number) => api.delete(`/huevos/${id}`),
  getByDateRange: (start: string, end: string) => api.get(`/huevos/fecha/${start}/${end}`),
  getByJaula: (id_jaula: number) => api.get(`/huevos/jaula/${id_jaula}`),
  getStats: () => api.get("/huevos/stats/overview"),
}

// Servicios de bandejas
export const bandejasAPI = {
  getAll: () => api.get("/bandeja"),
  getById: (id: number) => api.get(`/bandeja/${id}`),
  create: (data: { tipo: string; tamaño: string; id_huevos: number[] }) => api.post("/bandeja", data),
  update: (id: number, data: { tipo_huevo?: string; tamaño_huevo?: string; estado?: string }) =>
    api.put(`/bandeja/${id}`, data),
  delete: (id: number) => api.delete(`/bandeja/${id}`),
  asignarHuevos: (id: number, id_huevos: number[]) => api.post(`/bandeja/${id}/asignar`, { id_huevos }),
  eliminarHuevos: (id: number, id_huevos: number[]) => api.post(`/bandeja/${id}/eliminar-huevos`, { id_huevos }),
  getHuevosDisponibles: (tipo: string, tamaño: string) => api.get(`/bandeja/huevos-disponibles/${tipo}/${tamaño}`),
}

// Servicios de jaulas
export const jaulasAPI = {
  getAll: () => api.get("/jaulas"),
  getById: (id: number) => api.get(`/jaulas/${id}`),
  create: (data: any) => api.post("/jaulas", data),
  update: (id: number, data: any) => api.put(`/jaulas/${id}`, data),
  delete: (id: number) => api.delete(`/jaulas/${id}`),
  getByEstanque: (id_estanque: number) => api.get(`/jaulas/estanque/${id_estanque}`),
  getStats: () => api.get("/jaulas/stats/overview"),
  addHygieneService: (id: number, data: any) => api.post(`/jaulas/${id}/hygiene`, data),
}

// Servicios de clientes
export const clientesAPI = {
  getAll: () => api.get("/clientes"),
  getById: (id: number) => api.get(`/clientes/${id}`),
  create: (data: any) => api.post("/clientes", data),
  update: (id: number, data: any) => api.put(`/clientes/${id}`, data),
  delete: (id: number) => api.delete(`/clientes/${id}`),
  getVentas: (id: number) => api.get(`/clientes/${id}/ventas`),
  search: (query: string) => api.get(`/clientes/search/${query}`),
  getStats: () => api.get("/clientes/stats/overview"),
}

// Servicios de ventas
export const ventasAPI = {
  getAll: () => api.get("/ventas"),
  getById: (id: number) => api.get(`/ventas/${id}`),
  create: (data: {
    id_cliente: number
    fecha_venta: string
    costo_total: number
    cantidad_total: number
    bandejas: { id_huevo: number }[]
  }) => api.post("/ventas", data),
  update: (id: number, data: any) => api.put(`/ventas/${id}`, data),
  delete: (id: number) => api.delete(`/ventas/${id}`),
  getByDateRange: (start: string, end: string) => api.get(`/ventas/fecha/${start}/${end}`),
  getStats: () => api.get("/ventas/stats/overview"),
}

// Servicios de compras - CORREGIDO para usar id_compra
export const comprasAPI = {
  getAll: () => api.get("/compras"),
  getById: (id: number) => api.get(`/compras/${id}`),
  create: (data: any) => api.post("/compras", data),
  update: (id: number, data: any) => api.put(`/compras/${id}`, data),
  delete: (id: number) => api.delete(`/compras/${id}`),
  getByDateRange: (start: string, end: string) => api.get(`/compras/fecha/${start}/${end}`),
  getStats: () => api.get("/compras/stats/overview"),
}

// Servicios de implementos - CORREGIDO para usar id_compra
export const implementosAPI = {
  getAll: () => api.get("/implementos"),
  getById: (id: number) => api.get(`/implementos/${id}`),
  create: (data: any) => api.post("/implementos", data),
  update: (id: number, data: any) => api.put(`/implementos/${id}`, data),
  delete: (id: number) => api.delete(`/implementos/${id}`),
  getByCompra: (id_compra: number) => api.get(`/implementos/compra/${id_compra}`),
  search: (query: string) => api.get(`/implementos/search/${query}`),
  getStats: () => api.get("/implementos/stats/overview"),
}

// Servicios de historial clínico
export const aveClinicaAPI = {
  getHistorial: (id_ave: number) => api.get(`/ave-clinica/historial/${id_ave}`),
  create: (data: {
    id_ave: number
    id_jaula: number
    fecha_inicio: string
    fecha_fin?: string
    descripcion: string
  }) => api.post("/ave-clinica", data),
  update: (
    id: number,
    data: {
      fecha_inicio?: string
      fecha_fin?: string
      descripcion?: string
    },
  ) => api.put(`/ave-clinica/${id}`, data),
  delete: (id: number) => api.delete(`/ave-clinica/${id}`),
  registrarFallecimiento: (data: {
    id_ave: number
    fecha: string
    motivo: string
  }) => api.post("/ave-clinica/fallecimiento", data),
  getAvesFallecidas: () => api.get("/ave-clinica/fallecidas"),
  eliminarFallecimiento: (id_ave: number) => api.delete(`/ave-clinica/fallecimiento/${id_ave}`),
}


// Servicios de medicamentos
export const medicamentosAPI = {
  getAll: () => api.get("/medicamentos"),
  getById: (id: number) => api.get(`/medicamentos/${id}`),
  create: (data: any) => api.post("/medicamentos", data),
  update: (id: number, data: any) => api.put(`/medicamentos/${id}`, data),
  delete: (id: number) => api.delete(`/medicamentos/${id}`),
  aplicar: (data: any) => api.post("/medicamentos/aplicar", data),
  getAplicaciones: (id_medicamento: number) => api.get(`/medicamentos/aplicaciones/${id_medicamento}`),
  search: (query: string) => api.get(`/medicamentos/search/${query}`),
}

// Servicios de vacunas
export const vacunasAPI = {
  getAll: () => api.get("/vacunas"),
  getById: (id: number) => api.get(`/vacunas/${id}`),
  create: (data: any) => api.post("/vacunas", data),
  update: (id: number, data: any) => api.put(`/vacunas/${id}`, data),
  delete: (id: number) => api.delete(`/vacunas/${id}`),
  aplicar: (data: any) => api.post("/vacunas/aplicar", data),
  getAplicaciones: (id_vacuna: number) => api.get(`/vacunas/aplicaciones/${id_vacuna}`),
  search: (query: string) => api.get(`/vacunas/search/${query}`),
}

// Servicios de incubación
export const incubacionAPI = {
  getAll: () => api.get("/incubacion"),
  getById: (id: number) => api.get(`/incubacion/${id}`),
  create: (data: any) => api.post("/incubacion", data),
  update: (id: number, data: any) => api.put(`/incubacion/${id}`, data),
  delete: (id: number) => api.delete(`/incubacion/${id}`),
  getActive: () => api.get("/incubacion/estado/activo"),
  getByIncubadora: (id_incubadora: number) => api.get(`/incubacion/incubadora/${id_incubadora}`),
  getStats: () => api.get("/incubacion/stats/overview"),
}

// Servicios de razas
export const razasAPI = {
  getAll: () => api.get("/razas"),
  create: (data: any) => api.post("/razas", data),
  update: (id: number, data: any) => api.put(`/razas/${id}`, data),
  delete: (id: number) => api.delete(`/razas/${id}`),
}

// Servicios de registro de huevos diario
export const registroHuevosAPI = {
  getAll: () => api.get("/registro-huevos"),
  create: (data: any) => api.post("/registro-huevos", data),
  getByDateRange: (start: string, end: string) => api.get(`/registro-huevos/fecha/${start}/${end}`),
  getStats: () => api.get("/registro-huevos/stats"),
}

// Nueva API para reportes
export const reportesAPI = {
  getVentasMensuales: (params?: any) => api.get("/reportes/ventas-mensuales", { params }),
  getProduccionHuevos: (params?: any) => api.get("/reportes/produccion-huevos", { params }),
  getProduccionPorJaula: (params?: any) => api.get("/reportes/produccion-por-jaula", { params }),
  getEstadisticasAves: (params?: any) => api.get("/reportes/estadisticas-aves", { params }),
  getUsoInsumos: (params?: any) => api.get("/reportes/uso-insumos", { params }),
  getVentasPorCliente: (params?: any) => api.get("/reportes/ventas-por-cliente", { params }),
  getEvolucionAves: (params?: any) => api.get("/reportes/evolucion-aves", { params }),
}

export default api

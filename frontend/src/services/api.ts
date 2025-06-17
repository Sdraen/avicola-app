import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

// Configuración base de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Servicios de autenticación
export const authAPI = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (email: string, password: string, rol: "admin" | "operador", nombre: string) =>
    api.post("/auth/register", { email, password, rol, nombre }),
  verifyToken: () => api.get("/auth/verify"),
  checkRoleAvailability: () => api.get("/auth/roles/availability"),
  checkEmailAvailability: (email: string) => api.get(`/auth/email/check/${email}`),
}

// Servicios de aves
export const avesAPI = {
  getAll: () => api.get("/aves"),
  getById: (id: number) => api.get(`/aves/${id}`),
  create: (data: {
    id_jaula: number
    color_anillo: string
    edad: string
    estado_puesta: string
    raza: string
  }) => api.post("/aves", data),
  update: (id: number, data: any) => api.put(`/aves/${id}`, data),
  delete: (id: number) => api.delete(`/aves/${id}`),
  getByJaula: (id_jaula: number) => api.get(`/aves/jaula/${id_jaula}`),
  getStats: () => api.get("/aves/stats/overview"),
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
  create: (data: any) => api.post("/ventas", data),
  update: (id: number, data: any) => api.put(`/ventas/${id}`, data),
  delete: (id: number) => api.delete(`/ventas/${id}`),
  getByDateRange: (start: string, end: string) => api.get(`/ventas/fecha/${start}/${end}`),
  getStats: () => api.get("/ventas/stats/overview"),
}

// Servicios de compras
export const comprasAPI = {
  getAll: () => api.get("/compras"),
  getById: (id: number) => api.get(`/compras/${id}`),
  create: (data: any) => api.post("/compras", data),
  update: (id: number, data: any) => api.put(`/compras/${id}`, data),
  delete: (id: number) => api.delete(`/compras/${id}`),
  getByDateRange: (start: string, end: string) => api.get(`/compras/fecha/${start}/${end}`),
  getStats: () => api.get("/compras/stats/overview"),
}

// Servicios de implementos
export const implementosAPI = {
  getAll: () => api.get("/implementos"),
  getById: (id: number) => api.get(`/implementos/${id}`),
  create: (data: any) => api.post("/implementos", data),
  update: (id: number, data: any) => api.put(`/implementos/${id}`, data),
  delete: (id: number) => api.delete(`/implementos/${id}`),
  getByCompra: (id_compras: number) => api.get(`/implementos/compra/${id_compras}`),
  search: (query: string) => api.get(`/implementos/search/${query}`),
  getStats: () => api.get("/implementos/stats/overview"),
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

export default api

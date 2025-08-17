// src/pages/RegistrarAve.tsx
"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { avesAPI, jaulasAPI } from "../services/api"
import { useFormErrors, processApiError, ApiError } from "../utils/errorHandler"
import type { Jaula } from "../types"

type JaulaConAves = Jaula & {
  aves?: Array<any>
  aves_count?: number
  total_aves?: number
  totalAves?: number
  cantidad_aves?: number
  num_aves?: number
  count_aves?: number
}

const RegistrarAve: React.FC = () => {
  const navigate = useNavigate()
  const { fieldErrors, generalError, setApiError, clearErrors, clearFieldError } = useFormErrors()

  const [form, setForm] = useState({
    id_jaula: "",
    id_anillo: "",
    color_anillo: "",
    fecha_nacimiento: "",
    estado_puesta: "",
    raza: "",
  })

  const [jaulas, setJaulas] = useState<JaulaConAves[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingJaulas, setLoadingJaulas] = useState(true)
  const [success, setSuccess] = useState("")
  const [usarColorPersonalizado, setUsarColorPersonalizado] = useState(false)

  const coloresPredefinidos = ["Rojo", "Azul", "Verde", "Amarillo", "Negro", "Blanco"]

  useEffect(() => {
    fetchJaulas()
  }, [])

  // Obtiene el número de aves de una jaula
  const getAvesCount = (j: Partial<JaulaConAves>): number => {
    const direct =
      j.total_aves ??
      j.aves_count ??
      j.totalAves ??
      j.cantidad_aves ??
      j.num_aves ??
      j.count_aves
    if (typeof direct === "number") return direct
    return Array.isArray(j.aves) ? j.aves.length : 0
  }

  const fetchJaulas = async () => {
    try {
      setLoadingJaulas(true)
      const response = await jaulasAPI.getAll()
      const raw = Array.isArray(response.data) ? (response.data as JaulaConAves[]) : (response.data?.data || [])

      // 👇 Ordenar de menor a mayor cantidad de aves
      const sorted = [...raw].sort((a, b) => {
        const ca = getAvesCount(a)
        const cb = getAvesCount(b)
        if (ca !== cb) return ca - cb
        const codeA = (a as any)?.codigo_jaula?.toString?.() ?? ""
        const codeB = (b as any)?.codigo_jaula?.toString?.() ?? ""
        return codeA.localeCompare(codeB)
      })

      setJaulas(sorted)
    } catch (error) {
      console.error("Error cargando jaulas:", error)
      setApiError(
        new ApiError("Error", 500, [{ field: "general", message: "No se pudieron cargar las jaulas disponibles" }]),
      )
    } finally {
      setLoadingJaulas(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (fieldErrors[name]) clearFieldError(name)
    if (success) setSuccess("")
    if (generalError) clearErrors()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setSuccess("")
    setLoading(true)

    try {
      const aveData = {
        id_jaula: Number.parseInt(form.id_jaula),
        id_anillo: form.id_anillo.trim(),
        color_anillo: form.color_anillo.trim(),
        fecha_nacimiento: form.fecha_nacimiento,
        estado_puesta: form.estado_puesta,
        raza: form.raza.trim(),
      }

      if (!aveData.id_jaula || isNaN(aveData.id_jaula)) {
        setApiError(
          new ApiError("Validation failed", 400, [{ field: "id_jaula", message: "Debe seleccionar una jaula válida" }]),
        )
        return
      }

      await avesAPI.create(aveData)
      setSuccess("Ave registrada exitosamente")
      setForm({ id_jaula: "", id_anillo: "", color_anillo: "", fecha_nacimiento: "", estado_puesta: "", raza: "" })
      setTimeout(() => {
        navigate("/ver-aves")
      }, 2000)
    } catch (err: any) {
      const apiError = err instanceof ApiError ? err : processApiError(err)
      setApiError(apiError)
    } finally {
      setLoading(false)
    }
  }

  const formatJaulaOption = (jaula: JaulaConAves) => {
    let label = `🏠 Jaula ${jaula.codigo_jaula ?? jaula.id_jaula}`
    if ((jaula as any).descripcion) label += ` - ${(jaula as any).descripcion}`
    const n = getAvesCount(jaula)
    const cap = Number((jaula as any)?.capacidad ?? 0)
    if (cap > 0) label += ` (${n}/${cap} aves)`
    else label += ` (${n} aves)`
    return label
  }

  const getMaxDate = () => new Date().toISOString().split("T")[0]
  const getMinDate = () => {
    const hace10Anos = new Date()
    hace10Anos.setFullYear(hace10Anos.getFullYear() - 10)
    return hace10Anos.toISOString().split("T")[0]
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🐓</div>
        <h2 className="form-title">Registrar Nueva Ave</h2>
        <p className="form-subtitle">Complete los datos para registrar un ave en el sistema</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {/* mensajes de error y éxito */}
        {generalError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{generalError}</div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
        )}

        {/* Select de jaulas */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🏠</span>Jaula:
          </label>
          {loadingJaulas ? (
            <div className="form-input flex items-center justify-center py-3">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-gray-600">Cargando jaulas...</span>
              </div>
            </div>
          ) : (
            <select
              name="id_jaula"
              value={form.id_jaula}
              onChange={handleChange}
              className={`form-input ${fieldErrors.id_jaula ? "border-red-500 bg-red-50" : ""}`}
              required
            >
              <option value="">Seleccionar jaula</option>
              {jaulas.map((jaula) => (
                <option key={(jaula as any).id_jaula} value={(jaula as any).id_jaula}>
                  {formatJaulaOption(jaula)}
                </option>
              ))}
            </select>
          )}
          {fieldErrors.id_jaula && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {fieldErrors.id_jaula}
            </div>
          )}
        </div>
        {/* ID Anillo */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🏷️</span>ID Anillo:
          </label>
          <input
            type="number"
            name="id_anillo"
            value={form.id_anillo}
            onChange={handleChange}
            className={`form-input ${fieldErrors.id_anillo ? "border-red-500 bg-red-50" : ""}`}
            placeholder="Ej: 111, 112, 123"
            maxLength={10}
            required
          />
          {fieldErrors.id_anillo && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {fieldErrors.id_anillo}
            </div>
          )}
        </div>

        {/* Color Anillo */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🎨</span>Color Anillo:
          </label>
          {!usarColorPersonalizado ? (
            <select
              name="color_anillo"
              value={form.color_anillo}
              onChange={(e) => {
                const value = e.target.value
                setForm({ ...form, color_anillo: value })
                setUsarColorPersonalizado(value === "otro")
              }}
              className={`form-input ${fieldErrors.color_anillo ? "border-red-500 bg-red-50" : ""}`}
              required
            >
              <option value="">Seleccionar color</option>
              {coloresPredefinidos.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
              <option value="otro">Otro...</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                name="color_anillo"
                value={form.color_anillo}
                onChange={handleChange}
                className={`form-input flex-1 ${fieldErrors.color_anillo ? "border-red-500 bg-red-50" : ""}`}
                placeholder="Ingrese color personalizado"
                minLength={3}
                maxLength={20}
                required
              />
              <button
                type="button"
                className="text-blue-600 underline text-sm"
                onClick={() => {
                  setForm({ ...form, color_anillo: "" })
                  setUsarColorPersonalizado(false)
                }}
              >
                Volver
              </button>
            </div>
          )}
          {fieldErrors.color_anillo && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {fieldErrors.color_anillo}
            </div>
          )}
        </div>

        {/* Fecha de Nacimiento - NUEVO CAMPO */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🎂</span>Fecha de Nacimiento:
          </label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={form.fecha_nacimiento}
            onChange={handleChange}
            className={`form-input ${fieldErrors.fecha_nacimiento ? "border-red-500 bg-red-50" : ""}`}
            min={getMinDate()}
            max={getMaxDate()}
            required
          />
          {fieldErrors.fecha_nacimiento && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {fieldErrors.fecha_nacimiento}
            </div>
          )}
          <div className="mt-1 text-xs text-gray-500">💡 La edad se calculará automáticamente desde esta fecha</div>
        </div>

        {/* Estado de Puesta */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🥚</span>Estado de Puesta:
          </label>
          <select
            name="estado_puesta"
            value={form.estado_puesta}
            onChange={handleChange}
            className={`form-input ${fieldErrors.estado_puesta ? "border-red-500 bg-red-50" : ""}`}
            required
          >
            <option value="">Seleccionar estado</option>
            <option value="activa">🥚 Activa</option>
            <option value="inactiva">❌ Inactiva</option>
            <option value="en_desarrollo">🐣 En desarrollo</option>
          </select>
          {fieldErrors.estado_puesta && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {fieldErrors.estado_puesta}
            </div>
          )}
        </div>

        {/* Raza */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🧬</span>Raza:
          </label>
          <input
            type="text"
            name="raza"
            value={form.raza}
            onChange={handleChange}
            className={`form-input ${fieldErrors.raza ? "border-red-500 bg-red-50" : ""}`}
            placeholder="Ej: Leghorn, Rhode Island"
            minLength={2}
            maxLength={50}
            required
          />
          {fieldErrors.raza && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {fieldErrors.raza}
            </div>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={loading || loadingJaulas || jaulas.length === 0}>
          <span className="button-icon">💾</span>
          <span className="button-text">
            {loading ? "Registrando..." : loadingJaulas ? "Cargando..." : "Registrar Ave"}
          </span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarAve

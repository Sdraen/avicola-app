"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { avesAPI, jaulasAPI } from "../services/api"
import { useFormErrors, processApiError, ApiError } from "../utils/errorHandler"
import type { Jaula } from "../types"

const RegistrarAve: React.FC = () => {
  const navigate = useNavigate()
  const { fieldErrors, generalError, setApiError, clearErrors, clearFieldError } = useFormErrors()

  const [form, setForm] = useState({
    id_jaula: "",
    id_anillo: "",
    color_anillo: "",
    edad: "",
    estado_puesta: "",
    raza: "",
  })

  const [jaulas, setJaulas] = useState<Jaula[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingJaulas, setLoadingJaulas] = useState(true)
  const [success, setSuccess] = useState("")
  const [usarColorPersonalizado, setUsarColorPersonalizado] = useState(false)

  const coloresPredefinidos = ["Rojo", "Azul", "Verde", "Amarillo", "Negro", "Blanco"]

  useEffect(() => {
    fetchJaulas()
  }, [])

  const fetchJaulas = async () => {
    try {
      setLoadingJaulas(true)
      const response = await jaulasAPI.getAll()
      setJaulas(response.data)
    } catch (error) {
      console.error("Error cargando jaulas:", error)
      setApiError(
        new ApiError("Error", 500, [{ field: "general", message: "No se pudieron cargar las jaulas disponibles" }])
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
        edad: form.edad.trim(),
        estado_puesta: form.estado_puesta,
        raza: form.raza.trim(),
      }

      if (!aveData.id_jaula || isNaN(aveData.id_jaula)) {
        setApiError(
          new ApiError("Validation failed", 400, [{ field: "id_jaula", message: "Debe seleccionar una jaula válida" }])
        )
        return
      }

      await avesAPI.create(aveData)
      setSuccess("Ave registrada exitosamente")
      setForm({ id_jaula: "", id_anillo: "", color_anillo: "", edad: "", estado_puesta: "", raza: "" })

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

  const formatJaulaOption = (jaula: Jaula) => {
    let label = `🏠 Jaula ${jaula.codigo_jaula}`
    if (jaula.descripcion) label += ` - ${jaula.descripcion}`
    return label
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🐓</div>
        <h2 className="form-title">Registrar Nueva Ave</h2>
        <p className="form-subtitle">Complete los datos para registrar un ave en el sistema</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {generalError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{generalError}</div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
        )}

        {/* Jaula */}
        <div className="form-group">
          <label className="form-label"><span className="label-icon">🏠</span>Jaula:</label>
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
                <option key={jaula.id_jaula} value={jaula.id_jaula}>{formatJaulaOption(jaula)}</option>
              ))}
            </select>
          )}
          {fieldErrors.id_jaula && <div className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{fieldErrors.id_jaula}</div>}
        </div>

        {/* ID Anillo */}
        <div className="form-group">
          <label className="form-label"><span className="label-icon">🏷️</span>ID Anillo:</label>
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
          {fieldErrors.id_anillo && <div className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{fieldErrors.id_anillo}</div>}
        </div>

        {/* Color Anillo */}
        <div className="form-group">
          <label className="form-label"><span className="label-icon">🎨</span>Color Anillo:</label>
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
                <option key={color} value={color}>{color}</option>
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
              <button type="button" className="text-blue-600 underline text-sm" onClick={() => {
                setForm({ ...form, color_anillo: "" })
                setUsarColorPersonalizado(false)
              }}>
                Volver
              </button>
            </div>
          )}
          {fieldErrors.color_anillo && <div className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{fieldErrors.color_anillo}</div>}
        </div>

        {/* Edad */}
        <div className="form-group">
          <label className="form-label"><span className="label-icon">📅</span>Edad:</label>
          <input
            type="text"
            name="edad"
            value={form.edad}
            onChange={handleChange}
            className={`form-input ${fieldErrors.edad ? "border-red-500 bg-red-50" : ""}`}
            placeholder="Ej: 24 semanas, 6 meses, 1 año"
            maxLength={50}
            required
          />
          {fieldErrors.edad && <div className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{fieldErrors.edad}</div>}
          <div className="mt-1 text-xs text-gray-500">💡 Puede ser en semanas, meses o años</div>
        </div>

        {/* Estado de Puesta */}
        <div className="form-group">
          <label className="form-label"><span className="label-icon">🥚</span>Estado de Puesta:</label>
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
          {fieldErrors.estado_puesta && <div className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{fieldErrors.estado_puesta}</div>}
        </div>

        {/* Raza */}
        <div className="form-group">
          <label className="form-label"><span className="label-icon">🧬</span>Raza:</label>
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
          {fieldErrors.raza && <div className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{fieldErrors.raza}</div>}
        </div>

        <button type="submit" className="submit-button" disabled={loading || loadingJaulas || jaulas.length === 0}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : loadingJaulas ? "Cargando..." : "Registrar Ave"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarAve

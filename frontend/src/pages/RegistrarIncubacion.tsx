"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { incubacionesAPI, incubadorasAPI } from "../services/api"
import { useFormErrors, ApiError, processApiError } from "../utils/errorHandler"
import type { Incubadora } from "../types"

const RegistrarIncubacion: React.FC = () => {
  const navigate = useNavigate()
  const { fieldErrors, generalError, setApiError, clearErrors, clearFieldError } = useFormErrors()
  const [incubadoras, setIncubadoras] = useState<Incubadora[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingIncubadoras, setLoadingIncubadoras] = useState(true)
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({
    id_incubadora: "",
    fecha_inicio: "",
    lote: "",
    temperatura: "",
    cantidad_huevos: "",
    observaciones: "",
  })

  useEffect(() => {
    const fetchIncubadoras = async () => {
      try {
        setLoadingIncubadoras(true)
        const { data } = await incubadorasAPI.getAll()
        setIncubadoras(data)
      } catch (err) {
        console.error(err)
        setApiError(new ApiError("Error", 500, [{ field: "general", message: "No se pudieron cargar incubadoras" }]))
      } finally {
        setLoadingIncubadoras(false)
      }
    }
    fetchIncubadoras()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
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
      const payload = {
        id_incubadora: Number.parseInt(form.id_incubadora),
        fecha_inicio: form.fecha_inicio,
        lote: form.lote || null,
        temperatura: form.temperatura ? Number(form.temperatura) : null,
        cantidad_huevos: form.cantidad_huevos ? Number.parseInt(form.cantidad_huevos) : null,
        observaciones: form.observaciones || null,
      }
      if (!payload.id_incubadora || Number.isNaN(payload.id_incubadora)) {
        setApiError(new ApiError("Validation failed", 400, [{ field: "id_incubadora", message: "Seleccione incubadora" }]))
        return
      }

      await incubacionesAPI.create(payload)
      setSuccess("Incubación iniciada correctamente")
      setTimeout(() => navigate("/ver-incubaciones"), 1200)
    } catch (err: any) {
      const apiError = err instanceof ApiError ? err : processApiError(err)
      setApiError(apiError)
    } finally {
      setLoading(false)
    }
  }

  // fechas
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🥚</div>
        <h2 className="form-title">Iniciar Incubación</h2>
        <p className="form-subtitle">Asigne una incubadora y defina la fecha de inicio. La fecha estimada se calcula (+21 días).</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {generalError && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{generalError}</div>}
        {success && <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>}

        {/* Incubadora */}
        <div className="form-group">
          <label className="form-label"><span className="label-icon">🧰</span>Incubadora:</label>
          {loadingIncubadoras ? (
            <div className="form-input flex items-center justify-center py-3">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-gray-600">Cargando incubadoras...</span>
              </div>
            </div>
          ) : (
            <select
              name="id_incubadora"
              value={form.id_incubadora}
              onChange={handleChange}
              className={`form-input ${fieldErrors.id_incubadora ? "border-red-500 bg-red-50" : ""}`}
              required
            >
              <option value="">Seleccionar incubadora</option>
              {incubadoras.map((i) => (
                <option key={i.id_incubadora} value={i.id_incubadora}>
                  {i.nombre} (cap. {i.capacidad})
                </option>
              ))}
            </select>
          )}
          {fieldErrors.id_incubadora && <div className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{fieldErrors.id_incubadora}</div>}
        </div>

        {/* Fecha inicio */}
        <div className="form-group">
          <label className="form-label"><span className="label-icon">📅</span>Fecha de inicio:</label>
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            className={`form-input ${fieldErrors.fecha_inicio ? "border-red-500 bg-red-50" : ""}`}
            max={today}
            required
          />
          {fieldErrors.fecha_inicio && <div className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{fieldErrors.fecha_inicio}</div>}
        </div>

        {/* Opcionales */}
        <div className="form-group">
          <label className="form-label"><span className="label-icon">🧪</span>Lote (opcional):</label>
          <input type="text" name="lote" value={form.lote} onChange={handleChange} className="form-input" placeholder="Lote referencia" />
        </div>

        <div className="form-group">
          <label className="form-label"><span className="label-icon">🌡️</span>Temperatura (°C):</label>
          <input type="number" step="0.1" name="temperatura" value={form.temperatura} onChange={handleChange} className="form-input" placeholder="Ej: 37.5" />
        </div>

        <div className="form-group">
          <label className="form-label"><span className="label-icon">🥚</span>Cantidad de huevos:</label>
          <input type="number" name="cantidad_huevos" value={form.cantidad_huevos} onChange={handleChange} className="form-input" placeholder="Ej: 20" />
        </div>

        <div className="form-group">
          <label className="form-label"><span className="label-icon">📝</span>Observaciones:</label>
          <textarea name="observaciones" value={form.observaciones} onChange={handleChange} className="form-input" rows={3} placeholder="Notas adicionales..." />
        </div>

        <button type="submit" className="submit-button" disabled={loading || loadingIncubadoras}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Guardando..." : "Iniciar Incubación"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarIncubacion

"use client"
import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { vacunasAPI } from "../services/api"
import { useFormErrors, processApiError, ApiError } from "../utils/errorHandler"

const RegistrarVacuna: React.FC = () => {
  const navigate = useNavigate()
  const { fieldErrors, generalError, setApiError, clearErrors, clearFieldError } = useFormErrors()

  const [form, setForm] = useState({
    nombre: "",
    dosis: "",
    // nombre EXACTO de la columna/contract backend
    fecha_administracion: "",
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) clearFieldError(name)
    if (success) setSuccess("")
    if (generalError) clearErrors()
  }

  const getMaxDate = () => new Date().toISOString().split("T")[0]

  const validate = () => {
    const errs: Record<string, string> = {}

    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio"
    if (!form.dosis.trim()) errs.dosis = "La dosis es obligatoria"

    if (!form.fecha_administracion) {
      errs.fecha_administracion = "La fecha de administración es obligatoria"
    } else {
      const hoy = new Date(getMaxDate())
      const f = new Date(form.fecha_administracion)
      if (f > hoy) errs.fecha_administracion = "La fecha no puede ser futura"
    }

    if (Object.keys(errs).length) {
      setApiError(
        new ApiError(
          "Validation failed",
          400,
          Object.entries(errs).map(([field, message]) => ({ field, message })),
        ),
      )
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setSuccess("")
    if (!validate()) return

    setLoading(true)
    try {
      await vacunasAPI.create({
        nombre: form.nombre.trim(),
        dosis: form.dosis.trim(),
        fecha_administracion: form.fecha_administracion, // <- importante
      })

      setSuccess("Vacuna registrada exitosamente")
      setForm({ nombre: "", dosis: "", fecha_administracion: "" })

      setTimeout(() => navigate("/ver-vacunas"), 1200)
    } catch (err: any) {
      const apiError = err instanceof ApiError ? err : processApiError(err)
      setApiError(apiError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">💉</div>
        <h2 className="form-title">Registrar Vacuna</h2>
        <p className="form-subtitle">Ingrese los datos de la vacuna. La fecha de administración es obligatoria.</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {generalError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{generalError}</div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
        )}

        {/* Nombre */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🏷️</span>Nombre:
          </label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className={`form-input ${fieldErrors.nombre ? "border-red-500 bg-red-50" : ""}`}
            placeholder="Ej: Bronquitis infecciosa"
            maxLength={100}
            required
          />
          {fieldErrors.nombre && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {fieldErrors.nombre}
            </div>
          )}
        </div>

        {/* Dosis */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📏</span>Dosis estándar:
          </label>
          <input
            type="text"
            name="dosis"
            value={form.dosis}
            onChange={handleChange}
            className={`form-input ${fieldErrors.dosis ? "border-red-500 bg-red-50" : ""}`}
            placeholder="Ej: 0.5 ml"
            maxLength={100}
            required
          />
          <div className="mt-1 text-xs text-gray-500">💡 Usa una descripción clara (cantidad y unidad).</div>
          {fieldErrors.dosis && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {fieldErrors.dosis}
            </div>
          )}
        </div>

        {/* Fecha de administración */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📅</span>Fecha de administración:
          </label>
          <input
            type="date"
            name="fecha_administracion"
            value={form.fecha_administracion}
            onChange={handleChange}
            className={`form-input ${fieldErrors.fecha_administracion ? "border-red-500 bg-red-50" : ""}`}
            max={getMaxDate()}
            required
          />
          <div className="mt-1 text-xs text-gray-500">💡 Usa el formato YYYY-MM-DD. No se permiten fechas futuras.</div>
          {fieldErrors.fecha_administracion && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {fieldErrors.fecha_administracion}
            </div>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Vacuna"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarVacuna

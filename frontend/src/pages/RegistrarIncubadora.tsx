"use client"
import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { incubadorasAPI } from "../services/api"
import { useFormErrors, ApiError, processApiError } from "../utils/errorHandler"

const RegistrarIncubadora: React.FC = () => {
  const navigate = useNavigate()
  const { fieldErrors, generalError, setApiError, clearErrors, clearFieldError } = useFormErrors()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState({ nombre: "", capacidad: "", estado: "activa" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (fieldErrors[name]) clearFieldError(name)
    if (generalError) clearErrors()
    if (success) setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setLoading(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        capacidad: Number(form.capacidad),
        estado: form.estado,
      }
      if (!payload.nombre) {
        setApiError(new ApiError("Validation failed", 400, [{ field: "nombre", message: "Ingrese nombre" }]))
        return
      }
      if (!payload.capacidad || Number.isNaN(payload.capacidad) || payload.capacidad <= 0) {
        setApiError(new ApiError("Validation failed", 400, [{ field: "capacidad", message: "Capacidad inválida" }]))
        return
      }
      await incubadorasAPI.create(payload)
      setSuccess("Incubadora registrada correctamente")
      setTimeout(() => navigate("/ver-incubadoras"), 1000)
    } catch (err: any) {
      setApiError(err instanceof ApiError ? err : processApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🧰</div>
        <h2 className="form-title">Registrar Incubadora</h2>
        <p className="form-subtitle">Crea una nueva máquina incubadora para asignarla a futuras incubaciones.</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {generalError && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{generalError}</div>}
        {success && <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>}

        <div className="form-group">
          <label className="form-label">Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className={`form-input ${fieldErrors.nombre ? "border-red-500 bg-red-50" : ""}`}
            placeholder="Ej: Incubadora #1"
            required
          />
          {fieldErrors.nombre && <div className="mt-1 text-sm text-red-600">{fieldErrors.nombre}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Capacidad (huevos):</label>
          <input
            type="number"
            name="capacidad"
            value={form.capacidad}
            onChange={handleChange}
            className={`form-input ${fieldErrors.capacidad ? "border-red-500 bg-red-50" : ""}`}
            placeholder="Ej: 48"
            required
            min={1}
          />
          {fieldErrors.capacidad && <div className="mt-1 text-sm text-red-600">{fieldErrors.capacidad}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Estado:</label>
          <select name="estado" value={form.estado} onChange={handleChange} className="form-input">
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
          </select>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Guardando..." : "Registrar Incubadora"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarIncubadora

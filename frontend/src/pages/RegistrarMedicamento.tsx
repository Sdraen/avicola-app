"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { medicamentosAPI } from "../services/api"
import { useFormErrors, processApiError, ApiError } from "../utils/errorHandler"

const RegistrarMedicamento: React.FC = () => {
  const navigate = useNavigate()
  const { fieldErrors, generalError, setApiError, clearErrors, clearFieldError } = useFormErrors()

  const [form, setForm] = useState({
    nombre: "",
    dosis: "",
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

  // Validación mínima en cliente (coincide con backend: nombre y dosis requeridos)
  const validateClient = () => {
    const errs: Array<{ field: string; message: string }> = []

    const nombre = form.nombre.trim()
    const dosis = form.dosis.trim()

    if (!nombre) errs.push({ field: "nombre", message: "El nombre es obligatorio" })
    else if (nombre.length > 100) errs.push({ field: "nombre", message: "Máximo 100 caracteres" })

    if (!dosis) errs.push({ field: "dosis", message: "La dosis es obligatoria" })
    else if (dosis.length > 100) errs.push({ field: "dosis", message: "Máximo 100 caracteres" })

    if (errs.length) {
      setApiError(new ApiError("Validation failed", 400, errs))
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setSuccess("")
    if (!validateClient()) return

    setLoading(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        dosis: form.dosis.trim(),
      }

      await medicamentosAPI.create(payload)
      setSuccess("✅ Medicamento registrado exitosamente")
      setForm({ nombre: "", dosis: "" })

      // Redirigir tras un breve feedback
      setTimeout(() => {
        navigate("/ver-medicamentos")
      }, 1400)
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
        <div className="form-icon">💊</div>
        <h2 className="form-title">Registrar Medicamento</h2>
        <p className="form-subtitle">Ingrese los datos del medicamento para agregarlo al sistema</p>
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
            placeholder="Ej: Amoxicilina"
            maxLength={100}
            required
            autoFocus
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
            placeholder="Ej: 10 mg/kg cada 12h"
            maxLength={100}
            required
          />
          {fieldErrors.dosis && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {fieldErrors.dosis}
            </div>
          )}
          <div className="mt-1 text-xs text-gray-500">
            💡 Usa una descripción clara de dosis (por peso, frecuencia, vía de administración, etc.)
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Medicamento"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarMedicamento

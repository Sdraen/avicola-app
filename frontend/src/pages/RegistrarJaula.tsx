"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { jaulasAPI } from "../services/api"

const RegistrarJaula: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    codigo_jaula: "",
    descripcion: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Validación en tiempo real para codigo_jaula
    if (name === "codigo_jaula") {
      // Solo permitir dígitos y máximo 6 caracteres
      const numericValue = value.replace(/\D/g, "").slice(0, 6)
      setForm({ ...form, [name]: numericValue })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const validateForm = () => {
    if (!form.codigo_jaula) {
      setError("El código de jaula es obligatorio")
      return false
    }

    if (!/^\d{1,6}$/.test(form.codigo_jaula)) {
      setError("El código debe contener entre 1 y 6 dígitos")
      return false
    }

    const codigoNum = Number.parseInt(form.codigo_jaula, 10)
    if (codigoNum < 1) {
      setError("El código debe ser mayor o igual a 1")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const jaulaData = {
        codigo_jaula: form.codigo_jaula,
        descripcion: form.descripcion,
      }

      await jaulasAPI.create(jaulaData)
      setSuccess("Jaula registrada exitosamente")

      // Limpiar formulario
      setForm({
        codigo_jaula: "",
        descripcion: "",
      })

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/ver-jaulas")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrar la jaula")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🏠</div>
        <h2 className="form-title">Registrar Nueva Jaula</h2>
        <p className="form-subtitle">Complete los datos para registrar una jaula en el sistema</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
        )}

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🔢</span>
            Código de Jaula:
          </label>
          <input
            type="text"
            name="codigo_jaula"
            value={form.codigo_jaula}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: 1, 123, 999999"
            required
            maxLength={6}
          />
          <p className="text-sm text-gray-500 mt-1">Entre 1 y 6 dígitos (mínimo: 1)</p>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📝</span>
            Descripción:
          </label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="form-input"
            rows={3}
            placeholder="Descripción de la jaula (opcional)"
            maxLength={255}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-blue-800 font-medium mb-2">ℹ️ Información importante:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• El código de jaula debe ser único</li>
            <li>• Solo se permiten números del 1 al 999999</li>
            <li>• El estanque se asignará automáticamente (Estanque 1)</li>
            <li>• La descripción es opcional pero recomendada</li>
          </ul>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Jaula"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarJaula

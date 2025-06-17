"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { jaulasAPI } from "../services/api"

const RegistrarJaula: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    id_estanque: "",
    descripcion: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const jaulaData = {
        id_estanque: Number.parseInt(form.id_estanque),
        descripcion: form.descripcion,
      }

      await jaulasAPI.create(jaulaData)
      setSuccess("Jaula registrada exitosamente")

      // Limpiar formulario
      setForm({
        id_estanque: "",
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
            <span className="label-icon">🏊</span>
            ID Estanque:
          </label>
          <input
            type="number"
            name="id_estanque"
            value={form.id_estanque}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: 1, 2, 3"
            required
          />
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
          />
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

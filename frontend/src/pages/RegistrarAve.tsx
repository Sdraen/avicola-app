"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { avesAPI } from "../services/api"

const RegistrarAve: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    id_jaula: "",
    id_anillo: "", // nuevo campo
    color_anillo: "",
    edad: "",
    estado_puesta: "",
    raza: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    // Validación básica de longitud
    if (form.id_anillo.length < 1 || form.id_anillo.length > 10) {
      setError("El ID de anillo debe tener entre 1 y 10 caracteres.")
      setLoading(false)
      return
    }

    try {
      const aveData = {
        id_jaula: Number.parseInt(form.id_jaula),
        id_anillo: form.id_anillo,
        color_anillo: form.color_anillo,
        edad: form.edad,
        estado_puesta: form.estado_puesta,
        raza: form.raza,
      }

      await avesAPI.create(aveData)
      setSuccess("Ave registrada exitosamente")

      // Limpiar formulario
      setForm({
        id_jaula: "",
        id_anillo: "",
        color_anillo: "",
        edad: "",
        estado_puesta: "",
        raza: "",
      })

      setTimeout(() => {
        navigate("/ver-aves")
      }, 2000)
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Ya existe un ave con ese ID de anillo.")
      } else {
        setError(err.response?.data?.error || "Error al registrar el ave")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🐓</div>
        <h2 className="form-title">Registrar Nueva Ave</h2>
        <p className="form-subtitle">Complete los datos para registrar un ave en el sistema</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
        )}

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🏠</span>
            ID Jaula:
          </label>
          <input
            type="number"
            name="id_jaula"
            value={form.id_jaula}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: 1, 2, 3"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🔢</span>
            ID Anillo (1–10 caracteres):
          </label>
          <input
            type="text"
            name="id_anillo"
            value={form.id_anillo}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: A12345"
            required
            minLength={1}
            maxLength={10}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🎨</span>
            Color Anillo:
          </label>
          <input
            type="text"
            name="color_anillo"
            value={form.color_anillo}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: Rojo, Azul, Verde"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📅</span>
            Edad:
          </label>
          <input
            type="text"
            name="edad"
            value={form.edad}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: 6 meses, 1 año"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🥚</span>
            Estado de Puesta:
          </label>
          <select
            name="estado_puesta"
            value={form.estado_puesta}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Seleccionar estado</option>
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
            <option value="en_desarrollo">En desarrollo</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🧬</span>
            Raza:
          </label>
          <input
            type="text"
            name="raza"
            value={form.raza}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: Leghorn, Rhode Island"
            required
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Ave"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarAve

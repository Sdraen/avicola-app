"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { clientesAPI } from "../services/api"

const RegistrarCliente: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    tipo_cliente: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const clienteData = {
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim() || "",
        telefono: form.telefono.replace(/\D/g, "") || "",
        tipo_cliente: form.tipo_cliente,
      }

      await clientesAPI.create(clienteData)
      setSuccess("Cliente registrado exitosamente")

      setForm({
        nombre: "",
        direccion: "",
        telefono: "",
        tipo_cliente: "",
      })

      setTimeout(() => {
        navigate("/ver-clientes")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrar el cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">👥</div>
        <h2 className="form-title">Registrar Nuevo Cliente</h2>
        <p className="form-subtitle">Complete los datos para registrar un cliente en el sistema</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
        )}

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">👤</span>
            Nombre:
          </label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="form-input"
            placeholder="Nombre completo del cliente"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📍</span>
            Dirección:
          </label>
          <textarea
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            className="form-input"
            rows={3}
            placeholder="Dirección completa del cliente"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📞</span>
            Teléfono:
          </label>
          <input
            type="tel"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="form-input"
            placeholder="Número de teléfono"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🏷️</span>
            Tipo de Cliente:
          </label>
          <select name="tipo_cliente" value={form.tipo_cliente} onChange={handleChange} className="form-input">
            <option value="">Seleccionar tipo</option>
            <option value="mayorista">Mayorista</option>
            <option value="minorista">Minorista</option>
            <option value="distribuidor">Distribuidor</option>
          </select>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Cliente"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarCliente

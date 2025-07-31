"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { huevosAPI, jaulasAPI } from "../services/api"
import type { Jaula } from "../types"
import { obtenerFechaLocalHoy } from "../utils/formatoFecha"

const RegistrarHuevos: React.FC = () => {
  const navigate = useNavigate()
  const [jaulas, setJaulas] = useState<Jaula[]>([])
  const [form, setForm] = useState({
    id_jaula: "",
    fecha_recoleccion: obtenerFechaLocalHoy(),
    cantidad_total: "",
    huevos_cafe_chico: "",
    huevos_cafe_mediano: "",
    huevos_cafe_grande: "",
    huevos_cafe_jumbo: "",
    huevos_blanco_chico: "",
    huevos_blanco_mediano: "",
    huevos_blanco_grande: "",
    huevos_blanco_jumbo: "",
    observaciones: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchJaulas = async () => {
      try {
        const response = await jaulasAPI.getAll()
        setJaulas(response.data)
      } catch (err) {
        console.error("Error fetching jaulas:", err)
      }
    }

    fetchJaulas()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const calculateTotal = () => {
    const total =
      Number(form.huevos_cafe_chico || 0) +
      Number(form.huevos_cafe_mediano || 0) +
      Number(form.huevos_cafe_grande || 0) +
      Number(form.huevos_cafe_jumbo || 0) +
      Number(form.huevos_blanco_chico || 0) +
      Number(form.huevos_blanco_mediano || 0) +
      Number(form.huevos_blanco_grande || 0) +
      Number(form.huevos_blanco_jumbo || 0)

    setForm({ ...form, cantidad_total: total.toString() })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Asegurar que la fecha se envíe en formato correcto (YYYY-MM-DD)
      const huevoData = {
        id_jaula: Number.parseInt(form.id_jaula),
        fecha_recoleccion: form.fecha_recoleccion, // Ya está en formato YYYY-MM-DD
        cantidad_total: Number.parseInt(form.cantidad_total),
        huevos_cafe_chico: Number.parseInt(form.huevos_cafe_chico || "0"),
        huevos_cafe_mediano: Number.parseInt(form.huevos_cafe_mediano || "0"),
        huevos_cafe_grande: Number.parseInt(form.huevos_cafe_grande || "0"),
        huevos_cafe_jumbo: Number.parseInt(form.huevos_cafe_jumbo || "0"),
        huevos_blanco_chico: Number.parseInt(form.huevos_blanco_chico || "0"),
        huevos_blanco_mediano: Number.parseInt(form.huevos_blanco_mediano || "0"),
        huevos_blanco_grande: Number.parseInt(form.huevos_blanco_grande || "0"),
        huevos_blanco_jumbo: Number.parseInt(form.huevos_blanco_jumbo || "0"),
        observaciones: form.observaciones,
      }

      console.log("📅 Enviando fecha:", huevoData.fecha_recoleccion)

      await huevosAPI.create(huevoData)
      setSuccess("Registro de huevos creado exitosamente")

      // Limpiar formulario
      setForm({
        id_jaula: "",
        fecha_recoleccion: obtenerFechaLocalHoy(), // ✅ Usando función local
        cantidad_total: "",
        huevos_cafe_chico: "",
        huevos_cafe_mediano: "",
        huevos_cafe_grande: "",
        huevos_cafe_jumbo: "",
        huevos_blanco_chico: "",
        huevos_blanco_mediano: "",
        huevos_blanco_grande: "",
        huevos_blanco_jumbo: "",
        observaciones: "",
      })

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/ver-huevos")
      }, 2000)
    } catch (err: any) {
      console.error("Error al registrar huevos:", err)
      setError(err.response?.data?.error || "Error al registrar los huevos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🥚</div>
        <h2 className="form-title">Registrar Huevos por Jaula</h2>
        <p className="form-subtitle">Complete los datos para registrar la recolección de huevos</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🏠</span>
              Jaula:
            </label>
            <select name="id_jaula" value={form.id_jaula} onChange={handleChange} className="form-input" required>
              <option value="">Seleccionar jaula</option>
              {jaulas.map((jaula) => (
                <option key={jaula.id_jaula} value={jaula.id_jaula}>
                  {jaula.descripcion || `Jaula ${jaula.id_jaula}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📅</span>
              Fecha de Recolección:
            </label>
            <input
              type="date"
              name="fecha_recoleccion"
              value={form.fecha_recoleccion}
              onChange={handleChange}
              className="form-input"
              required
              max={obtenerFechaLocalHoy()} // ✅ No permitir fechas futuras usando función local
            />
            <small className="text-gray-500 text-xs mt-1 block">
              📅 Fecha seleccionada: {new Date(form.fecha_recoleccion + "T00:00:00").toLocaleDateString("es-ES")}
            </small>
          </div>
        </div>

        {/* Huevos Café */}
        <div className="form-group">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">🟤 Huevos Café</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Chico:</label>
              <input
                type="number"
                name="huevos_cafe_chico"
                value={form.huevos_cafe_chico}
                onChange={handleChange}
                className="form-input"
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className="form-label">Mediano:</label>
              <input
                type="number"
                name="huevos_cafe_mediano"
                value={form.huevos_cafe_mediano}
                onChange={handleChange}
                className="form-input"
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className="form-label">Grande:</label>
              <input
                type="number"
                name="huevos_cafe_grande"
                value={form.huevos_cafe_grande}
                onChange={handleChange}
                className="form-input"
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className="form-label">Jumbo:</label>
              <input
                type="number"
                name="huevos_cafe_jumbo"
                value={form.huevos_cafe_jumbo}
                onChange={handleChange}
                className="form-input"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Huevos Blanco */}
        <div className="form-group">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">⚪ Huevos Blanco</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Chico:</label>
              <input
                type="number"
                name="huevos_blanco_chico"
                value={form.huevos_blanco_chico}
                onChange={handleChange}
                className="form-input"
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className="form-label">Mediano:</label>
              <input
                type="number"
                name="huevos_blanco_mediano"
                value={form.huevos_blanco_mediano}
                onChange={handleChange}
                className="form-input"
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className="form-label">Grande:</label>
              <input
                type="number"
                name="huevos_blanco_grande"
                value={form.huevos_blanco_grande}
                onChange={handleChange}
                className="form-input"
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className="form-label">Jumbo:</label>
              <input
                type="number"
                name="huevos_blanco_jumbo"
                value={form.huevos_blanco_jumbo}
                onChange={handleChange}
                className="form-input"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🥚</span>
              Cantidad Total:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="cantidad_total"
                value={form.cantidad_total}
                onChange={handleChange}
                className="form-input"
                min="0"
                required
              />
              <button
                type="button"
                onClick={calculateTotal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Calcular
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📝</span>
              Observaciones:
            </label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              className="form-input"
              rows={3}
              placeholder="Observaciones adicionales..."
            />
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Huevos"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarHuevos

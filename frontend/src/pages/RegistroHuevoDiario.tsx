"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { registroHuevosAPI } from "../services/api"
import type { RegistroHuevosDiario as RegistroHuevosDiarioType } from "../types"

const RegistroHuevosDiario: React.FC = () => {
  const navigate = useNavigate()
  const [registros, setRegistros] = useState<RegistroHuevosDiarioType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    fecha_recoleccion: new Date().toISOString().split("T")[0],
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

  useEffect(() => {
    fetchRegistros()
  }, [])

  const fetchRegistros = async () => {
    try {
      const response = await registroHuevosAPI.getAll()
      setRegistros(response.data)
    } catch (err: any) {
      setError("Error al cargar los registros")
      console.error("Error fetching registros:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    try {
      const registroData = {
        fecha_recoleccion: form.fecha_recoleccion,
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

      await registroHuevosAPI.create(registroData)
      setShowForm(false)
      fetchRegistros()

      // Reset form
      setForm({
        fecha_recoleccion: new Date().toISOString().split("T")[0],
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
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al crear el registro")
    }
  }

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando registros...</div>
      </div>
    )
  }

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">📅</div>
          <div className="header-text">
            <h1 className="table-title">Registro Diario de Huevos</h1>
            <p className="table-subtitle">Registro consolidado por día - Total: {registros.length}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? "Cancelar" : "Nuevo Registro"}
        </button>
      </div>

      {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Nuevo Registro Diario</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Recolección:</label>
                <input
                  type="date"
                  name="fecha_recoleccion"
                  value={form.fecha_recoleccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad Total:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="cantidad_total"
                    value={form.cantidad_total}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                  <button
                    type="button"
                    onClick={calculateTotal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Calcular
                  </button>
                </div>
              </div>
            </div>

            {/* Huevos Café */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">🟤 Huevos Café</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chico:</label>
                  <input
                    type="number"
                    name="huevos_cafe_chico"
                    value={form.huevos_cafe_chico}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mediano:</label>
                  <input
                    type="number"
                    name="huevos_cafe_mediano"
                    value={form.huevos_cafe_mediano}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grande:</label>
                  <input
                    type="number"
                    name="huevos_cafe_grande"
                    value={form.huevos_cafe_grande}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumbo:</label>
                  <input
                    type="number"
                    name="huevos_cafe_jumbo"
                    value={form.huevos_cafe_jumbo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Huevos Blanco */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">⚪ Huevos Blanco</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chico:</label>
                  <input
                    type="number"
                    name="huevos_blanco_chico"
                    value={form.huevos_blanco_chico}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mediano:</label>
                  <input
                    type="number"
                    name="huevos_blanco_mediano"
                    value={form.huevos_blanco_mediano}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grande:</label>
                  <input
                    type="number"
                    name="huevos_blanco_grande"
                    value={form.huevos_blanco_grande}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumbo:</label>
                  <input
                    type="number"
                    name="huevos_blanco_jumbo"
                    value={form.huevos_blanco_jumbo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones:</label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Observaciones adicionales..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Guardar Registro
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="tabla-aves">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Total</th>
              <th>Café</th>
              <th>Blanco</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((registro) => {
              const totalCafe =
                registro.huevos_cafe_chico +
                registro.huevos_cafe_mediano +
                registro.huevos_cafe_grande +
                registro.huevos_cafe_jumbo
              const totalBlanco =
                registro.huevos_blanco_chico +
                registro.huevos_blanco_mediano +
                registro.huevos_blanco_grande +
                registro.huevos_blanco_jumbo

              return (
                <tr key={registro.id} className="table-row">
                  <td className="table-cell">{new Date(registro.fecha_recoleccion).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <span className="cantidad-badge">{registro.cantidad_total}</span>
                  </td>
                  <td className="table-cell">{totalCafe}</td>
                  <td className="table-cell">{totalBlanco}</td>
                  <td className="table-cell">{registro.observaciones || "-"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RegistroHuevosDiario

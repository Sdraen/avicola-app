"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

const RegistrarIncubacion: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    lote: "",
    cantidad_huevos: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    temperatura: "37.5",
    observaciones: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
    setSuccess("")
  }

  const calcularFechaEclosion = (fechaInicio: string) => {
    const fecha = new Date(fechaInicio)
    fecha.setDate(fecha.getDate() + 21)
    return fecha.toISOString().split("T")[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const fechaEclosion = calcularFechaEclosion(form.fecha_inicio)

      await api.post("/incubacion", {
        lote: form.lote.trim(),
        cantidad_huevos: parseInt(form.cantidad_huevos),
        fecha_inicio: form.fecha_inicio,
        fecha_estimada_eclosion: fechaEclosion,
        temperatura: parseFloat(form.temperatura),
        observaciones: form.observaciones.trim(),
        id_incubadora: 1, // fijo
      })

      setSuccess("Incubación registrada correctamente")
      setTimeout(() => navigate("/incubacion"), 1800)
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrar incubación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col items-center mb-6">
        <div className="text-4xl">🐣</div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mt-2">Registrar Incubación</h1>
        <p className="text-gray-500 text-sm text-center">Complete los datos para iniciar un proceso de incubación</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded">{success}</div>}

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">📄 Lote</label>
          <input
            name="lote"
            value={form.lote}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: INC-2025-001"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">🥚 Cantidad de Huevos</label>
          <input
            type="number"
            name="cantidad_huevos"
            value={form.cantidad_huevos}
            onChange={handleChange}
            required
            min={1}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 24"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">📅 Fecha de Inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">📅 Fecha Estimada de Eclosión</label>
          <input
            type="date"
            value={calcularFechaEclosion(form.fecha_inicio)}
            disabled
            className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">🌡️ Temperatura (°C)</label>
          <input
            type="number"
            name="temperatura"
            value={form.temperatura}
            onChange={handleChange}
            step="0.1"
            min="35"
            max="40"
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">📝 Observaciones</label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition disabled:opacity-50"
          >
            💾 {loading ? "Registrando..." : "Registrar"}
          </button>
      
        </div>
      </form>
    </div>
  )
}

export default RegistrarIncubacion

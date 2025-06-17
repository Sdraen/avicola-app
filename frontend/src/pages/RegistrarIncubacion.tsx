"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import  api  from "../services/api"

export default function RegistrarIncubacion() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    lote: "",
    cantidad_huevos: "",
    fecha_inicio: "",
    temperatura: "37.5",
    humedad: "60",
    volteos_dia: "4",
    observaciones: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const calcularFechaEclosion = (fechaInicio: string) => {
    const fecha = new Date(fechaInicio)
    fecha.setDate(fecha.getDate() + 21) // 21 días para pollos
    return fecha.toISOString().split("T")[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const fechaEclosion = calcularFechaEclosion(formData.fecha_inicio)

      await api.post("/incubacion", {
        ...formData,
        cantidad_huevos: Number.parseInt(formData.cantidad_huevos),
        temperatura: Number.parseFloat(formData.temperatura),
        humedad: Number.parseFloat(formData.humedad),
        volteos_dia: Number.parseInt(formData.volteos_dia),
        fecha_estimada_eclosion: fechaEclosion,
        estado: "Activo",
      })

      setSuccess("Incubación registrada exitosamente")
      setTimeout(() => {
        navigate("/incubacion")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar la incubación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Incubación</h1>
        <p className="text-gray-600 mt-2">Iniciar un nuevo proceso de incubación</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lote *</label>
              <input
                type="text"
                name="lote"
                value={formData.lote}
                onChange={handleChange}
                required
                placeholder="ej: INC-2024-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Huevos *</label>
              <input
                type="number"
                name="cantidad_huevos"
                value={formData.cantidad_huevos}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
            <input
              type="date"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {formData.fecha_inicio && (
              <p className="text-sm text-gray-600 mt-1">
                Fecha estimada de eclosión:{" "}
                {new Date(calcularFechaEclosion(formData.fecha_inicio)).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C) *</label>
              <input
                type="number"
                name="temperatura"
                value={formData.temperatura}
                onChange={handleChange}
                required
                min="35"
                max="40"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recomendado: 37.5°C</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Humedad (%) *</label>
              <input
                type="number"
                name="humedad"
                value={formData.humedad}
                onChange={handleChange}
                required
                min="40"
                max="80"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recomendado: 60%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Volteos por Día *</label>
              <input
                type="number"
                name="volteos_dia"
                value={formData.volteos_dia}
                onChange={handleChange}
                required
                min="2"
                max="8"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recomendado: 4 veces</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
              placeholder="Notas adicionales sobre la incubación..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Información del Proceso</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Duración total: 21 días para pollos</li>
              <li>• Los primeros 18 días requieren volteo regular</li>
              <li>• Los últimos 3 días se detiene el volteo para la eclosión</li>
              <li>• Mantener temperatura y humedad constantes</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Iniciar Incubación"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/incubacion")}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

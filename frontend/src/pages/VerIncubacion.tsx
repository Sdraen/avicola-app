"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import  api  from "../services/api"

interface Incubacion {
  id: number
  lote: string
  cantidad_huevos: number
  fecha_inicio: string
  fecha_estimada_eclosion: string
  temperatura: number
  humedad: number
  volteos_dia: number
  estado: string
  observaciones: string
  huevos_eclosionados: number
  huevos_no_fertiles: number
  created_at: string
}

export default function VerIncubacion() {
  const [incubaciones, setIncubaciones] = useState<Incubacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchIncubaciones()
  }, [])

  const fetchIncubaciones = async () => {
    try {
      const response = await api.get("/incubacion")
      setIncubaciones(response.data)
    } catch (err) {
      setError("Error al cargar las incubaciones")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "activo":
        return "bg-green-100 text-green-800"
      case "completado":
        return "bg-blue-100 text-blue-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calcularDiasRestantes = (fechaEclosion: string) => {
    const hoy = new Date()
    const fechaEst = new Date(fechaEclosion)
    const diferencia = Math.ceil((fechaEst.getTime() - hoy.getTime()) / (1000 * 3600 * 24))
    return diferencia
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando incubaciones...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incubaciones</h1>
          <p className="text-gray-600 mt-2">Lista de todos los procesos de incubación</p>
        </div>
        <Link
          to="/registrar-incubacion"
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Nueva Incubación
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incubaciones.map((incubacion) => (
          <div key={incubacion.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lote: {incubacion.lote}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(incubacion.estado)}`}>
                {incubacion.estado}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Huevos:</span>
                <span className="font-medium">{incubacion.cantidad_huevos}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Inicio:</span>
                <span className="font-medium">{new Date(incubacion.fecha_inicio).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Eclosión estimada:</span>
                <span className="font-medium">{new Date(incubacion.fecha_estimada_eclosion).toLocaleDateString()}</span>
              </div>

              {incubacion.estado.toLowerCase() === "activo" && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Días restantes:</span>
                  <span className="font-medium text-orange-600">
                    {calcularDiasRestantes(incubacion.fecha_estimada_eclosion)} días
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Temperatura:</span>
                <span className="font-medium">{incubacion.temperatura}°C</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Humedad:</span>
                <span className="font-medium">{incubacion.humedad}%</span>
              </div>

              {incubacion.huevos_eclosionados > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Eclosionados:</span>
                  <span className="font-medium text-green-600">{incubacion.huevos_eclosionados}</span>
                </div>
              )}
            </div>

            {incubacion.observaciones && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{incubacion.observaciones}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {incubaciones.length === 0 && (
        <div className="text-center py-8 text-gray-500">No se encontraron procesos de incubación</div>
      )}
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { aveClinicaAPI } from "../../services/api"
import type { HistorialClinico } from "../../types"

interface ModalHistorialClinicoProps {
  isOpen: boolean
  aveId: number
  aveInfo: {
    id_anillo: string
    raza: string
    color_anillo: string
  }
  onClose: () => void
}

const ModalHistorialClinico: React.FC<ModalHistorialClinicoProps> = ({ isOpen, aveId, aveInfo, onClose }) => {
  const [historial, setHistorial] = useState<HistorialClinico | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchHistorial = async () => {
    if (!aveId) return

    setLoading(true)
    setError("")

    try {
      const response = await aveClinicaAPI.getHistorial(aveId)
      setHistorial(response.data)
    } catch (err: any) {
      setError("Error al cargar el historial clínico")
      console.error("Error fetching historial:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && aveId) {
      fetchHistorial()
    }
  }, [isOpen, aveId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getEstadoColor = (fechaFin?: string) => {
    if (!fechaFin) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getEstadoTexto = (fechaFin?: string) => {
    return fechaFin ? "Completado" : "En tratamiento"
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-4xl">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="modal-icon bg-blue-100">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h2 className="modal-title">Historial Clínico</h2>
              <p className="text-sm text-gray-600">
                Ave #{aveInfo.id_anillo} - {aveInfo.raza} ({aveInfo.color_anillo})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            ✕
          </button>
        </div>

        <div className="modal-body max-h-96 overflow-y-auto">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando historial...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {historial && (
            <div className="space-y-6">
              {/* Estado del ave */}
              {historial.esta_fallecida && historial.ave_fallecida && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-600 text-lg">💀</span>
                    <h3 className="font-semibold text-red-800">Ave Fallecida</h3>
                  </div>
                  <p className="text-red-700">
                    <strong>Fecha:</strong> {formatDate(historial.ave_fallecida.fecha)}
                  </p>
                  <p className="text-red-700">
                    <strong>Motivo:</strong> {historial.ave_fallecida.motivo}
                  </p>
                </div>
              )}

              {/* Historial clínico */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>📋</span>
                  Registros Clínicos ({historial.historial_clinico.length})
                </h3>

                {historial.historial_clinico.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">🏥</span>
                    <p>No hay registros clínicos para esta ave</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historial.historial_clinico.map((registro, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🩺</span>
                            <span className="font-medium text-gray-800">Tratamiento #{index + 1}</span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                              registro.fecha_fin,
                            )}`}
                          >
                            {getEstadoTexto(registro.fecha_fin)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Fecha de inicio:</p>
                            <p className="font-medium">{formatDate(registro.fecha_inicio)}</p>
                          </div>
                          {registro.fecha_fin && (
                            <div>
                              <p className="text-sm text-gray-600">Fecha de fin:</p>
                              <p className="font-medium">{formatDate(registro.fecha_fin)}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-600">Jaula:</p>
                            <p className="font-medium">
                              {registro.jaula?.descripcion || `Jaula #${registro.id_jaula}`}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Descripción del tratamiento:</p>
                          <p className="text-gray-800 bg-gray-50 p-3 rounded border">{registro.descripcion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalHistorialClinico

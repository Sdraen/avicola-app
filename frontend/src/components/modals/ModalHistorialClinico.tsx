"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Swal from "sweetalert2"
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

  useEffect(() => {
    if (isOpen && aveId) {
      fetchHistorial()
    }
  }, [isOpen, aveId])

  const fetchHistorial = async () => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getEstadoColor = (fechaFin?: string) => {
    return fechaFin ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  const getEstadoTexto = (fechaFin?: string) => {
    return fechaFin ? "Completado" : "En tratamiento"
  }

  const handleEliminarRegistro = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar tratamiento?",
      text: "Este tratamiento clínico será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    })

    if (result.isConfirmed) {
      try {
        await aveClinicaAPI.delete(aveId)
        await fetchHistorial()
        Swal.fire("Eliminado", "El tratamiento fue eliminado correctamente.", "success")
      } catch (error: any) {
        Swal.fire("Error", error.message || "No se pudo eliminar el tratamiento.", "error")
      }
    }
  }

  const handleEditarRegistro = async () => {
    const tratamiento = historial?.historial_clinico[0]
    if (!tratamiento) return

    const { value: formValues } = await Swal.fire({
      title: "Editar tratamiento clínico",
      html: `
        <label>Fecha inicio</label><input id="fecha_inicio" type="date" class="swal2-input" value="${tratamiento.fecha_inicio.slice(0, 10)}">
        <label>Fecha fin</label><input id="fecha_fin" type="date" class="swal2-input" value="${tratamiento.fecha_fin?.slice(0, 10) || ""}">
        <label>Descripción</label><textarea id="descripcion" class="swal2-textarea">${tratamiento.descripcion}</textarea>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const fecha_inicio = (document.getElementById("fecha_inicio") as HTMLInputElement).value
        const fecha_fin = (document.getElementById("fecha_fin") as HTMLInputElement).value
        const descripcion = (document.getElementById("descripcion") as HTMLTextAreaElement).value
        return { fecha_inicio, fecha_fin: fecha_fin || null, descripcion }
      },
      showCancelButton: true,
      confirmButtonText: "Actualizar",
    })

    if (formValues) {
      try {
        await aveClinicaAPI.update(aveId, formValues)
        await fetchHistorial()
        Swal.fire("Actualizado", "Tratamiento clínico actualizado correctamente.", "success")
      } catch (error: any) {
        Swal.fire("Error", error.message || "No se pudo actualizar el tratamiento.", "error")
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl text-white">🏥</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Historial Clínico</h2>
                  <p className="text-sm text-blue-100">
                    Ave #{aveInfo.id_anillo} - {aveInfo.raza} ({aveInfo.color_anillo})
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
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

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>📋</span>
                    Registros Clínicos ({historial.historial_clinico.length})
                  </h3>

                  {historial.historial_clinico.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">📭</span>
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
                                registro.fecha_fin
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

                          {index === 0 && (
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                onClick={handleEditarRegistro}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={handleEliminarRegistro}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                🗑 Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalHistorialClinico

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { aveClinicaAPI, jaulasAPI } from "../../services/api"
import type { Jaula } from "../../types"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../../utils/sweetAlert"

interface ModalRegistroClinicoProps {
  isOpen: boolean
  aveId: number
  aveInfo: {
    id_anillo: string
    raza: string
    color_anillo: string
    id_jaula: number
  }
  onClose: () => void
  onSuccess: () => void
}

const ModalRegistroClinico: React.FC<ModalRegistroClinicoProps> = ({ isOpen, aveId, aveInfo, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id_jaula: aveInfo.id_jaula || 0,
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    descripcion: "",
  })
  const [jaulas, setJaulas] = useState<Jaula[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchJaulas()
      setFormData({
        id_jaula: aveInfo.id_jaula || 0,
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: "",
        descripcion: "",
      })
      setError("")
    }
  }, [isOpen, aveInfo])

  const fetchJaulas = async () => {
    try {
      const response = await jaulasAPI.getAll()
      setJaulas(response.data)
    } catch (err: any) {
      console.error("Error fetching jaulas:", err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      showLoadingAlert("Registrando tratamiento...", "Por favor espere")

      const dataToSend = {
        id_ave: aveId,
        id_jaula: formData.id_jaula,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || undefined,
        descripcion: formData.descripcion,
      }

      await aveClinicaAPI.create(dataToSend)

      closeLoadingAlert()
      await showSuccessAlert("¡Tratamiento registrado!", "El registro clínico ha sido creado correctamente")

      onSuccess()
      onClose()
    } catch (err: any) {
      closeLoadingAlert()
      const errorMessage = err.response?.data?.error || "Error al registrar el tratamiento"
      setError(errorMessage)
      await showErrorAlert("Error al registrar", errorMessage)
    } finally {
      setLoading(false)
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
        <div className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Encabezado verde */}
          <div className="bg-green-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl text-white">🩺</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Nuevo Registro Clínico</h2>
                  <p className="text-sm text-green-100">
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

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="id_jaula" className="block text-sm font-medium text-gray-700 mb-1">
                    🏠 Jaula
                  </label>
                  <select
                    id="id_jaula"
                    name="id_jaula"
                    value={formData.id_jaula}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Seleccionar jaula</option>
                    {jaulas.map((jaula) => (
                      <option key={jaula.id_jaula} value={jaula.id_jaula}>
                        {jaula.descripcion || `Jaula #${jaula.id_jaula}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-1">
                    📅 Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 mb-1">
                    🏁 Fecha de Fin (opcional)
                  </label>
                  <input
                    type="date"
                    id="fecha_fin"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    min={formData.fecha_inicio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  📝 Descripción del tratamiento
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe el tratamiento, medicamentos, observaciones..."
                  required
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 resize-none"
                />
                <p className="text-right text-xs text-gray-500 mt-1">{formData.descripcion.length}/500</p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrar Tratamiento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModalRegistroClinico

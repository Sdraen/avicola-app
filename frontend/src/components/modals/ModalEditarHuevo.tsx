"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { huevosAPI, jaulasAPI } from "../../services/api"
import type { Huevo, Jaula } from "../../types"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../../utils/sweetAlert"

interface ModalEditarHuevoProps {
  isOpen: boolean
  huevoId: number
  onClose: () => void
  onUpdate: () => void
}

const ModalEditarHuevo: React.FC<ModalEditarHuevoProps> = ({ isOpen, huevoId, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<Huevo>>({
    id_jaula: null,
    cantidad_total: 0,
    huevos_cafe_chico: 0,
    huevos_cafe_mediano: 0,
    huevos_cafe_grande: 0,
    huevos_cafe_jumbo: 0,
    huevos_blanco_chico: 0,
    huevos_blanco_mediano: 0,
    huevos_blanco_grande: 0,
    huevos_blanco_jumbo: 0,
    observaciones: "",
  })
  const [jaulas, setJaulas] = useState<Jaula[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && huevoId) {
      fetchData()
    }
  }, [isOpen, huevoId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [huevoResponse, jaulasResponse] = await Promise.all([huevosAPI.getById(huevoId), jaulasAPI.getAll()])

      setFormData(huevoResponse.data)
      setJaulas(jaulasResponse.data)
    } catch (error) {
      await showErrorAlert("Error", "No se pudieron cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "id_jaula" ? (value ? Number(value) : null) : name === "observaciones" ? value : Number(value) || 0,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      showLoadingAlert("Actualizando registro...", "Por favor espere")

      await huevosAPI.update(huevoId, formData)

      closeLoadingAlert()
      await showSuccessAlert("¡Registro actualizado!", "Los datos se han guardado correctamente")

      onUpdate()
      onClose()
    } catch (error: any) {
      closeLoadingAlert()
      await showErrorAlert("Error al actualizar", error?.response?.data?.message || "No se pudo actualizar el registro")
    }
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl">🥚</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Editar Registro de Huevos</h3>
                  <p className="text-sm text-yellow-100">ID: #{huevoId}</p>
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                <span className="text-gray-600">Cargando datos...</span>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Jaula y Cantidad Total */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <span className="text-lg">🏠</span>
                      <span>Jaula</span>
                    </label>
                    <select
                      name="id_jaula"
                      value={formData.id_jaula || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Seleccionar jaula</option>
                      {jaulas.map((jaula) => (
                        <option key={jaula.id_jaula} value={jaula.id_jaula}>
                          {jaula.numero_jaula || "Jaula"} - {jaula.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <span className="text-lg">📊</span>
                      <span>Cantidad Total</span>
                    </label>
                    <input
                      type="number"
                      name="cantidad_total"
                      value={formData.cantidad_total || 0}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Huevos Café */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="flex items-center space-x-2 text-sm font-semibold text-amber-800 mb-3">
                    <span className="text-lg">🟤</span>
                    <span>Huevos Café</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {["chico", "mediano", "grande", "jumbo"].map((size) => (
                      <div key={size}>
                        <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{size}</label>
                        <input
                          type="number"
                          name={`huevos_cafe_${size}`}
                          value={formData[`huevos_cafe_${size}` as keyof typeof formData] || 0}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Huevos Blancos */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="flex items-center space-x-2 text-sm font-semibold text-gray-800 mb-3">
                    <span className="text-lg">⚪</span>
                    <span>Huevos Blancos</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {["chico", "mediano", "grande", "jumbo"].map((size) => (
                      <div key={size}>
                        <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{size}</label>
                        <input
                          type="number"
                          name={`huevos_blanco_${size}`}
                          value={formData[`huevos_blanco_${size}` as keyof typeof formData] || 0}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-lg">📝</span>
                    <span>Observaciones</span>
                  </label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones || ""}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Observaciones adicionales..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-yellow-500 border border-transparent rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <span>💾</span>
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalEditarHuevo

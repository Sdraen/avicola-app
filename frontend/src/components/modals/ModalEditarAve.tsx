"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { avesAPI, jaulasAPI } from "../../services/api"
import type { Jaula } from "../../types"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../../utils/sweetAlert"

interface ModalEditarAveProps {
  isOpen: boolean
  aveId: number
  onClose: () => void
  onUpdate: () => void
}

interface FormData {
  id_anillo: string
  color_anillo: string
  edad: string
  raza: string
  estado_puesta: "activa" | "inactiva" | "en_desarrollo"
  id_jaula: number | null
}

const ModalEditarAve: React.FC<ModalEditarAveProps> = ({ isOpen, aveId, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<FormData>({
    id_anillo: "",
    color_anillo: "",
    edad: "",
    raza: "",
    estado_puesta: "activa",
    id_jaula: null,
  })
  const [jaulas, setJaulas] = useState<Jaula[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar datos del ave y jaulas
  useEffect(() => {
    if (isOpen && aveId) {
      fetchData()
    }
  }, [isOpen, aveId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [aveResponse, jaulasResponse] = await Promise.all([avesAPI.getById(aveId), jaulasAPI.getAll()])

      const aveData = aveResponse.data
      setFormData({
        id_anillo: aveData.id_anillo || "",
        color_anillo: aveData.color_anillo || "",
        edad: aveData.edad || "",
        raza: aveData.raza || "",
        estado_puesta: aveData.estado_puesta || "activa",
        id_jaula: aveData.id_jaula || null,
      })
      setJaulas(jaulasResponse.data)
    } catch (error) {
      await showErrorAlert("Error", "No se pudieron cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "id_jaula" ? (value ? Number(value) : null) : value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.id_anillo?.trim()) {
      newErrors.id_anillo = "El ID del anillo es requerido"
    } else if (formData.id_anillo.length > 10) {
      newErrors.id_anillo = "El ID del anillo no puede tener más de 10 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      showLoadingAlert("Actualizando ave...", "Por favor espere")

      await avesAPI.update(aveId, formData)

      closeLoadingAlert()
      await showSuccessAlert("¡Ave actualizada!", "Los datos se han guardado correctamente")

      onUpdate()
      onClose()
    } catch (error: any) {
      closeLoadingAlert()
      await showErrorAlert("Error al actualizar", error?.response?.data?.message || "No se pudo actualizar el ave")
    }
  }

  // Cerrar modal con ESC
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
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose()
          }
        }}
        aria-label="Cerrar modal"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl" role="img" aria-label="Editar">
                    ✏️
                  </span>
                </div>
                <div>
                  <h3 id="modal-title" className="text-lg font-semibold text-white">
                    Editar Ave
                  </h3>
                  <p className="text-sm text-blue-100">ID: #{aveId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors"
                aria-label="Cerrar modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-gray-600">Cargando datos...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* ID Anillo */}
                <div>
                  <label
                    htmlFor="id_anillo"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="text-lg" role="img" aria-label="Etiqueta">
                      🏷️
                    </span>
                    <span>ID Anillo *</span>
                  </label>
                  <input
                    id="id_anillo"
                    type="text"
                    name="id_anillo"
                    value={formData.id_anillo}
                    onChange={handleInputChange}
                    placeholder="Ej: A001"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.id_anillo ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    maxLength={10}
                    required
                  />
                  {errors.id_anillo && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <span role="img" aria-label="Advertencia">
                        ⚠️
                      </span>
                      <span>{errors.id_anillo}</span>
                    </p>
                  )}
                </div>

                {/* Color Anillo */}
                <div>
                  <label
                    htmlFor="color_anillo"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="text-lg" role="img" aria-label="Color">
                      🎨
                    </span>
                    <span>Color Anillo</span>
                  </label>
                  <input
                    id="color_anillo"
                    type="text"
                    name="color_anillo"
                    value={formData.color_anillo}
                    onChange={handleInputChange}
                    placeholder="Ej: Rojo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Edad y Raza en fila */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edad"
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"
                    >
                      <span className="text-lg" role="img" aria-label="Calendario">
                        📅
                      </span>
                      <span>Edad</span>
                    </label>
                    <input
                      id="edad"
                      type="text"
                      name="edad"
                      value={formData.edad}
                      onChange={handleInputChange}
                      placeholder="6 meses"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="raza"
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"
                    >
                      <span className="text-lg" role="img" aria-label="ADN">
                        🧬
                      </span>
                      <span>Raza</span>
                    </label>
                    <input
                      id="raza"
                      type="text"
                      name="raza"
                      value={formData.raza}
                      onChange={handleInputChange}
                      placeholder="Rhode Island"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Estado de Puesta */}
                <div>
                  <label
                    htmlFor="estado_puesta"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="text-lg" role="img" aria-label="Huevo">
                      🥚
                    </span>
                    <span>Estado de Puesta</span>
                  </label>
                  <select
                    id="estado_puesta"
                    name="estado_puesta"
                    value={formData.estado_puesta}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="activa">🥚 Activa</option>
                    <option value="inactiva">❌ Inactiva</option>
                    <option value="en_desarrollo">🐣 En desarrollo</option>
                  </select>
                </div>

                {/* Jaula */}
                <div>
                  <label
                    htmlFor="id_jaula"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="text-lg" role="img" aria-label="Casa">
                      🏠
                    </span>
                    <span>Jaula</span>
                  </label>
                  <select
                    id="id_jaula"
                    name="id_jaula"
                    value={formData.id_jaula || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Seleccionar jaula</option>
                    {jaulas.map((jaula) => (
                      <option key={jaula.id_jaula} value={jaula.id_jaula}>
                        {jaula.numero_jaula || "Jaula"} - {jaula.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </form>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <span role="img" aria-label="Guardar">
                    💾
                  </span>
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

export default ModalEditarAve

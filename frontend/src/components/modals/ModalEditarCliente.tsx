"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { clientesAPI } from "../../services/api"
import { showSuccessAlert, showErrorAlert } from "../../utils/sweetAlert"

interface ModalEditarClienteProps {
  isOpen: boolean
  onClose: () => void
  clienteId: number
  onSuccess: () => void
}

interface FormData {
  nombre: string
  direccion: string
  telefono: string
  tipo_cliente: string
}

const ModalEditarCliente: React.FC<ModalEditarClienteProps> = ({ isOpen, onClose, clienteId, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    direccion: "",
    telefono: "",
    tipo_cliente: "",
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Cargar datos del cliente
  useEffect(() => {
    if (isOpen && clienteId) {
      fetchClienteData()
    }
  }, [isOpen, clienteId])

  // Manejar ESC para cerrar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const fetchClienteData = async () => {
    try {
      setLoadingData(true)
      const response = await clientesAPI.getById(clienteId)
      const cliente = response.data

      setFormData({
        nombre: cliente.nombre || "",
        direccion: cliente.direccion || "",
        telefono: cliente.telefono?.toString() || "",
        tipo_cliente: cliente.tipo_cliente || "",
      })
    } catch (error) {
      console.error("Error al cargar cliente:", error)
      showErrorAlert("Error", "No se pudieron cargar los datos del cliente")
      onClose()
    } finally {
      setLoadingData(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = "El nombre no puede tener más de 100 caracteres"
    }

    if (formData.direccion && formData.direccion.length > 255) {
      newErrors.direccion = "La dirección no puede tener más de 255 caracteres"
    }

    if (formData.telefono && (!/^\d+$/.test(formData.telefono) || formData.telefono.length > 15)) {
      newErrors.telefono = "El teléfono debe contener solo números y máximo 15 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const updateData = {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim() || null,
        telefono: formData.telefono ? Number.parseInt(formData.telefono) : null,
        tipo_cliente: formData.tipo_cliente || null,
      }

      await clientesAPI.update(clienteId, updateData)
      await showSuccessAlert("¡Cliente actualizado!", "Los datos se han guardado correctamente")
      onSuccess()
    } catch (error: any) {
      console.error("Error al actualizar cliente:", error)
      const errorMessage = error.response?.data?.error || "Error al actualizar el cliente"
      showErrorAlert("Error al guardar", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h2 id="modal-title" className="text-xl font-bold text-white">
                  Editar Cliente
                </h2>
                <p className="text-purple-100 text-sm">ID: {clienteId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-600">Cargando datos del cliente...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2" aria-hidden="true">
                    👤
                  </span>
                  Nombre *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.nombre ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Nombre completo del cliente"
                  required
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.nombre}
                  </p>
                )}
              </div>

              {/* Dirección */}
              <div>
                <label htmlFor="direccion" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2" aria-hidden="true">
                    📍
                  </span>
                  Dirección
                </label>
                <textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none ${
                    errors.direccion ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Dirección completa del cliente"
                />
                {errors.direccion && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.direccion}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2" aria-hidden="true">
                    📞
                  </span>
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.telefono ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Número de teléfono"
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.telefono}
                  </p>
                )}
              </div>

              {/* Tipo de Cliente */}
              <div>
                <label htmlFor="tipo_cliente" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2" aria-hidden="true">
                    🏷️
                  </span>
                  Tipo de Cliente
                </label>
                <select
                  id="tipo_cliente"
                  name="tipo_cliente"
                  value={formData.tipo_cliente}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="mayorista">🏢 Mayorista</option>
                  <option value="minorista">🛒 Minorista</option>
                  <option value="distribuidor">🚚 Distribuidor</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Guardar Cambios
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalEditarCliente

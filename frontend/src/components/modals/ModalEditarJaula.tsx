"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { jaulasAPI } from "../../services/api"
import type { Jaula } from "../../types"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../../utils/sweetAlert"

interface ModalEditarJaulaProps {
  isOpen: boolean
  onClose: () => void
  jaula: Jaula | null
  onJaulaUpdated: () => void
}

const ModalEditarJaula: React.FC<ModalEditarJaulaProps> = ({ isOpen, onClose, jaula, onJaulaUpdated }) => {
  const [form, setForm] = useState({
    codigo_jaula: "",
    descripcion: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (jaula) {
      setForm({
        codigo_jaula: jaula.codigo_jaula || "",
        descripcion: jaula.descripcion || "",
      })
    }
  }, [jaula])

  const validateForm = (): boolean => {
    const regex = /^\d{1,6}$/
    const valido = regex.test(form.codigo_jaula) && Number(form.codigo_jaula) >= 1
    if (!valido) {
      setError("El código debe tener entre 1 y 6 dígitos y ser mayor o igual a 1")
    } else {
      setError("")
    }
    return valido
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === "codigo_jaula") validateForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jaula) return

    if (!validateForm()) return

    try {
      setLoading(true)
      showLoadingAlert("Actualizando jaula...", "Por favor espere")

      await jaulasAPI.update(jaula.id_jaula, form)

      closeLoadingAlert()
      await showSuccessAlert("¡Actualizada!", "La jaula ha sido actualizada correctamente.")
      onJaulaUpdated()
      onClose()
    } catch (err: any) {
      closeLoadingAlert()
      await showErrorAlert("Error", err?.response?.data?.error || "Error al actualizar la jaula")
    } finally {
      setLoading(false)
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
  }, [isOpen])

  if (!isOpen || !jaula) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        role="button"
        tabIndex={0}
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
                  <span className="text-xl" role="img">🏠</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Editar Jaula</h3>
                  <p className="text-sm text-blue-100">ID: {jaula.id_jaula}</p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Código */}
            <div>
              <label htmlFor="codigo_jaula" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span className="text-lg" role="img">🔢</span>
                <span>Código de Jaula *</span>
              </label>
              <input
                type="text"
                id="codigo_jaula"
                name="codigo_jaula"
                value={form.codigo_jaula}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  error ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1">Entre 1 y 6 dígitos, mayor o igual a 1</p>
              {error && <p className="text-sm text-red-600 mt-1">⚠️ {error}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span className="text-lg" role="img">📝</span>
                <span>Descripción</span>
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                maxLength={255}
              />
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span role="img">💾</span>
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalEditarJaula

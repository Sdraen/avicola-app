"use client"

import { useEffect, useState } from "react"
import api from "../../services/api"
import {
  showLoadingAlert,
  closeLoadingAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../utils/sweetAlert"

interface Props {
  id: number
  onClose: () => void
  onUpdated: () => void
}

const ModalEditarIncubacion: React.FC<Props> = ({ id, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    lote: "",
    temperatura: "",
    observaciones: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/incubacion/${id}`)
      setForm({
        lote: res.data.lote || "",
        temperatura: res.data.temperatura?.toString() || "",
        observaciones: res.data.observaciones || "",
      })
    } catch (err) {
      await showErrorAlert("Error", "No se pudieron cargar los datos de la incubación")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.lote.trim()) newErrors.lote = "El lote es requerido"
    if (!form.temperatura || isNaN(Number(form.temperatura))) {
      newErrors.temperatura = "Temperatura inválida"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      showLoadingAlert("Actualizando incubación...", "Por favor espere")
      await api.put(`/incubacion/${id}`, {
        ...form,
        temperatura: parseFloat(form.temperatura),
      })
      closeLoadingAlert()
      await showSuccessAlert("¡Incubación actualizada!", "Los datos se han guardado correctamente")
      onUpdated()
      onClose()
    } catch (err) {
      closeLoadingAlert()
      await showErrorAlert("Error", "No se pudo actualizar la incubación")
    }
  }

  if (!id) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        aria-label="Cerrar modal"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl">🐣</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Editar Incubación</h3>
                  <p className="text-sm text-orange-100">ID: #{id}</p>
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
            {/* Lote */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span className="text-lg">📄</span>
                <span>Lote</span>
              </label>
              <input
                type="text"
                name="lote"
                value={form.lote}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.lote ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Ej: INC-001"
              />
              {errors.lote && <p className="text-sm text-red-600 mt-1">⚠️ {errors.lote}</p>}
            </div>

            {/* Temperatura */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span className="text-lg">🌡️</span>
                <span>Temperatura</span>
              </label>
              <input
                type="number"
                name="temperatura"
                value={form.temperatura}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.temperatura ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                step="0.1"
                min="35"
                max="40"
              />
              {errors.temperatura && <p className="text-sm text-red-600 mt-1">⚠️ {errors.temperatura}</p>}
            </div>

            {/* Observaciones */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span className="text-lg">📝</span>
                <span>Observaciones</span>
              </label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Notas adicionales..."
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <span>💾</span>
                <span>{loading ? "Guardando..." : "Guardar Cambios"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModalEditarIncubacion

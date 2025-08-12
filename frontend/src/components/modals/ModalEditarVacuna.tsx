"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { vacunasAPI } from "../../services/api"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../../utils/sweetAlert"

interface ModalEditarVacunaProps {
  isOpen: boolean
  vacunaId: number
  onClose: () => void
  onUpdate: () => void
}

interface FormData {
  nombre: string
  dosis: string
  fecha_administracion: string // YYYY-MM-DD (obligatoria en backend)
}

const ModalEditarVacuna: React.FC<ModalEditarVacunaProps> = ({ isOpen, vacunaId, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<FormData>({ nombre: "", dosis: "", fecha_administracion: "" })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && vacunaId) fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, vacunaId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data } = await vacunasAPI.getById(vacunaId)
      setFormData({
        nombre: data?.nombre ?? "",
        dosis: data?.dosis ?? "",
        fecha_administracion: data?.fecha_administracion ?? "",
      })
    } catch (error) {
      await showErrorAlert("Error", "No se pudieron cargar los datos de la vacuna")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const today = new Date().toISOString().split("T")[0]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const nombre = formData.nombre.trim()
    const dosis = formData.dosis.trim()
    const fecha = formData.fecha_administracion

    if (!nombre) newErrors.nombre = "El nombre es requerido"
    else if (nombre.length > 100) newErrors.nombre = "Máximo 100 caracteres"

    if (!dosis) newErrors.dosis = "La dosis es requerida"
    else if (dosis.length > 100) newErrors.dosis = "Máximo 100 caracteres"

    if (!fecha) newErrors.fecha_administracion = "La fecha de administración es obligatoria"
    else {
      const yyyyMmDd = /^\d{4}-\d{2}-\d{2}$/.test(fecha)
      if (!yyyyMmDd) newErrors.fecha_administracion = "Formato válido: YYYY-MM-DD"
      else if (new Date(fecha) > new Date(today)) newErrors.fecha_administracion = "La fecha no puede ser futura"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validateForm()) return
    try {
      showLoadingAlert("Actualizando vacuna...", "Por favor espere")
      await vacunasAPI.update(vacunaId, {
        nombre: formData.nombre.trim(),
        dosis: formData.dosis.trim(),
        fecha_administracion: formData.fecha_administracion,
      })
      closeLoadingAlert()
      await showSuccessAlert("¡Vacuna actualizada!", "Los datos se han guardado correctamente.")
      onUpdate()
      onClose()
    } catch (error: any) {
      closeLoadingAlert()
      const msg =
        error?.response?.status === 409
          ? "Ya existe otra vacuna con ese nombre."
          : error?.response?.data?.error || "No se pudo actualizar la vacuna"
      await showErrorAlert("Error al actualizar", msg)
    }
  }

  // ESC para cerrar
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose()
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
                    Editar Vacuna
                  </h3>
                  <p className="text-sm text-blue-100">ID: #{vacunaId}</p>
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

          {/* Loading */}
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
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-lg" role="img" aria-label="Etiqueta">
                      🏷️
                    </span>
                    <span>Nombre *</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Bronquitis Infecciosa"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.nombre ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    maxLength={100}
                    required
                    autoFocus
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">⚠️ {errors.nombre}</p>}
                </div>

                {/* Dosis */}
                <div>
                  <label htmlFor="dosis" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-lg" role="img" aria-label="Regla">
                      📏
                    </span>
                    <span>Dosis *</span>
                  </label>
                  <input
                    id="dosis"
                    name="dosis"
                    type="text"
                    value={formData.dosis}
                    onChange={handleInputChange}
                    placeholder="Ej: 0.5 ml por ave"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.dosis ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    maxLength={100}
                    required
                  />
                  {errors.dosis && <p className="mt-1 text-sm text-red-600">⚠️ {errors.dosis}</p>}
                </div>

                {/* Fecha de administración */}
                <div>
                  <label
                    htmlFor="fecha_administracion"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="text-lg" role="img" aria-label="Calendario">
                      📅
                    </span>
                    <span>Fecha de administración *</span>
                  </label>
                  <input
                    id="fecha_administracion"
                    name="fecha_administracion"
                    type="date"
                    value={formData.fecha_administracion}
                    onChange={handleInputChange}
                    max={today}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.fecha_administracion ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.fecha_administracion && (
                    <p className="mt-1 text-sm text-red-600">⚠️ {errors.fecha_administracion}</p>
                  )}
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
                  onClick={() => handleSubmit()}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  💾 Guardar Cambios
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalEditarVacuna

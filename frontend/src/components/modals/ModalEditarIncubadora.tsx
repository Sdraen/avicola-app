"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { incubadorasAPI } from "../../services/api"
import type { Incubadora } from "../../types"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../../utils/sweetAlert"

type Props = {
  /** Mostrar/ocultar modal */
  open: boolean
  /** Incubadora a editar */
  incubadora: Incubadora | null
  /** Cerrar modal */
  onClose: () => void
  /** Callback al guardar */
  onSaved?: (updated: Incubadora) => void
  /** Callback al eliminar */
  onDeleted?: (id: number) => void
}

type FormData = {
  nombre: string
  capacidad: string // lo guardamos como string para el input, casteamos en submit
  estado: "activa" | "inactiva"
}

const ModalEditarIncubadora: React.FC<Props> = ({ open, incubadora, onClose, onSaved, onDeleted }) => {
  const [form, setForm] = useState<FormData>({ nombre: "", capacidad: "", estado: "activa" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Cargar valores iniciales cuando abre o cambia el ID
  useEffect(() => {
    if (open && incubadora) {
      setForm({
        nombre: incubadora.nombre || "",
        capacidad: incubadora.capacidad != null ? String(incubadora.capacidad) : "",
        estado: (incubadora.estado as "activa" | "inactiva") || "activa",
      })
      setErrors({})
    }
  }, [open, incubadora?.id_incubadora])

  // Cerrar con ESC + bloquear scroll como en ModalEditarAve
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "unset"
    }
  }, [open, onClose])

  if (!open || !incubadora) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.nombre.trim()) next.nombre = "El nombre es requerido"
    if (form.capacidad === "" || Number.isNaN(Number(form.capacidad)) || Number(form.capacidad) <= 0) {
      next.capacidad = "Capacidad inválida"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      showLoadingAlert("Actualizando incubadora...", "Por favor espere")

      const payload = {
        nombre: form.nombre.trim(),
        capacidad: Number(form.capacidad),
        estado: form.estado,
      }

      const { data } = await incubadorasAPI.update(incubadora.id_incubadora, payload)
      closeLoadingAlert()
      await showSuccessAlert("¡Cambios guardados!", "La incubadora se actualizó correctamente")
      onSaved?.(data)
      onClose()
    } catch (err: any) {
      closeLoadingAlert()
      await showErrorAlert(
        "Error al actualizar",
        err?.response?.data?.error || err?.message || "No se pudo actualizar la incubadora",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const ok = await showDeleteConfirmation(
      "¿Eliminar incubadora?",
      `¿Seguro deseas eliminar "${form.nombre}"? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
    )
    if (!ok) return

    try {
      setLoading(true)
      showLoadingAlert("Eliminando incubadora...", "Por favor espere")
      await incubadorasAPI.delete(incubadora.id_incubadora)
      closeLoadingAlert()
      await showSuccessAlert("¡Eliminada!", "La incubadora se eliminó correctamente")
      onDeleted?.(incubadora.id_incubadora)
      onClose()
    } catch (err: any) {
      closeLoadingAlert()
      await showErrorAlert(
        "Error al eliminar",
        err?.response?.data?.error ||
          "No se pudo eliminar la incubadora. Verifica que no esté en uso por alguna incubación.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-incu-title">
      {/* Backdrop (clic para cerrar) */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Cerrar modal"
      />

      {/* Contenido */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header con gradiente (estilo ModalEditarAve) */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl" role="img" aria-label="Incubadora">
                    🧰
                  </span>
                </div>
                <div>
                  <h3 id="modal-incu-title" className="text-lg font-semibold text-white">
                    Editar Incubadora
                  </h3>
                  <p className="text-sm text-blue-100">nombre: {incubadora.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => !loading && onClose()}
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
                <span className="text-gray-600">Procesando...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nombre */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2" htmlFor="nombre">
                    <span className="text-lg" role="img" aria-label="Etiqueta">
                      🏷️
                    </span>
                    <span>Nombre *</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Incubadora #1"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.nombre ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    maxLength={80}
                    required
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">⚠️ {errors.nombre}</p>}
                </div>

                {/* Capacidad */}
                <div>
                  <label
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"
                    htmlFor="capacidad"
                  >
                    <span className="text-lg" role="img" aria-label="Huevos">
                      🥚
                    </span>
                    <span>Capacidad (huevos) *</span>
                  </label>
                  <input
                    id="capacidad"
                    name="capacidad"
                    type="number"
                    min={1}
                    value={form.capacidad}
                    onChange={handleChange}
                    placeholder="Ej: 48"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.capacidad ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.capacidad && <p className="mt-1 text-sm text-red-600">⚠️ {errors.capacidad}</p>}
                </div>

                {/* Estado */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2" htmlFor="estado">
                    <span className="text-lg" role="img" aria-label="Estado">
                      ✅
                    </span>
                    <span>Estado</span>
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                  </select>
                </div>
              </form>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between">
                <div className="flex gap-2">
                  {onDeleted && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => !loading && onClose()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <span role="img" aria-label="Guardar">💾</span>
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalEditarIncubadora

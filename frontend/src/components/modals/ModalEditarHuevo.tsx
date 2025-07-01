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
  const [huevo, setHuevo] = useState<Huevo | null>(null)
  const [jaulas, setJaulas] = useState<Jaula[]>([])
  const [form, setForm] = useState({
    id_jaula: "",
    fecha_recoleccion: "",
    cantidad_total: "",
    huevos_cafe_chico: "",
    huevos_cafe_mediano: "",
    huevos_cafe_grande: "",
    huevos_cafe_jumbo: "",
    huevos_blanco_chico: "",
    huevos_blanco_mediano: "",
    huevos_blanco_grande: "",
    huevos_blanco_jumbo: "",
    observaciones: "",
  })
  const [loading, setLoading] = useState(false)

  // Función helper para formatear fecha para input date
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return ""

    try {
      // Si la fecha ya está en formato YYYY-MM-DD, usarla directamente
      if (dateString.includes("T")) {
        return dateString.split("T")[0]
      }

      // Si es solo la fecha, asegurar formato correcto
      return dateString
    } catch (error) {
      console.error("Error formatting date:", error)
      return ""
    }
  }

  // Función helper para convertir valores a string de forma segura
  const safeToString = (value: any): string => {
    if (value === null || value === undefined) return ""
    return String(value)
  }

  useEffect(() => {
    if (isOpen && huevoId) {
      fetchHuevoData()
      fetchJaulas()
    }
  }, [isOpen, huevoId])

  const fetchHuevoData = async () => {
    try {
      setLoading(true)
      console.log("🔍 Fetching huevo data for ID:", huevoId)

      const response = await huevosAPI.getById(huevoId)
      console.log("📥 Huevo data received:", response.data)

      const huevoData = response.data

      if (!huevoData) {
        throw new Error("No se encontraron datos del huevo")
      }

      setHuevo(huevoData)

      // Usar valores por defecto si las propiedades no existen
      setForm({
        id_jaula: safeToString(huevoData.id_jaula),
        fecha_recoleccion: formatDateForInput(huevoData.fecha_recoleccion),
        cantidad_total: safeToString(huevoData.cantidad_total || 0),
        huevos_cafe_chico: safeToString(huevoData.huevos_cafe_chico || 0),
        huevos_cafe_mediano: safeToString(huevoData.huevos_cafe_mediano || 0),
        huevos_cafe_grande: safeToString(huevoData.huevos_cafe_grande || 0),
        huevos_cafe_jumbo: safeToString(huevoData.huevos_cafe_jumbo || 0),
        huevos_blanco_chico: safeToString(huevoData.huevos_blanco_chico || 0),
        huevos_blanco_mediano: safeToString(huevoData.huevos_blanco_mediano || 0),
        huevos_blanco_grande: safeToString(huevoData.huevos_blanco_grande || 0),
        huevos_blanco_jumbo: safeToString(huevoData.huevos_blanco_jumbo || 0),
        observaciones: safeToString(huevoData.observaciones || ""),
      })

      console.log("✅ Form data set successfully")
    } catch (error: any) {
      console.error("❌ Error fetching huevo:", error)
      await showErrorAlert("Error", error.message || "No se pudo cargar la información del registro")
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const fetchJaulas = async () => {
    try {
      console.log("🏠 Fetching jaulas...")
      const response = await jaulasAPI.getAll()
      console.log("📥 Jaulas received:", response.data)

      // Asegurar que sea un array
      const jaulasData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : []

      setJaulas(jaulasData)
      console.log("✅ Jaulas set successfully:", jaulasData.length)
    } catch (error) {
      console.error("❌ Error fetching jaulas:", error)
      // No cerrar el modal por este error, solo mostrar mensaje
      setJaulas([])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const calculateTotal = () => {
    const total =
      Number(form.huevos_cafe_chico || 0) +
      Number(form.huevos_cafe_mediano || 0) +
      Number(form.huevos_cafe_grande || 0) +
      Number(form.huevos_cafe_jumbo || 0) +
      Number(form.huevos_blanco_chico || 0) +
      Number(form.huevos_blanco_mediano || 0) +
      Number(form.huevos_blanco_grande || 0) +
      Number(form.huevos_blanco_jumbo || 0)

    setForm({ ...form, cantidad_total: total.toString() })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      showLoadingAlert("Actualizando registro...", "Por favor espere")

      const updateData = {
        id_jaula: Number.parseInt(form.id_jaula),
        fecha_recoleccion: form.fecha_recoleccion, // Ya está en formato YYYY-MM-DD
        cantidad_total: Number.parseInt(form.cantidad_total || "0"),
        huevos_cafe_chico: Number.parseInt(form.huevos_cafe_chico || "0"),
        huevos_cafe_mediano: Number.parseInt(form.huevos_cafe_mediano || "0"),
        huevos_cafe_grande: Number.parseInt(form.huevos_cafe_grande || "0"),
        huevos_cafe_jumbo: Number.parseInt(form.huevos_cafe_jumbo || "0"),
        huevos_blanco_chico: Number.parseInt(form.huevos_blanco_chico || "0"),
        huevos_blanco_mediano: Number.parseInt(form.huevos_blanco_mediano || "0"),
        huevos_blanco_grande: Number.parseInt(form.huevos_blanco_grande || "0"),
        huevos_blanco_jumbo: Number.parseInt(form.huevos_blanco_jumbo || "0"),
        observaciones: form.observaciones || "",
      }

      console.log("📅 Actualizando con fecha:", updateData.fecha_recoleccion)
      console.log("📊 Datos a actualizar:", updateData)

      await huevosAPI.update(huevoId, updateData)

      closeLoadingAlert()
      await showSuccessAlert("¡Registro actualizado!", "El registro de huevos ha sido actualizado correctamente")

      onUpdate()
      onClose()
    } catch (error: any) {
      closeLoadingAlert()
      console.error("❌ Error updating huevo:", error)
      await showErrorAlert("Error al actualizar", error.response?.data?.error || "No se pudo actualizar el registro")
    }
  }

  // Función para cerrar modal con escape
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

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl" role="img" aria-label="Huevo">
                    🥚
                  </span>
                </div>
                <div>
                  <h3 id="modal-title" className="text-lg font-semibold text-white">
                    Editar Registro de Huevos
                  </h3>
                  <p className="text-sm text-yellow-100">ID: #{huevoId}</p>
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
                {/* Jaula y Fecha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      value={form.id_jaula}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all bg-white"
                      required
                    >
                      <option value="">Seleccionar jaula</option>
                      {jaulas.map((jaula) => (
                        <option key={jaula.id_jaula} value={jaula.id_jaula}>
                          {jaula.descripcion || `Jaula ${jaula.id_jaula}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="fecha_recoleccion"
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"
                    >
                      <span className="text-lg" role="img" aria-label="Calendario">
                        📅
                      </span>
                      <span>Fecha de Recolección</span>
                    </label>
                    <input
                      id="fecha_recoleccion"
                      type="date"
                      name="fecha_recoleccion"
                      value={form.fecha_recoleccion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      required
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {form.fecha_recoleccion && (
                      <small className="text-gray-500 text-xs mt-1 block">
                        📅 Fecha seleccionada:{" "}
                        {new Date(form.fecha_recoleccion + "T00:00:00").toLocaleDateString("es-ES")}
                      </small>
                    )}
                  </div>
                </div>

                {/* Cantidad Total */}
                <div>
                  <label
                    htmlFor="cantidad_total"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="text-lg" role="img" aria-label="Gráfico">
                      📊
                    </span>
                    <span>Cantidad Total</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="cantidad_total"
                      type="number"
                      name="cantidad_total"
                      value={form.cantidad_total}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      min="0"
                      required
                    />
                    <button
                      type="button"
                      onClick={calculateTotal}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      title="Calcular total automáticamente"
                    >
                      🧮 Calcular
                    </button>
                  </div>
                </div>

                {/* Huevos Café */}
                <fieldset className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <legend className="flex items-center space-x-2 text-sm font-semibold text-amber-800 mb-3 px-2">
                    <span className="text-lg" role="img" aria-label="Café">
                      🟤
                    </span>
                    <span>Huevos Café</span>
                  </legend>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["chico", "mediano", "grande", "jumbo"].map((size) => (
                      <div key={size}>
                        <label
                          htmlFor={`huevos_cafe_${size}`}
                          className="block text-xs font-medium text-gray-600 mb-1 capitalize"
                        >
                          {size}
                        </label>
                        <input
                          id={`huevos_cafe_${size}`}
                          type="number"
                          name={`huevos_cafe_${size}`}
                          value={form[`huevos_cafe_${size}` as keyof typeof form]}
                          onChange={handleChange}
                          min="0"
                          placeholder="0"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* Huevos Blancos */}
                <fieldset className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <legend className="flex items-center space-x-2 text-sm font-semibold text-gray-800 mb-3 px-2">
                    <span className="text-lg" role="img" aria-label="Blanco">
                      ⚪
                    </span>
                    <span>Huevos Blancos</span>
                  </legend>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["chico", "mediano", "grande", "jumbo"].map((size) => (
                      <div key={size}>
                        <label
                          htmlFor={`huevos_blanco_${size}`}
                          className="block text-xs font-medium text-gray-600 mb-1 capitalize"
                        >
                          {size}
                        </label>
                        <input
                          id={`huevos_blanco_${size}`}
                          type="number"
                          name={`huevos_blanco_${size}`}
                          value={form[`huevos_blanco_${size}` as keyof typeof form]}
                          onChange={handleChange}
                          min="0"
                          placeholder="0"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* Observaciones */}
                <div>
                  <label
                    htmlFor="observaciones"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="text-lg" role="img" aria-label="Nota">
                      📝
                    </span>
                    <span>Observaciones</span>
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={form.observaciones}
                    onChange={handleChange}
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

export default ModalEditarHuevo

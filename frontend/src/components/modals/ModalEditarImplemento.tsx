import { useEffect, useState } from "react"
import { Implemento } from "../../types"
import { implementosAPI } from "../../services/api"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../../utils/sweetAlert"

interface Props {
  implemento: Implemento
  onClose: () => void
  onUpdate: () => void
}

export default function ModalEditarImplemento({ implemento, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    cantidad: 0,
    precio_unitario: 0,
    categoria: "",
    estado: "",
    ubicacion: "",
    descripcion: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (implemento) {
      setForm({
        nombre: implemento.nombre || "",
        cantidad: implemento.cantidad || 0,
        precio_unitario: implemento.precio_unitario || 0,
        categoria: implemento.categoria || "",
        estado: implemento.estado || "",
        ubicacion: implemento.ubicacion || "",
        descripcion: implemento.descripcion || "",
      })
    }
  }, [implemento])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === "cantidad" || name === "precio_unitario" ? Number(value) : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
    if (form.cantidad <= 0) newErrors.cantidad = "Cantidad debe ser mayor a 0"
    if (form.precio_unitario <= 0) newErrors.precio_unitario = "Precio unitario inválido"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      showLoadingAlert("Guardando cambios...", "Por favor espera")
      await implementosAPI.update(implemento.id_implemento, form)
      closeLoadingAlert()
      await showSuccessAlert("¡Actualizado!", "El implemento fue editado correctamente")
      onUpdate()
      onClose()
    } catch (err: any) {
      closeLoadingAlert()
      await showErrorAlert("Error", err.response?.data?.error || "No se pudo actualizar el implemento")
    }
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "unset"
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl">🛠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Editar Implemento</h3>
                  <p className="text-sm text-blue-100">ID #{implemento.id_implemento}</p>
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

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.nombre ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.nombre && <p className="text-sm text-red-600 mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Cantidad *</label>
                <input
                  type="number"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.cantidad ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.cantidad && <p className="text-sm text-red-600 mt-1">{errors.cantidad}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Precio Unitario *</label>
                <input
                  type="number"
                  name="precio_unitario"
                  value={form.precio_unitario}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.precio_unitario ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.precio_unitario && (
                  <p className="text-sm text-red-600 mt-1">{errors.precio_unitario}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Categoría</label>
                <input
                  type="text"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Estado</label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Seleccionar</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="malo">Malo</option>
                  <option value="fuera_servicio">Fuera de servicio</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Ubicación</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={form.ubicacion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                name="descripcion"
                rows={3}
                value={form.descripcion}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              💾 Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

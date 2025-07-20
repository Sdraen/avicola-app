"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { implementosAPI } from "../../services/api"
import { showErrorAlert, showSuccessAlert } from "../../utils/sweetAlert"
import type { ImplementoEditable } from "../../types"

interface ModalEditarImplementoProps {
  isOpen: boolean
  implemento: ImplementoEditable | null
  onClose: () => void
  onUpdate: () => void
}

const ModalEditarImplemento: React.FC<ModalEditarImplementoProps> = ({
  isOpen,
  implemento,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<ImplementoEditable | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (implemento) setFormData({ ...implemento })
  }, [implemento])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === "precio_unitario"
          ? parseFloat(value)
          : name === "cantidad"
          ? value.replace(/\D/g, "")
          : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setLoading(true)

    try {
      await implementosAPI.update(formData.id_implemento, formData)
      await showSuccessAlert("Actualizado", "El implemento fue modificado correctamente")
      onUpdate()
      onClose()
    } catch (err: any) {
      await showErrorAlert("Error", err.response?.data?.error || "Error al actualizar el implemento")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !formData) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-3xl">
        <div className="modal-header">
          <h2 className="modal-title">✏️ Editar Implemento</h2>
          <button onClick={onClose} className="modal-close">✖</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">🔤 Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">📦 Categoría</label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">📝 Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="form-input"
              rows={3}
              placeholder="Descripción del implemento"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-group">
              <label className="form-label">🔢 Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                className="form-input"
                min={1}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">💲 Precio Unitario</label>
              <input
                type="number"
                name="precio_unitario"
                value={formData.precio_unitario}
                onChange={handleChange}
                className="form-input"
                min={0}
                step={0.01}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">📊 Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="nuevo">Nuevo</option>
                <option value="bueno">Bueno</option>
                <option value="regular">Regular</option>
                <option value="malo">Malo</option>
                <option value="fuera_servicio">Fuera de Servicio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">📅 Fecha de Compra</label>
              <input
                type="date"
                name="fecha_compra"
                value={formData.fecha_compra}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">🏪 Proveedor</label>
              <input
                type="text"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">📍 Ubicación</label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-editar" disabled={loading}>
              💾 {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button type="button" onClick={onClose} className="btn-eliminar ml-4">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEditarImplemento

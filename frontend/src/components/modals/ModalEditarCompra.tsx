"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { comprasAPI } from "../../services/api"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../../utils/sweetAlert"
import type { Compra, Implemento } from "../../types"

interface ModalEditarCompraProps {
  isOpen: boolean
  compra: Compra | null
  onClose: () => void
  onUpdate: () => void
}

const ModalEditarCompra: React.FC<ModalEditarCompraProps> = ({ isOpen, compra, onClose, onUpdate }) => {
  const [form, setForm] = useState({ fecha: "", costo_total: "" })
  const [implementos, setImplementos] = useState<Implemento[]>([])

  useEffect(() => {
    if (compra) {
      // ✅ Ajustar fecha a local para evitar desfase
      const rawFecha = new Date(compra.fecha)
      const localDate = new Date(rawFecha.getTime() - rawFecha.getTimezoneOffset() * 60000)
      const fechaLocal = localDate.toISOString().split("T")[0]

      setForm({
        fecha: fechaLocal,
        costo_total: compra.costo_total,
      })
      setImplementos(compra.implementos || [])
    }
  }, [compra])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const raw = value.replace(/\D/g, "")
    setForm((prev) => ({ ...prev, [name]: raw }))
  }

  const handleImplChange = (index: number, field: string, value: string) => {
    const updated = [...implementos]
    if (field === "costo_unitario" || field === "cantidad") {
      value = value.replace(/\D/g, "")
    }
    updated[index] = { ...updated[index], [field]: value }
    setImplementos(updated)
  }

  const calculateTotal = () => {
    const total = implementos.reduce((sum, impl) => {
      const cantidad = Number(impl.cantidad) || 0
      const costo = Number(impl.costo_unitario) || 0
      return sum + cantidad * costo
    }, 0)
    setForm((prev) => ({ ...prev, costo_total: total.toString() }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!compra) return

    try {
      showLoadingAlert("Actualizando compra...", "Por favor espere")

      await comprasAPI.update(compra.id_compras, {
        fecha: form.fecha,
        costo_total: form.costo_total,
        implementos,
      })

      closeLoadingAlert()
      await showSuccessAlert("¡Compra actualizada!", "Los datos han sido guardados correctamente.")
      onUpdate()
      onClose()
    } catch (err: any) {
      closeLoadingAlert()
      await showErrorAlert("Error", err.response?.data?.error || "No se pudo actualizar la compra")
    }
  }

  if (!isOpen || !compra) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">✏️ Editar Compra #{compra.id_compras}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">📅 Fecha</label>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">📦 Implementos Comprados</label>
            <div className="space-y-2">
              {implementos.map((imp, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nombre"
                    value={imp.nombre}
                    onChange={(e) => handleImplChange(index, "nombre", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Cantidad"
                    value={imp.cantidad}
                    onChange={(e) => handleImplChange(index, "cantidad", e.target.value)}
                    required
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="text"
                      className="form-input pl-7"
                      placeholder="Costo Unitario"
                      inputMode="numeric"
                      value={Number(imp.costo_unitario || 0).toLocaleString("es-CL")}
                      onChange={(e) => handleImplChange(index, "costo_unitario", e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button type="button" onClick={calculateTotal} className="btn-editar">
              🧮 Calcular Total
            </button>
            <div>
              <label className="form-label">💰 Costo Total (CLP)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="text"
                  name="costo_total"
                  inputMode="numeric"
                  value={Number(form.costo_total || 0).toLocaleString("es-CL")}
                  onChange={handleChange}
                  className="form-input pl-7"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-editar">💾 Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEditarCompra

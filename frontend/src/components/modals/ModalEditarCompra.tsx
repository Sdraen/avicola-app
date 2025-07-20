"use client"

import { useEffect, useState } from "react"
import { comprasAPI } from "../../services/api"
import { showErrorAlert, showSuccessAlert } from "../../utils/sweetAlert"

interface Implemento {
  id_implemento: number
  nombre: string
  cantidad: number
  precio_unitario: number
  categoria?: string
  descripcion?: string
  estado?: string
  ubicacion?: string
}

interface Compra {
  id_compra: number
  fecha: string
  costo_total: number
  proveedor?: string
  implementos?: Implemento[]
}

interface ModalEditarCompraProps {
  isOpen: boolean
  compra: Compra | null
  onClose: () => void
  onUpdate: () => void
}

const ModalEditarCompra: React.FC<ModalEditarCompraProps> = ({ isOpen, compra, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    fecha: "",
    proveedor: "",
    costo_total: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (compra) {
      setForm({
        fecha: compra.fecha.split("T")[0],
        proveedor: compra.proveedor || "",
        costo_total: compra.costo_total.toString(),
      })
    }
  }, [compra])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const val = name === "costo_total" ? value.replace(/\D/g, "") : value
    setForm({ ...form, [name]: val })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!compra) return
    setLoading(true)

    try {
      await comprasAPI.update(compra.id_compra, {
        fecha: form.fecha,
        proveedor: form.proveedor || null,
        costo_total: Number(form.costo_total),
      })
      await showSuccessAlert("Compra actualizada", "La compra fue modificada correctamente.")
      onUpdate()
      onClose()
    } catch (err: any) {
      await showErrorAlert("Error", err.response?.data?.error || "No se pudo actualizar la compra.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !compra) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
          <div className="flex items-center justify-between bg-gradient-to-r from-green-500 to-lime-500 px-6 py-4 text-white">
            <h3 className="text-lg font-semibold">✏️ Editar Compra #{compra.id_compra}</h3>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-xl">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
            <div>
              <label className="form-label">📅 Fecha:</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="form-input" required />
            </div>

            <div>
              <label className="form-label">🏪 Proveedor:</label>
              <input
                type="text"
                name="proveedor"
                value={form.proveedor}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre del proveedor (opcional)"
              />
            </div>

            <div>
              <label className="form-label">💰 Costo Total (CLP):</label>
              <input
                type="text"
                name="costo_total"
                inputMode="numeric"
                value={Number(form.costo_total || 0).toLocaleString("es-CL")}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {compra.implementos?.length ? (
              <div>
                <label className="form-label">📦 Implementos Asociados:</label>
                <div className="bg-gray-100 p-3 rounded-md max-h-64 overflow-y-auto space-y-2 text-sm">
                  {compra.implementos.map((impl) => (
                    <div key={impl.id_implemento} className="p-2 bg-white rounded shadow-sm">
                      <div className="font-medium">{impl.nombre}</div>
                      <div className="text-gray-600">
                        {impl.cantidad} × {Number(impl.precio_unitario).toLocaleString("es-CL", {
                          style: "currency", currency: "CLP"
                        })} = {(impl.cantidad * impl.precio_unitario).toLocaleString("es-CL", {
                          style: "currency", currency: "CLP"
                        })}
                      </div>
                      {impl.categoria && <div className="text-gray-500">📂 {impl.categoria}</div>}
                      {impl.estado && <div className="text-gray-500">⚙️ {impl.estado}</div>}
                      {impl.ubicacion && <div className="text-gray-500">📍 {impl.ubicacion}</div>}
                      {impl.descripcion && <div className="text-gray-500 italic">📝 {impl.descripcion}</div>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">* Para modificar implementos, elimina y registra nuevamente la compra.</p>
              </div>
            ) : null}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold transition"
              >
                {loading ? "Actualizando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModalEditarCompra

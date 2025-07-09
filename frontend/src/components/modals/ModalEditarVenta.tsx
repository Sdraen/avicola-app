"use client"

import React, { useState, useEffect } from "react"
import Select from "react-select"
import { ventasAPI, clientesAPI, huevosAPI } from "../../services/api"
import type { Cliente, Huevo, Venta } from "../../types"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../../utils/sweetAlert"

interface ModalEditarVentaProps {
  isOpen: boolean
  venta: Venta | null
  onClose: () => void
  onUpdate: () => void
}

const ModalEditarVenta: React.FC<ModalEditarVentaProps> = ({ isOpen, venta, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    id_cliente: "",
    huevos: [] as number[],
    cantidad_bandejas: "",
    costo_total: "",
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [huevos, setHuevos] = useState<Huevo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !venta) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [clientesRes, huevosRes] = await Promise.all([
          clientesAPI.getAll(),
          huevosAPI.getAll(),
        ])

        setClientes(clientesRes.data?.data || clientesRes.data)
        setHuevos(huevosRes.data?.data || huevosRes.data)

        setForm({
          id_cliente: venta.id_cliente.toString(),
          huevos: venta.bandeja?.map((b) => b.id_huevo) || [],
          cantidad_bandejas: venta.cantidad_total.toString(),
          costo_total: venta.costo_total.toString(),
        })
      } catch (error) {
        console.error(error)
        await showErrorAlert("Error", "No se pudieron cargar los datos.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, venta])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === "costo_total" ? value.replace(/\D/g, "") : value })
  }

  const handleHuevosChange = (selected: any) => {
    setForm({ ...form, huevos: selected.map((item: any) => item.value) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venta) return

    try {
      showLoadingAlert("Guardando cambios...", "Actualizando venta")

      await ventasAPI.update(venta.id_venta, {
        id_cliente: Number(form.id_cliente),
        id_huevos: form.huevos,
        cantidad_bandejas: Number(form.cantidad_bandejas),
        costo_total: Number(form.costo_total),
      })

      closeLoadingAlert()
      await showSuccessAlert("Venta actualizada", "Los datos fueron guardados correctamente")
      onUpdate()
      onClose()
    } catch (error: any) {
      closeLoadingAlert()
      await showErrorAlert("Error", error?.response?.data?.error || "No se pudo actualizar la venta.")
    }
  }

  if (!isOpen || !venta) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl">✏️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Editar Venta</h3>
                  <p className="text-sm text-blue-100">ID: #{venta.id_venta}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white hover:bg-white hover:bg-opacity-20"
                aria-label="Cerrar modal"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Formulario */}
          {loading ? (
            <div className="py-8 text-center text-gray-600">Cargando datos...</div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Cliente */}
                <div>
                  <label className="form-label">👤 Cliente:</label>
                  <select
                    name="id_cliente"
                    value={form.id_cliente}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id_cliente} value={cliente.id_cliente}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Huevos */}
                <div>
                  <label className="form-label">🥚 Selección de Huevos:</label>
                  <Select
                    isMulti
                    value={huevos
                      .filter((h) => form.huevos.includes(h.id_huevo))
                      .map((h) => ({
                        value: h.id_huevo,
                        label: `Jaula ${h.jaula?.codigo_jaula || "?"} - ${new Date(
                          h.fecha_recoleccion
                        ).toLocaleDateString("es-CL")} - ${h.cantidad_total} huevos`,
                      }))}
                    options={huevos.map((h) => ({
                      value: h.id_huevo,
                      label: `Jaula ${h.jaula?.codigo_jaula || "?"} - ${new Date(
                        h.fecha_recoleccion
                      ).toLocaleDateString("es-CL")} - ${h.cantidad_total} huevos`,
                    }))}
                    onChange={handleHuevosChange}
                    placeholder="Seleccionar huevos recolectados"
                  />
                </div>

                {/* Bandejas */}
                <div>
                  <label className="form-label">🥚 Cantidad de bandejas:</label>
                  <input
                    type="number"
                    name="cantidad_bandejas"
                    value={form.cantidad_bandejas}
                    onChange={handleChange}
                    min={1}
                    required
                    className="form-input"
                  />
                </div>

                {/* Costo total */}
                <div>
                  <label className="form-label">💰 Costo Total (CLP):</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="text"
                      name="costo_total"
                      className="form-input pl-7"
                      inputMode="numeric"
                      value={Number(form.costo_total || 0).toLocaleString("es-CL")}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
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

export default ModalEditarVenta

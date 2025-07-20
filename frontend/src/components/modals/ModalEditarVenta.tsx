"use client"

import React, { useState, useEffect } from "react"
import Select from "react-select"
import { ventasAPI, clientesAPI, bandejasAPI } from "../../services/api"
import type { Cliente, Bandeja, Venta } from "../../types"
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
    bandejasSeleccionadas: [] as number[],
    costo_total: "",
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [bandejas, setBandejas] = useState<Bandeja[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !venta) return

    const fetchData = async () => {
      try {
        setLoading(true)

        const [clientesRes, bandejasRes] = await Promise.all([
          clientesAPI.getAll(),
          bandejasAPI.getAll(),
        ])

        const clientesList = clientesRes.data?.data || clientesRes.data || []
        const bandejasList = bandejasRes.data?.data || bandejasRes.data || []

        setClientes(clientesList)
        setBandejas(bandejasList)

        const bandejasIds = venta.bandeja?.map((b: any) => b.id_bandeja) || []

        setForm({
          id_cliente: venta.id_cliente.toString(),
          bandejasSeleccionadas: bandejasIds,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const raw = name === "costo_total" ? value.replace(/\D/g, "") : value
    setForm({ ...form, [name]: raw })
  }

  const handleSelectBandejas = (selected: any) => {
    const ids = selected ? selected.map((item: any) => item.value) : []
    setForm((prev) => ({ ...prev, bandejasSeleccionadas: ids }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venta) return

    try {
      showLoadingAlert("Guardando cambios...", "Actualizando venta")

      await ventasAPI.update(venta.id_venta, {
        id_cliente: Number(form.id_cliente),
        bandeja_ids: form.bandejasSeleccionadas,
        costo_total: Number(form.costo_total),
        cantidad_total: form.bandejasSeleccionadas.length,
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

  const bandejasOptions = bandejas.map((b) => ({
    value: b.id_bandeja,
    label: `🧺 Bandeja #${b.id_bandeja} - ${b.tipo_huevo} ${b.tamaño_huevo} - ${b.cantidad_huevos} huevos`,
  }))

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
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

          {loading ? (
            <div className="py-8 text-center text-gray-600">Cargando datos...</div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

                <div>
                  <label className="form-label">🧺 Seleccionar bandejas:</label>
                  <Select
                    isMulti
                    options={bandejasOptions}
                    value={bandejasOptions.filter((opt) => form.bandejasSeleccionadas.includes(opt.value))}
                    onChange={handleSelectBandejas}
                    placeholder="Seleccionar bandejas asignadas"
                    menuPlacement="auto"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>

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

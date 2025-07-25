"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Select from "react-select"
import { ventasAPI, bandejasAPI, clientesAPI } from "../services/api"
import type { Bandeja, Cliente } from "../types"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../utils/sweetAlert"

const RegistrarVenta: React.FC = () => {
  const navigate = useNavigate()

  // ✅ Eliminado el ajuste manual de zona horaria
  const fechaLocal = new Date().toISOString().split("T")[0]

  const [form, setForm] = useState({
    fecha: fechaLocal,
    id_cliente: "",
    bandejasSeleccionadas: [] as number[],
    costo_total: "",
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [bandejas, setBandejas] = useState<Bandeja[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, bandejasRes] = await Promise.all([
          clientesAPI.getAll(),
          bandejasAPI.getAll(),
        ])

        const clientesList = clientesRes.data?.data || clientesRes.data || []
        const bandejasList = bandejasRes.data?.data || bandejasRes.data || []

        setClientes(Array.isArray(clientesList) ? clientesList : [])
        setBandejas(Array.isArray(bandejasList) ? bandejasList : [])
      } catch (err: any) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar datos iniciales")
      }
    }

    fetchData()
  }, [])

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
    setError("")
    setLoading(true)

    try {
      showLoadingAlert("Registrando venta...", "Por favor espere")

      const payload = {
        id_cliente: Number.parseInt(form.id_cliente),
        fecha_venta: form.fecha,
        costo_total: Number.parseInt(form.costo_total),
        cantidad_total: form.bandejasSeleccionadas.length,
        bandeja_ids: form.bandejasSeleccionadas,
      }

      await ventasAPI.create(payload)

      closeLoadingAlert()
      await showSuccessAlert("¡Venta registrada!", "La venta se ha registrado exitosamente")

      setForm({
        fecha: fechaLocal,
        id_cliente: "",
        bandejasSeleccionadas: [],
        costo_total: "",
      })

      setTimeout(() => {
        navigate("/ver-ventas")
      }, 1500)
    } catch (err: any) {
      console.error("Error al registrar venta:", err)
      closeLoadingAlert()
      const errorMessage = err.response?.data?.error || err.message || "Error al registrar la venta"
      setError(errorMessage)
      await showErrorAlert("Error al registrar", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return "-"
    if (dateString.includes("T")) {
      return dateString.split("T")[0]
    }
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const getTipoHuevoLabel = (tipo: string) => {
    return tipo === "cafe" ? "🟤 Café" : "⚪ Blanco"
  }

  const getTamañoLabel = (tamaño: string) => {
    const tamaños: { [key: string]: string } = {
      chico: "Chico",
      mediano: "Mediano",
      grande: "Grande",
      jumbo: "Jumbo",
    }
    return tamaños[tamaño] || tamaño
  }

  const bandejasOptions = bandejas
    .filter((b) => b.estado === "disponible")
    .map((b) => ({
      value: b.id_bandeja,
      label: `🧺 Bandeja #${b.id_bandeja} - ${getTipoHuevoLabel(b.tipo_huevo)} ${getTamañoLabel(b.tamaño_huevo)} - ${b.cantidad_huevos} huevos - ${formatDate(b.fecha_creacion)}`,
    }))

  const totalBandejas = form.bandejasSeleccionadas.length
  const totalHuevos = bandejas
    .filter((b) => form.bandejasSeleccionadas.includes(b.id_bandeja))
    .reduce((sum, b) => sum + b.cantidad_huevos, 0)

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🧺</div>
        <h2 className="form-title">Registrar Nueva Venta de Bandejas</h2>
        <p className="form-subtitle">Seleccione cliente, bandejas disponibles y registre la venta</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label className="form-label">📅 Fecha:</label>
          <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label">👤 Cliente:</label>
          <select name="id_cliente" value={form.id_cliente} onChange={handleChange} className="form-input" required>
            <option value="">Seleccione un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id_cliente} value={cliente.id_cliente}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">🧺 Seleccionar bandejas disponibles:</label>
          <Select
            isMulti
            options={bandejasOptions}
            onChange={handleSelectBandejas}
            value={bandejasOptions.filter((opt) => form.bandejasSeleccionadas.includes(opt.value))}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Seleccione bandejas disponibles..."
            noOptionsMessage={() => "No hay bandejas disponibles"}
          />
          <small className="text-gray-500 mt-1 block">Seleccione las bandejas que desea vender</small>
        </div>

        {totalBandejas > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-800 mb-2">📊 Resumen de la Venta:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Total de bandejas:</span>
                <span className="ml-2 font-bold">{totalBandejas}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Total de huevos:</span>
                <span className="ml-2 font-bold">{totalHuevos}</span>
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">💰 Costo Total (CLP):</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="text"
              name="costo_total"
              inputMode="numeric"
              className="form-input pl-7"
              value={Number(form.costo_total || 0).toLocaleString("es-CL")}
              onChange={handleChange}
              placeholder="Ingrese el costo total"
              required
            />
          </div>
          {totalBandejas > 0 && form.costo_total && (
            <small className="text-gray-600 mt-1 block">
              Precio por bandeja: $
              {Math.round(Number.parseInt(form.costo_total) / totalBandejas).toLocaleString("es-CL")}
            </small>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={loading || form.bandejasSeleccionadas.length === 0}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Venta"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarVenta

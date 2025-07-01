"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Select from "react-select"
import { ventasAPI, huevosAPI, clientesAPI } from "../services/api"
import type { Huevo, Cliente } from "../types"

const RegistrarVenta: React.FC = () => {
  const navigate = useNavigate()

  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  const fechaLocal = localDate.toISOString().split("T")[0]

  const [form, setForm] = useState({
    fecha: fechaLocal,
    id_cliente: "",
    huevosSeleccionados: [] as number[],
    cantidad_bandejas: "",
    costo_total: "",
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [huevos, setHuevos] = useState<Huevo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, huevosRes] = await Promise.all([
          clientesAPI.getAll(),
          huevosAPI.getAll(),
        ])

        const clientesList = clientesRes.data?.data || clientesRes.data || []
        const huevosList = huevosRes.data?.data || huevosRes.data || []

        setClientes(Array.isArray(clientesList) ? clientesList : [])
        setHuevos(Array.isArray(huevosList) ? huevosList : [])
      } catch (err) {
        console.error("Error al cargar datos:", err)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const raw = name === "costo_total" ? value.replace(/\D/g, "") : value
    setForm({ ...form, [name]: raw })
  }

  const handleSelectHuevos = (selected: any) => {
    const ids = selected.map((item: any) => item.value)
    setForm((prev) => ({ ...prev, huevosSeleccionados: ids }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const payload = {
        id_cliente: parseInt(form.id_cliente),
        fecha_venta: form.fecha,
        cantidad_total: parseInt(form.cantidad_bandejas),
        costo_total: parseInt(form.costo_total),
        bandejas: form.huevosSeleccionados.map((id) => ({ id_huevo: id })),
      }

      await ventasAPI.create(payload)
      setSuccess("Venta registrada exitosamente")

      setForm({
        fecha: fechaLocal,
        id_cliente: "",
        huevosSeleccionados: [],
        cantidad_bandejas: "",
        costo_total: "",
      })

      setTimeout(() => {
        navigate("/ver-ventas")
      }, 1500)
    } catch (err: any) {
      console.error("Error al registrar venta:", err)
      setError(err.response?.data?.error || "Error al registrar la venta")
    } finally {
      setLoading(false)
    }
  }

  const formatFecha = (iso: string) => {
    const raw = new Date(iso)
    const local = new Date(raw.getTime() + raw.getTimezoneOffset() * 60000)
    return local.toLocaleDateString("es-CL")
  }

  const huevosOptions = huevos.map((h) => ({
    value: h.id_huevo,
    label: `🥚 Jaula ${h.jaula?.codigo_jaula || "?"} - ${formatFecha(h.fecha_recoleccion)} - ${h.cantidad_total} huevos`,
  }))

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🥚</div>
        <h2 className="form-title">Registrar Nueva Venta de Huevos</h2>
        <p className="form-subtitle">Seleccione cliente, huevos recolectados y registre la venta</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label className="form-label">📅 Fecha:</label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
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

        <div className="form-group">
          <label className="form-label">📦 Seleccionar huevos para bandejas:</label>
          <Select
            isMulti
            options={huevosOptions}
            onChange={handleSelectHuevos}
            value={huevosOptions.filter((opt) => form.huevosSeleccionados.includes(opt.value))}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Seleccione huevos..."
          />
          <small className="text-gray-500 mt-1 block">Mantenga presionada Ctrl o Cmd para seleccionar múltiples</small>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cantidad_bandejas">🥚 Cantidad de bandejas:</label>
          <input
            type="number"
            id="cantidad_bandejas"
            name="cantidad_bandejas"
            value={form.cantidad_bandejas}
            onChange={handleChange}
            className="form-input"
            min={1}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="costo_total">💰 Costo Total (CLP):</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="text"
              id="costo_total"
              name="costo_total"
              inputMode="numeric"
              className="form-input pl-7"
              value={Number(form.costo_total || 0).toLocaleString("es-CL")}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Venta"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarVenta

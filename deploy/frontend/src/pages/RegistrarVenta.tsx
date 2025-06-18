"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ventasAPI, clientesAPI } from "../services/api"
import type { Cliente } from "../types"

const RegistrarVenta: React.FC = () => {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [form, setForm] = useState({
    id_cliente: "",
    codigo_barras: "",
    fecha_venta: new Date().toISOString().split("T")[0],
    costo_total: "",
    cantidad_total: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await clientesAPI.getAll()
        setClientes(response.data)
      } catch (err) {
        console.error("Error fetching clientes:", err)
      }
    }

    fetchClientes()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const calculateUnitPrice = () => {
    const total = Number.parseFloat(form.costo_total)
    const cantidad = Number.parseInt(form.cantidad_total)
    if (total && cantidad) {
      return (total / cantidad).toFixed(2)
    }
    return "0.00"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const ventaData = {
        id_cliente: Number.parseInt(form.id_cliente),
        codigo_barras: Number.parseInt(form.codigo_barras),
        fecha_venta: form.fecha_venta,
        costo_total: Number.parseFloat(form.costo_total),
        cantidad_total: Number.parseInt(form.cantidad_total),
      }

      await ventasAPI.create(ventaData)
      setSuccess("Venta registrada exitosamente")

      // Limpiar formulario
      setForm({
        id_cliente: "",
        codigo_barras: "",
        fecha_venta: new Date().toISOString().split("T")[0],
        costo_total: "",
        cantidad_total: "",
      })

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/ver-ventas")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrar la venta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">💰</div>
        <h2 className="form-title">Registrar Nueva Venta</h2>
        <p className="form-subtitle">Complete los datos para registrar una venta en el sistema</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">👤</span>
              Cliente:
            </label>
            <select name="id_cliente" value={form.id_cliente} onChange={handleChange} className="form-input" required>
              <option value="">Seleccionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📅</span>
              Fecha de Venta:
            </label>
            <input
              type="date"
              name="fecha_venta"
              value={form.fecha_venta}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🏷️</span>
            Código de Barras:
          </label>
          <input
            type="number"
            name="codigo_barras"
            value={form.codigo_barras}
            onChange={handleChange}
            className="form-input"
            placeholder="Código de barras del producto"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📦</span>
              Cantidad Total:
            </label>
            <input
              type="number"
              name="cantidad_total"
              value={form.cantidad_total}
              onChange={handleChange}
              className="form-input"
              min="1"
              placeholder="Cantidad de productos"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">💰</span>
              Costo Total:
            </label>
            <input
              type="number"
              name="costo_total"
              value={form.costo_total}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              min="0.01"
              placeholder="Precio total de la venta"
              required
            />
          </div>
        </div>

        {form.costo_total && form.cantidad_total && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Precio por unidad:</strong> ${calculateUnitPrice()}
            </p>
          </div>
        )}

        <button type="submit" className="submit-button" disabled={loading}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Venta"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarVenta

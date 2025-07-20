"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { comprasAPI } from "../services/api"

interface Implemento {
  nombre: string
  cantidad: string
  precio_unitario: string
  categoria?: string
  estado?: string
  ubicacion?: string
  descripcion?: string
}

const RegistrarCompra: React.FC = () => {
  const navigate = useNavigate()

  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  const fechaLocal = localDate.toISOString().split("T")[0]

  const [form, setForm] = useState({
    fecha: fechaLocal,
    proveedor: "",
    costo_total: "",
  })

  const [implementos, setImplementos] = useState<Implemento[]>([
    { nombre: "", cantidad: "", precio_unitario: "", categoria: "", estado: "Bueno", ubicacion: "", descripcion: "" },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleImplementoChange = (index: number, field: string, value: string) => {
    const updated = [...implementos]
    if (field === "precio_unitario" || field === "cantidad") {
      value = value.replace(/\D/g, "")
    }
    updated[index] = { ...updated[index], [field]: value }
    setImplementos(updated)
  }

  const addImplemento = () => {
    setImplementos([
      ...implementos,
      { nombre: "", cantidad: "", precio_unitario: "", categoria: "", estado: "Bueno", ubicacion: "", descripcion: "" },
    ])
  }

  const removeImplemento = (index: number) => {
    if (implementos.length > 1) {
      setImplementos(implementos.filter((_, i) => i !== index))
    }
  }

  const calculateTotal = () => {
    const total = implementos.reduce((sum, impl) => {
      const cantidad = Number(impl.cantidad) || 0
      const precio = Number(impl.precio_unitario) || 0
      return sum + cantidad * precio
    }, 0)
    setForm({ ...form, costo_total: total.toString() })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const compraData = {
        fecha: form.fecha,
        proveedor: form.proveedor,
        costo_total: Number(form.costo_total),
        implementos: implementos.map((i) => ({
          nombre: i.nombre,
          cantidad: Number(i.cantidad),
          precio_unitario: Number(i.precio_unitario),
          categoria: i.categoria,
          estado: i.estado,
          ubicacion: i.ubicacion,
          descripcion: i.descripcion,
        })),
      }

      await comprasAPI.create(compraData)
      setSuccess("Compra registrada exitosamente")

      setForm({ fecha: fechaLocal, proveedor: "", costo_total: "" })
      setImplementos([{ nombre: "", cantidad: "", precio_unitario: "" }])

      setTimeout(() => {
        navigate("/ver-compras")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrar la compra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🛒</div>
        <h2 className="form-title">Registrar Compra</h2>
        <p className="form-subtitle">Agrega una compra y sus implementos asociados</p>
      </div>

      <form onSubmit={handleSubmit} className="registrar-ave-form space-y-6">
        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <div className="form-group">
          <label className="form-label">📅 Fecha de Compra</label>
          <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required className="form-input" />
        </div>

        <div className="form-group">
          <label className="form-label">🏪 Proveedor</label>
          <input
            type="text"
            name="proveedor"
            value={form.proveedor}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej. AgroComercial Ltda."
          />
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">📦 Implementos Comprados</h3>
          <button type="button" onClick={addImplemento} className="btn-editar">➕ Agregar</button>
        </div>

        {implementos.map((impl, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              className="form-input"
              placeholder="Nombre"
              value={impl.nombre}
              onChange={(e) => handleImplementoChange(index, "nombre", e.target.value)}
              required
            />
            <input
              type="number"
              className="form-input"
              placeholder="Cantidad"
              min={1}
              value={impl.cantidad}
              onChange={(e) => handleImplementoChange(index, "cantidad", e.target.value)}
              required
            />
            <input
              type="number"
              className="form-input"
              placeholder="Precio Unitario"
              min={0}
              step={0.01}
              value={impl.precio_unitario}
              onChange={(e) => handleImplementoChange(index, "precio_unitario", e.target.value)}
              required
            />
            {implementos.length > 1 && (
              <button type="button" onClick={() => removeImplemento(index)} className="btn-eliminar">
                ✖
              </button>
            )}
          </div>
        ))}

        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
          <button type="button" onClick={calculateTotal} className="btn-editar w-full md:w-auto">
            🧮 Calcular Total
          </button>
          <div className="form-group flex-1">
            <label className="form-label">💵 Costo Total (CLP)</label>
            <input
              type="text"
              name="costo_total"
              inputMode="numeric"
              value={Number(form.costo_total || 0).toLocaleString("es-CL")}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Compra"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarCompra

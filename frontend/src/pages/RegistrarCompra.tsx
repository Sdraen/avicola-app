"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { comprasAPI } from "../services/api"

interface Implemento {
  nombre: string
  cantidad: string
  costo_unitario: string
}

const RegistrarCompra: React.FC = () => {
  const navigate = useNavigate()

  // ✅ Fecha local corregida para evitar desfase
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  const fechaLocal = localDate.toISOString().split("T")[0]

  const [form, setForm] = useState({
    fecha: fechaLocal,
    costo_total: "",
  })

  const [implementos, setImplementos] = useState<Implemento[]>([{ nombre: "", cantidad: "", costo_unitario: "" }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const raw = value.replace(/\D/g, "")
    setForm({ ...form, [name]: raw })
  }

  const handleImplementoChange = (index: number, field: string, value: string) => {
    const updated = [...implementos]
    if (field === "costo_unitario" || field === "cantidad") {
      value = value.replace(/\D/g, "")
    }
    updated[index] = { ...updated[index], [field]: value }
    setImplementos(updated)
  }

  const addImplemento = () => {
    setImplementos([...implementos, { nombre: "", cantidad: "", costo_unitario: "" }])
  }

  const removeImplemento = (index: number) => {
    if (implementos.length > 1) {
      setImplementos(implementos.filter((_, i) => i !== index))
    }
  }

  const calculateTotal = () => {
    const total = implementos.reduce((sum, impl) => {
      const cantidad = Number(impl.cantidad) || 0
      const costo = Number(impl.costo_unitario) || 0
      return sum + cantidad * costo
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
        costo_total: form.costo_total,
        implementos: implementos.map((i) => ({
          nombre: i.nombre,
          cantidad: i.cantidad,
          costo_unitario: i.costo_unitario,
        })),
      }

      await comprasAPI.create(compraData)
      setSuccess("Compra registrada exitosamente")

      // Reset form
      setForm({ fecha: fechaLocal, costo_total: "" })
      setImplementos([{ nombre: "", cantidad: "", costo_unitario: "" }])

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
        <h2 className="form-title">Registrar Nueva Compra</h2>
        <p className="form-subtitle">Complete los datos para registrar una compra en el sistema</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📅</span> Fecha:
          </label>
          <input type="date" name="fecha" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="form-input" required />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-medium text-gray-700">📦 Implementos Comprados</h3>
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
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="text"
                  className="form-input pl-7"
                  placeholder="Costo Unitario"
                  inputMode="numeric"
                  value={Number(impl.costo_unitario || 0).toLocaleString("es-CL")}
                  onChange={(e) => handleImplementoChange(index, "costo_unitario", e.target.value)}
                  required
                />
              </div>
              {implementos.length > 1 && (
                <button type="button" onClick={() => removeImplemento(index)} className="btn-eliminar">
                  ✖
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button type="button" onClick={calculateTotal} className="btn-editar">
            🧮 Calcular Total
          </button>
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">💰</span> Costo Total (CLP):
            </label>
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

        <button type="submit" className="submit-button" disabled={loading}>
          <span className="button-icon">💾</span>
          <span className="button-text">{loading ? "Registrando..." : "Registrar Compra"}</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarCompra

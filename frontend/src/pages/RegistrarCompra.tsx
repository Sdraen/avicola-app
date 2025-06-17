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
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split("T")[0],
    costo_total: "",
  })
  const [implementos, setImplementos] = useState<Implemento[]>([{ nombre: "", cantidad: "", costo_unitario: "" }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImplementoChange = (index: number, field: string, value: string) => {
    const newImplementos = [...implementos]
    newImplementos[index] = { ...newImplementos[index], [field]: value }
    setImplementos(newImplementos)
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
      const cantidad = Number.parseFloat(impl.cantidad) || 0
      const costo = Number.parseFloat(impl.costo_unitario) || 0
      return sum + cantidad * costo
    }, 0)
    setForm({ ...form, costo_total: total.toFixed(2) })
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
        implementos: implementos.filter((impl) => impl.nombre.trim() !== ""),
      }

      await comprasAPI.create(compraData)
      setSuccess("Compra registrada exitosamente")

      // Limpiar formulario
      setForm({
        fecha: new Date().toISOString().split("T")[0],
        costo_total: "",
      })
      setImplementos([{ nombre: "", cantidad: "", costo_unitario: "" }])

      // Redirigir después de 2 segundos
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha">Fecha de Compra</label>
            <input type="date" id="fecha" name="fecha" value={form.fecha} onChange={handleChange} required />
          </div>
        </div>

        <div className="implementos-section">
          <div className="section-header">
            <h3>Implementos Comprados</h3>
            <button type="button" onClick={addImplemento} className="btn-add">
              + Agregar Implemento
            </button>
          </div>

          {implementos.map((implemento, index) => (
            <div key={index} className="implemento-row">
              <div className="form-group">
                <label>Nombre del Implemento</label>
                <input
                  type="text"
                  value={implemento.nombre}
                  onChange={(e) => handleImplementoChange(index, "nombre", e.target.value)}
                  placeholder="Ej: Comedero, Bebedero, etc."
                  required
                />
              </div>
              <div className="form-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  value={implemento.cantidad}
                  onChange={(e) => handleImplementoChange(index, "cantidad", e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Costo Unitario ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={implemento.costo_unitario}
                  onChange={(e) => handleImplementoChange(index, "costo_unitario", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  required
                />
              </div>
              {implementos.length > 1 && (
                <button type="button" onClick={() => removeImplemento(index)} className="btn-remove">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="form-row">
          <div className="form-group">
            <button type="button" onClick={calculateTotal} className="btn-calculate">
              Calcular Total
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="costo_total">Costo Total ($)</label>
            <input
              type="number"
              step="0.01"
              id="costo_total"
              name="costo_total"
              value={form.costo_total}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/compras")} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Registrando..." : "Registrar Compra"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegistrarCompra

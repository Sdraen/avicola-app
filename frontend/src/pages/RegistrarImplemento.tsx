"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { implementosAPI, comprasAPI } from "../services/api"
import { showSuccessAlert, showErrorAlert } from "../utils/sweetAlert"

interface Compra {
  id_compra: number
  fecha: string
  costo_total: string
  proveedor?: string
}

const RegistrarImplemento: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [comprasDisponibles, setComprasDisponibles] = useState<Compra[]>([])

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    descripcion: "",
    cantidad: "",
    precio_unitario: "",
    estado: "Bueno",
    ubicacion: "",
    id_compra: "", // Campo para asociar con compra
  })

  useEffect(() => {
    fetchCompras()
  }, [])

  const fetchCompras = async () => {
    try {
      const response = await comprasAPI.getAll()
      setComprasDisponibles(response.data)
    } catch (err) {
      console.error("Error al cargar compras:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = {
        nombre: formData.nombre,
        cantidad: Number(formData.cantidad),
        precio_unitario: Number(formData.precio_unitario),
        categoria: formData.categoria,
        descripcion: formData.descripcion,
        estado: formData.estado,
        ubicacion: formData.ubicacion,
        // Solo incluir id_compra si se seleccionó una compra
        ...(formData.id_compra && { id_compra: Number(formData.id_compra) }),
      }

      console.log("Enviando payload:", payload)

      await implementosAPI.create(payload)

      await showSuccessAlert(
        "¡Implemento registrado!",
        `${formData.nombre} ha sido registrado exitosamente en el inventario.`,
      )

      navigate("/implementos")
    } catch (err: any) {
      console.error("Error al registrar implemento:", err)
      await showErrorAlert("Error", err.response?.data?.error || "Error al registrar el implemento")
    } finally {
      setLoading(false)
    }
  }

  const formatFechaLocal = (fechaISO: string): string => {
    const raw = new Date(fechaISO)
    const local = new Date(raw.getTime() + raw.getTimezoneOffset() * 60000)
    return local.toLocaleDateString("es-CL")
  }

  const compraSeleccionada = comprasDisponibles.find((c) => c.id_compra.toString() === formData.id_compra)

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🧰</div>
        <h2 className="form-title">Registrar Implemento</h2>
        <p className="form-subtitle">Complete los datos del nuevo implemento para el inventario</p>
      </div>

      {/* Selector de Compra Asociada */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">🛒 Asociación con Compra (Opcional)</h3>
        <div className="form-group mb-0">
          <label className="form-label">Seleccionar Compra:</label>
          <select name="id_compra" value={formData.id_compra} onChange={handleChange} className="form-input">
            <option value="">Sin asociar a compra</option>
            {comprasDisponibles.map((compra) => (
              <option key={compra.id_compra} value={compra.id_compra}>
                Compra #{compra.id_compra} - {formatFechaLocal(compra.fecha)} -{" "}
                {Number(compra.costo_total).toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                })}
                {compra.proveedor && ` - ${compra.proveedor}`}
              </option>
            ))}
          </select>
        </div>
        {compraSeleccionada && (
          <div className="mt-2 p-2 bg-white rounded text-sm text-gray-600">
            ℹ️ Este implemento se asociará con la compra del {formatFechaLocal(compraSeleccionada.fecha)}
            {compraSeleccionada.proveedor && ` de ${compraSeleccionada.proveedor}`}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="registrar-ave-form space-y-6">
        {error && <div className="alert-error">{error}</div>}

        {/* Información Básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">🔤 Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="form-input"
              placeholder="Ej: Comedero automático"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">📦 Categoría:</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} className="form-input" required>
              <option value="">Seleccionar categoría</option>
              <option value="Alimentación">Alimentación</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Incubación">Incubación</option>
              <option value="Herramientas">Herramientas</option>
              <option value="Equipos">Equipos</option>
              <option value="Seguridad">Seguridad</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">📝 Descripción:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="form-input"
            rows={3}
            placeholder="Descripción detallada del implemento"
          />
        </div>

        {/* Información de Cantidad y Precio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="form-group">
            <label className="form-label">🔢 Cantidad:</label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              className="form-input"
              min={1}
            />
          </div>

          <div className="form-group">
            <label className="form-label">💲 Precio Unitario:</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                name="precio_unitario"
                value={formData.precio_unitario}
                onChange={handleChange}
                className="form-input pl-7"
                required
                min={0}
                step={0.01}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">📊 Estado:</label>
            <select name="estado" value={formData.estado} onChange={handleChange} className="form-input" required>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Malo">Malo</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">📍 Ubicación:</label>
          <input
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej. Bodega principal, estante 4"
          />
        </div>

        {/* Resumen */}
        {formData.cantidad && formData.precio_unitario && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-2">💰 Resumen</h3>
            <div className="text-sm text-gray-600">
              <p>Cantidad: {formData.cantidad} unidades</p>
              <p>
                Precio unitario:{" "}
                {Number(formData.precio_unitario).toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                })}
              </p>
              <p className="font-semibold text-green-700">
                Valor total:{" "}
                {(Number(formData.cantidad) * Number(formData.precio_unitario)).toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/implementos")}
            className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button type="submit" className="flex-1 submit-button" disabled={loading}>
            <span className="button-icon">💾</span>
            <span className="button-text">{loading ? "Registrando..." : "Registrar Implemento"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegistrarImplemento

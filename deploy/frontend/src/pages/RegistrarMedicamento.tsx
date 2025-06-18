"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import  api  from "../services/api"

export default function RegistrarMedicamento() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    descripcion: "",
    dosis: "",
    via_administracion: "",
    tiempo_retiro: "",
    stock: "",
    fecha_vencimiento: "",
    precio_unitario: "",
    proveedor: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await api.post("/medicamentos", {
        ...formData,
        tiempo_retiro: Number.parseInt(formData.tiempo_retiro),
        stock: Number.parseInt(formData.stock),
        precio_unitario: Number.parseFloat(formData.precio_unitario),
      })

      setSuccess("Medicamento registrado exitosamente")
      setTimeout(() => {
        navigate("/medicamentos")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar el medicamento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Registrar Medicamento</h1>
        <p className="text-gray-600 mt-2">Agregar un nuevo medicamento al inventario</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Medicamento *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar tipo</option>
                <option value="Antibiótico">Antibiótico</option>
                <option value="Vitamina">Vitamina</option>
                <option value="Desparasitante">Desparasitante</option>
                <option value="Antiinflamatorio">Antiinflamatorio</option>
                <option value="Probiótico">Probiótico</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosis *</label>
              <input
                type="text"
                name="dosis"
                value={formData.dosis}
                onChange={handleChange}
                required
                placeholder="ej: 1ml por kg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vía de Administración *</label>
              <select
                name="via_administracion"
                value={formData.via_administracion}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar vía</option>
                <option value="Oral">Oral</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Subcutánea">Subcutánea</option>
                <option value="Tópica">Tópica</option>
                <option value="En agua">En agua</option>
                <option value="En alimento">En alimento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de Retiro (días) *</label>
              <input
                type="number"
                name="tiempo_retiro"
                value={formData.tiempo_retiro}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario *</label>
              <input
                type="number"
                name="precio_unitario"
                value={formData.precio_unitario}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento *</label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <input
                type="text"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar Medicamento"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/medicamentos")}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

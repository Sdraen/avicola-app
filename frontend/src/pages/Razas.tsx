"use client"

import type React from "react"

import { useState, useEffect } from "react"
import api from "../services/api"

interface Raza {
  id: number
  nombre: string
  origen: string
  proposito: string
  descripcion: string
  peso_promedio_macho: number
  peso_promedio_hembra: number
  produccion_huevos_anual: number
  color_huevos: string
  temperamento: string
  resistencia_clima: string
  created_at: string
}

export default function Razas() {
  const [razas, setRazas] = useState<Raza[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    origen: "",
    proposito: "",
    descripcion: "",
    peso_promedio_macho: "",
    peso_promedio_hembra: "",
    produccion_huevos_anual: "",
    color_huevos: "",
    temperamento: "",
    resistencia_clima: "",
  })

  useEffect(() => {
    fetchRazas()
  }, [])

  const fetchRazas = async () => {
    try {
      const response = await api.get("/razas")
      setRazas(response.data)
    } catch (err) {
      setError("Error al cargar las razas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post("/razas", {
        ...formData,
        peso_promedio_macho: Number.parseFloat(formData.peso_promedio_macho),
        peso_promedio_hembra: Number.parseFloat(formData.peso_promedio_hembra),
        produccion_huevos_anual: Number.parseInt(formData.produccion_huevos_anual),
      })

      setShowForm(false)
      setFormData({
        nombre: "",
        origen: "",
        proposito: "",
        descripcion: "",
        peso_promedio_macho: "",
        peso_promedio_hembra: "",
        produccion_huevos_anual: "",
        color_huevos: "",
        temperamento: "",
        resistencia_clima: "",
      })
      fetchRazas()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar la raza")
    }
  }

  const filteredRazas = razas.filter(
    (raza) =>
      raza.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      raza.proposito.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getPropositoColor = (proposito: string) => {
    switch (proposito.toLowerCase()) {
      case "ponedora":
        return "bg-yellow-100 text-yellow-800"
      case "carne":
        return "bg-red-100 text-red-800"
      case "doble proposito":
        return "bg-green-100 text-green-800"
      case "ornamental":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando razas...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Razas de Aves</h1>
          <p className="text-gray-600 mt-2">Catálogo de razas avícolas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          {showForm ? "Cancelar" : "Agregar Raza"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Registrar Nueva Raza</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre de la raza *"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                placeholder="Origen"
                value={formData.origen}
                onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.proposito}
                onChange={(e) => setFormData({ ...formData, proposito: e.target.value })}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Seleccionar propósito *</option>
                <option value="Ponedora">Ponedora</option>
                <option value="Carne">Carne</option>
                <option value="Doble Propósito">Doble Propósito</option>
                <option value="Ornamental">Ornamental</option>
              </select>
              <input
                type="text"
                placeholder="Color de huevos"
                value={formData.color_huevos}
                onChange={(e) => setFormData({ ...formData, color_huevos: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <textarea
              placeholder="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Peso macho (kg)"
                value={formData.peso_promedio_macho}
                onChange={(e) => setFormData({ ...formData, peso_promedio_macho: e.target.value })}
                step="0.1"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="number"
                placeholder="Peso hembra (kg)"
                value={formData.peso_promedio_hembra}
                onChange={(e) => setFormData({ ...formData, peso_promedio_hembra: e.target.value })}
                step="0.1"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="number"
                placeholder="Huevos/año"
                value={formData.produccion_huevos_anual}
                onChange={(e) => setFormData({ ...formData, produccion_huevos_anual: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Temperamento"
                value={formData.temperamento}
                onChange={(e) => setFormData({ ...formData, temperamento: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                placeholder="Resistencia al clima"
                value={formData.resistencia_clima}
                onChange={(e) => setFormData({ ...formData, resistencia_clima: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Registrar Raza
            </button>
          </form>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar razas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRazas.map((raza) => (
          <div key={raza.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{raza.nombre}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPropositoColor(raza.proposito)}`}>
                {raza.proposito}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              {raza.origen && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Origen:</span>
                  <span className="font-medium">{raza.origen}</span>
                </div>
              )}

              {raza.peso_promedio_macho > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Peso macho:</span>
                  <span className="font-medium">{raza.peso_promedio_macho} kg</span>
                </div>
              )}

              {raza.peso_promedio_hembra > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Peso hembra:</span>
                  <span className="font-medium">{raza.peso_promedio_hembra} kg</span>
                </div>
              )}

              {raza.produccion_huevos_anual > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Huevos/año:</span>
                  <span className="font-medium">{raza.produccion_huevos_anual}</span>
                </div>
              )}

              {raza.color_huevos && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Color huevos:</span>
                  <span className="font-medium">{raza.color_huevos}</span>
                </div>
              )}

              {raza.temperamento && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperamento:</span>
                  <span className="font-medium">{raza.temperamento}</span>
                </div>
              )}
            </div>

            {raza.descripcion && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{raza.descripcion}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRazas.length === 0 && <div className="text-center py-8 text-gray-500">No se encontraron razas</div>}
    </div>
  )
}

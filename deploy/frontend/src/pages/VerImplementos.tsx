"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import  api  from "../services/api"

interface Implemento {
  id: number
  nombre: string
  categoria: string
  descripcion: string
  cantidad: number
  precio_unitario: number
  estado: string
  fecha_compra: string
  proveedor: string
  ubicacion: string
  created_at: string
}

export default function VerImplementos() {
  const [implementos, setImplementos] = useState<Implemento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("")

  useEffect(() => {
    fetchImplementos()
  }, [])

  const fetchImplementos = async () => {
    try {
      const response = await api.get("/implementos")
      setImplementos(response.data)
    } catch (err) {
      setError("Error al cargar los implementos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categorias = [...new Set(implementos.map((impl) => impl.categoria))]

  const filteredImplementos = implementos.filter((implemento) => {
    const matchesSearch =
      implemento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      implemento.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = filterCategoria === "" || implemento.categoria === filterCategoria
    return matchesSearch && matchesCategoria
  })

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "bueno":
        return "bg-green-100 text-green-800"
      case "regular":
        return "bg-yellow-100 text-yellow-800"
      case "malo":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando implementos...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Implementos</h1>
          <p className="text-gray-600 mt-2">Lista de herramientas y equipos avícolas</p>
        </div>
        <Link
          to="/registrar-implemento"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Agregar Implemento
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Buscar implementos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImplementos.map((implemento) => (
          <div key={implemento.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{implemento.nombre}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(implemento.estado)}`}>
                {implemento.estado}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Categoría:</span>
                <span className="font-medium">{implemento.categoria}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Cantidad:</span>
                <span className="font-medium">{implemento.cantidad}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Precio unitario:</span>
                <span className="font-medium">${implemento.precio_unitario.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Ubicación:</span>
                <span className="font-medium">{implemento.ubicacion}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Proveedor:</span>
                <span className="font-medium">{implemento.proveedor}</span>
              </div>
            </div>

            {implemento.descripcion && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{implemento.descripcion}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredImplementos.length === 0 && (
        <div className="text-center py-8 text-gray-500">No se encontraron implementos</div>
      )}
    </div>
  )
}

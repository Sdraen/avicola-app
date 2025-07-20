"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { implementosAPI } from "../services/api"
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from "../utils/sweetAlert"

interface Implemento {
  id_implemento: number
  id_compra?: number
  nombre: string
  cantidad: number
  precio_unitario: number
  categoria?: string
  descripcion?: string
  estado?: string
  ubicacion?: string
  fecha_registro: string
  compra?: {
    id_compra: number
    fecha: string
    costo_total: string
    proveedor?: string
  }
}

export default function VerImplementos() {
  const [implementos, setImplementos] = useState<Implemento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCompra, setFilterCompra] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("")

  useEffect(() => {
    fetchImplementos()
  }, [])

  const fetchImplementos = async () => {
    try {
      const response = await implementosAPI.getAll()
      setImplementos(response.data)
    } catch (err: any) {
      setError("Error al cargar los implementos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (implemento: Implemento) => {
    const confirmed = await showDeleteConfirmation(
      "¿Eliminar implemento?",
      `¿Estás seguro de que deseas eliminar "${implemento.nombre}"? Esta acción no se puede deshacer.`,
    )
    if (!confirmed) return

    try {
      await implementosAPI.delete(implemento.id_implemento)
      await showSuccessAlert("¡Eliminado!", "El implemento ha sido eliminado correctamente.")
      fetchImplementos()
    } catch (err: any) {
      await showErrorAlert("Error", err.response?.data?.error || "No se pudo eliminar el implemento")
    }
  }

  // Obtener compras y categorías únicas para los filtros
  const comprasUnicas = [...new Set(implementos.map((impl) => impl.compra?.id_compra).filter(Boolean))]
  const categoriasUnicas = [...new Set(implementos.map((impl) => impl.categoria).filter(Boolean))]

  const filteredImplementos = implementos.filter((implemento) => {
    const matchesSearch = implemento.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCompra =
      filterCompra === "" ||
      (filterCompra === "sin_compra" && !implemento.id_compra) ||
      implemento.id_compra?.toString() === filterCompra
    const matchesCategoria = filterCategoria === "" || implemento.categoria === filterCategoria
    return matchesSearch && matchesCompra && matchesCategoria
  })

  const totalImplementos = implementos.length
  const valorTotalInventario = implementos.reduce((sum, impl) => {
    return sum + Number(impl.cantidad) * Number(impl.precio_unitario || 0)
  }, 0)

  const formatFechaLocal = (fechaISO?: string): string => {
    if (!fechaISO) return "N/A"
    const raw = new Date(fechaISO)
    const local = new Date(raw.getTime() + raw.getTimezoneOffset() * 60000)
    return local.toLocaleDateString("es-CL")
  }

  const getEstadoColor = (estado?: string) => {
    switch (estado?.toLowerCase()) {
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
      <div className="ver-aves-container">
        <div className="text-center">Cargando inventario...</div>
      </div>
    )
  }

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">📦</div>
          <div className="header-text">
            <h1 className="table-title">Inventario de Implementos</h1>
            <p className="table-subtitle">
              Total de implementos: {totalImplementos} | Valor total:{" "}
              {valorTotalInventario.toLocaleString("es-CL", {
                style: "currency",
                currency: "CLP",
                minimumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/registrar-implemento"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Registrar Implemento
          </Link>
          <Link
            to="/compras"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>🛒</span>
            Nueva Compra
          </Link>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Buscar implementos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterCompra}
          onChange={(e) => setFilterCompra(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las compras</option>
          <option value="sin_compra">Sin compra asociada</option>
          {comprasUnicas.map((compraId) => (
            <option key={compraId} value={compraId?.toString()}>
              Compra #{compraId}
            </option>
          ))}
        </select>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {categoriasUnicas.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImplementos.map((implemento) => {
          const valorTotal = Number(implemento.cantidad) * Number(implemento.precio_unitario || 0)
          return (
            <div
              key={implemento.id_implemento}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{implemento.nombre}</h3>
                {implemento.estado && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(implemento.estado)}`}>
                    {implemento.estado}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {implemento.categoria && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="font-medium">{implemento.categoria}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Cantidad:</span>
                  <span className="font-medium">{implemento.cantidad}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Precio unitario:</span>
                  <span className="font-medium text-blue-600">
                    {Number(implemento.precio_unitario || 0).toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="font-medium text-green-600">
                    {valorTotal.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>

                {implemento.id_compra ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compra:</span>
                    <Link to={`/ver-compras`} className="text-blue-600 hover:text-blue-800 font-medium">
                      #{implemento.id_compra}
                    </Link>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Origen:</span>
                    <span className="text-gray-500 italic">Registro independiente</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">
                    {implemento.compra?.fecha
                      ? formatFechaLocal(implemento.compra.fecha)
                      : formatFechaLocal(implemento.fecha_registro)}
                  </span>
                </div>

                {implemento.ubicacion && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="font-medium">{implemento.ubicacion}</span>
                  </div>
                )}

                {implemento.compra?.proveedor && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proveedor:</span>
                    <span className="font-medium">{implemento.compra.proveedor}</span>
                  </div>
                )}
              </div>

              {implemento.descripcion && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">{implemento.descripcion}</p>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button className="btn-eliminar" onClick={() => handleDelete(implemento)}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredImplementos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || filterCompra || filterCategoria
            ? "No se encontraron implementos con los filtros aplicados"
            : "No hay implementos en el inventario"}
        </div>
      )}
    </div>
  )
}

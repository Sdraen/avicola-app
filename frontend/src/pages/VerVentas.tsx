"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ventasAPI } from "../services/api"
import type { Venta } from "../types"
import ModalEditarVenta from "../components/modals/ModalEditarVenta"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../utils/sweetAlert"
import { formatearFechaChilena } from "../utils/formatoFecha"

const VerVentas: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [ventaEdit, setVentaEdit] = useState<Venta | null>(null)

  const isAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("user") &&
    JSON.parse(localStorage.getItem("user")!).rol === "admin"

  const fetchVentas = async () => {
    try {
      setLoading(true)
      const response = await ventasAPI.getAll()
      const ventasData = Array.isArray(response.data) ? response.data : []
      setVentas(ventasData)
      setError("")
    } catch (err: any) {
      setError("Error al cargar las ventas")
      console.error("Error fetching ventas:", err)
      setVentas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVentas()
  }, [])

  const handleDelete = async (id: number) => {
    const result = await showDeleteConfirmation(
      "¿Eliminar venta?",
      "Esta acción devolverá las bandejas a estado disponible. ¿Está seguro?",
      "Sí, eliminar",
    )

    if (result) {
      try {
        showLoadingAlert("Eliminando venta...", "Por favor espere")
        await ventasAPI.delete(id)
        await fetchVentas()
        closeLoadingAlert()
        await showSuccessAlert(
          "¡Venta eliminada!",
          "La venta ha sido eliminada y las bandejas están disponibles nuevamente",
        )
      } catch (err) {
        closeLoadingAlert()
        await showErrorAlert("Error al eliminar", "No se pudo eliminar la venta. Inténtalo de nuevo.")
      }
    }
  }

  const totalVentas = ventas.reduce((sum, venta) => sum + venta.costo_total, 0)
  const totalBandejas = ventas.reduce((sum, venta) => sum + venta.cantidad_total, 0)

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-600">Cargando ventas...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">💰</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Ventas</h1>
            <p className="table-subtitle">
              Total: {ventas.length} ventas | {totalBandejas} bandejas | ${totalVentas.toLocaleString("es-CL")}
            </p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="tabla-aves">
          <thead>
            <tr>
              <th>
                <span className="th-content">
                  <span className="th-icon">👤</span>Cliente
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📅</span>Fecha
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🧺</span>Bandejas
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">💰</span>Total
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">⚙️</span>Acciones
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-4xl">💰</span>
                    <span>No hay ventas registradas</span>
                  </div>
                </td>
              </tr>
            ) : (
              ventas.map((venta) => (
                <tr key={venta.id_venta} className="table-row">
                  <td className="table-cell">{venta.cliente?.nombre || `Cliente ${venta.id_cliente}`}</td>
                  <td className="table-cell">
                    <span className="text-sm font-medium">{formatearFechaChilena(venta.fecha_venta)}</span>
                  </td>
                  <td className="table-cell">
                    <span className="cantidad-badge">{venta.cantidad_total}</span>
                  </td>
                  <td className="table-cell font-semibold text-green-600">
                    ${venta.costo_total.toLocaleString("es-CL")}
                  </td>
                  <td className="table-cell acciones-cell">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setVentaEdit(venta)} className="btn-editar" title="Editar venta">
                        ✏️ Editar
                      </button>
                      {isAdmin && (
                        <button
                          className="btn-eliminar"
                          onClick={() => handleDelete(venta.id_venta)}
                          title="Eliminar venta"
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {ventaEdit && (
        <ModalEditarVenta
          isOpen={true}
          venta={ventaEdit}
          onClose={() => setVentaEdit(null)}
          onUpdate={() => {
            fetchVentas()
            setVentaEdit(null)
          }}
        />
      )}
    </div>
  )
}

export default VerVentas

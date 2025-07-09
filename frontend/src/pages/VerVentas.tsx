"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ventasAPI } from "../services/api"
import type { Venta } from "../types"
import ModalEditarVenta from "../components/modals/ModalEditarVenta"
import Swal from "sweetalert2"

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
      const response = await ventasAPI.getAll()
      setVentas(response.data)
    } catch (err: any) {
      setError("Error al cargar las ventas")
      console.error("Error fetching ventas:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVentas()
  }, [])

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar venta?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    })

    if (confirm.isConfirmed) {
      try {
        await ventasAPI.delete(id)
        await fetchVentas()
        Swal.fire("Eliminado", "La venta ha sido eliminada", "success")
      } catch (err) {
        console.error("Error deleting venta:", err)
        Swal.fire("Error", "No se pudo eliminar la venta", "error")
      }
    }
  }

  const totalVentas = ventas.reduce((sum, venta) => sum + venta.costo_total, 0)

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando ventas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ver-aves-container">
        <div className="text-center text-red-600">{error}</div>
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
              Total de ventas: {ventas.length} | Ingresos: ${totalVentas.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="tabla-aves">
          <thead>
            <tr>
              <th><span className="th-content"><span className="th-icon">🆔</span>ID</span></th>
              <th><span className="th-content"><span className="th-icon">👤</span>Cliente</span></th>
              <th><span className="th-content"><span className="th-icon">📅</span>Fecha</span></th>
              <th><span className="th-content"><span className="th-icon">📦</span>Cantidad</span></th>
              <th><span className="th-content"><span className="th-icon">💰</span>Total</span></th>
              <th><span className="th-content"><span className="th-icon">⚙️</span>Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id_venta} className="table-row">
                <td className="table-cell id-cell">{venta.id_venta}</td>
                <td className="table-cell">{venta.cliente?.nombre || `Cliente ${venta.id_cliente}`}</td>
                <td className="table-cell">{new Date(venta.fecha_venta).toLocaleDateString()}</td>
                <td className="table-cell">
                  <span className="cantidad-badge">{venta.cantidad_total}</span>
                </td>
                <td className="table-cell font-semibold text-green-600">
                  ${venta.costo_total.toLocaleString()}
                </td>
                <td className="table-cell acciones-cell">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVentaEdit(venta)}
                      className="btn-editar"
                      title="Editar venta"
                    >
                      ✏️ Editar
                    </button>
                    {isAdmin && (
                          <button
                            className="btn-eliminar"
                            onClick={() => handleDelete(venta.id_venta)}
                            title="Eliminar registro"
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
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

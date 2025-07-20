"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { bandejasAPI } from "../services/api"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../utils/sweetAlert"
import type { Bandeja } from "../types"

const VerBandejas: React.FC = () => {
  const [bandejas, setBandejas] = useState<Bandeja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)

  const fetchBandejas = async () => {
    try {
      const response = await bandejasAPI.getAll()
      const data = Array.isArray(response.data?.data) ? response.data.data : []
      setBandejas(data)
    } catch (err) {
      console.error("Error cargando bandejas:", err)
      setError("Error al cargar las bandejas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBandejas()
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)
      setUserRole(parsed.rol)
    }
  }, [])

  const handleDelete = async (id_bandeja: number) => {
    const isConfirmed = await showDeleteConfirmation(
      "¿Eliminar bandeja?",
      `¿Estás seguro de que deseas eliminar la bandeja #${id_bandeja}? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
    )

    if (isConfirmed) {
      try {
        showLoadingAlert("Eliminando bandeja...", "Por favor espere")
        await bandejasAPI.delete(id_bandeja)
        setBandejas((prev) => prev.filter((b) => b.id_bandeja !== id_bandeja))
        closeLoadingAlert()
        await showSuccessAlert("¡Bandeja eliminada!", "La bandeja ha sido eliminada correctamente")
      } catch (err: any) {
        closeLoadingAlert();
        const errorMessage = err.response?.data?.error;

        if (errorMessage?.includes("asociada a una venta")) {
          await showErrorAlert("Error al eliminar", "No se puede eliminar la bandeja porque está asociada a una venta.")
        } else {
          await showErrorAlert("Error al eliminar", errorMessage || "No se pudo eliminar la bandeja. Inténtalo de nuevo.")
        }

        console.error("Error eliminando bandeja:", err);
      }
    }
  }

  if (loading) {
    return <div className="ver-aves-container text-center">Cargando bandejas...</div>
  }

  if (error) {
    return <div className="ver-aves-container text-center text-red-600">{error}</div>
  }

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🧺</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Bandejas</h1>
            <p className="table-subtitle">Total de bandejas: {bandejas.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="tabla-aves">
          <thead>
            <tr>
              <th>
                <span className="th-content">
                  <span className="th-icon">🆔</span>ID
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🥚</span>Tipo
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📏</span>Tamaño
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🔢</span>Cantidad
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📅</span>Fecha
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🏷️</span>Estado
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🛠️</span>Acciones
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {bandejas.map((b) => (
              <tr key={b.id_bandeja} className="table-row">
                <td className="table-cell">{b.id_bandeja}</td>
                <td className="table-cell">{b.tipo_huevo}</td>
                <td className="table-cell">{b.tamaño_huevo}</td>
                <td className="table-cell">{b.cantidad_huevos}</td>
                <td className="table-cell">{new Date(b.fecha_creacion).toLocaleDateString()}</td>
                <td className="table-cell">{b.estado}</td>
                <td className="table-cell acciones-cell">
                  {userRole === "admin" && (
                    <button className="btn-eliminar text-red-600" onClick={() => handleDelete(b.id_bandeja)}>
                      🗑️ Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VerBandejas

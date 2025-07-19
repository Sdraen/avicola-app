"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { aveClinicaAPI } from "../services/api"
import type { AveFallecida } from "../types"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../utils/sweetAlert"

const VerAvesFallecidas: React.FC = () => {
  const [avesFallecidas, setAvesFallecidas] = useState<AveFallecida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)

  const fetchAvesFallecidas = async () => {
    try {
      const response = await aveClinicaAPI.getAvesFallecidas()
      setAvesFallecidas(response.data)
    } catch (err: any) {
      setError("Error al cargar las aves fallecidas")
      console.error("Error fetching aves fallecidas:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvesFallecidas()
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)
      setUserRole(parsed.rol)
    }
  }, [])

  const handleEliminarRegistro = async (id_ave: number, id_anillo: string) => {
    const result = await showDeleteConfirmation(
      "¿Eliminar registro de fallecimiento?",
      `¿Estás seguro de que deseas eliminar el registro de fallecimiento del ave #${id_anillo}? Esta acción permitirá registrar nuevos tratamientos para esta ave.`,
      "Sí, eliminar registro",
    )

    if (result) {
      try {
        showLoadingAlert("Eliminando registro...", "Por favor espere")

        await aveClinicaAPI.eliminarFallecimiento(id_ave)
        setAvesFallecidas((prev) => prev.filter((ave) => ave.id_ave !== id_ave))

        closeLoadingAlert()
        await showSuccessAlert("¡Registro eliminado!", "El registro de fallecimiento ha sido eliminado correctamente")
      } catch (err: any) {
        closeLoadingAlert()
        await showErrorAlert("Error al eliminar", "No se pudo eliminar el registro. Inténtalo de nuevo.")
        console.error("Delete error:", err)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando aves fallecidas...</div>
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
          <div className="header-icon">💀</div>
          <div className="header-text">
            <h1 className="table-title">Aves Fallecidas</h1>
            <p className="table-subtitle">Total de aves fallecidas: {avesFallecidas.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        {avesFallecidas.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🕊️</div>
            <p className="text-gray-600 text-lg">No hay aves fallecidas registradas</p>
            <p className="text-gray-500">¡Eso es una buena noticia!</p>
          </div>
        ) : (
          <table className="tabla-aves">
            <thead>
              <tr>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🆔</span>
                    ID Ave
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🏷️</span>
                    ID Anillo
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🎨</span>
                    Color Anillo
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🧬</span>
                    Raza
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📅</span>
                    Fecha Fallecimiento
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📝</span>
                    Motivo
                  </span>
                </th>
                {userRole === "admin" && (
                  <th>
                    <span className="th-content">
                      <span className="th-icon">🛠️</span>
                      Acciones
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {avesFallecidas.map((aveFallecida) => (
                <tr key={aveFallecida.id_ave} className="table-row">
                  <td className="table-cell id-cell">{aveFallecida.id_ave}</td>
                  <td className="table-cell">{aveFallecida.ave?.id_anillo || "N/A"}</td>
                  <td className="table-cell">{aveFallecida.ave?.color_anillo || "N/A"}</td>
                  <td className="table-cell especie-cell">{aveFallecida.ave?.raza || "N/A"}</td>
                  <td className="table-cell">{formatDate(aveFallecida.fecha)}</td>
                  <td className="table-cell">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">{aveFallecida.motivo}</span>
                  </td>
                  {userRole === "admin" && (
                    <td className="table-cell acciones-cell">
                      <button
                        className="btn-eliminar text-xs px-2 py-1"
                        onClick={() =>
                          handleEliminarRegistro(aveFallecida.id_ave, aveFallecida.ave?.id_anillo || "N/A")
                        }
                        title="Eliminar registro de fallecimiento"
                      >
                        🗑️ Eliminar Registro
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default VerAvesFallecidas

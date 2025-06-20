"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { huevosAPI } from "../services/api"
import type { Huevo } from "../types"
import ModalEditarHuevo from "../components/modals/ModalEditarHuevo"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../utils/sweetAlert"

const VerHuevos: React.FC = () => {
  const [huevos, setHuevos] = useState<Huevo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedHuevoId, setSelectedHuevoId] = useState<number | null>(null)

  const fetchHuevos = async () => {
    try {
      const response = await huevosAPI.getAll()
      setHuevos(response.data)
    } catch (err) {
      console.error("Error al cargar los huevos", err)
      setError("Error al cargar los huevos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHuevos()
  }, [])

  const handleEdit = (huevoId: number) => {
    setSelectedHuevoId(huevoId)
    setIsEditModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedHuevoId(null)
  }

  const handleUpdateSuccess = () => {
    fetchHuevos() // Recargar la lista después de actualizar
  }

  const handleDelete = async (id: number) => {
    const result = await showDeleteConfirmation(
      "¿Eliminar registro?",
      `¿Estás seguro de que deseas eliminar el registro de huevos #${id}? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
    )

    if (result.isConfirmed) {
      try {
        showLoadingAlert("Eliminando registro...", "Por favor espere")

        await huevosAPI.delete(id)
        setHuevos((prev) => prev.filter((h) => h.id_huevo !== id))

        closeLoadingAlert()
        await showSuccessAlert("¡Registro eliminado!", "El registro de huevos ha sido eliminado correctamente")
      } catch (err) {
        closeLoadingAlert()
        await showErrorAlert("Error al eliminar", "No se pudo eliminar el registro. Inténtalo de nuevo.")
        console.error("Error al eliminar el registro", err)
      }
    }
  }

  const isAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("user") &&
    JSON.parse(localStorage.getItem("user")!).rol === "admin"

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
            <span className="text-gray-600">Cargando registros de huevos...</span>
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
          <div className="header-icon">🥚</div>
          <div className="header-text">
            <h1 className="table-title">Registros de Huevos</h1>
            <p className="table-subtitle">Total: {huevos.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="tabla-aves">
          <thead>
            <tr>
              <th>
                <span className="th-content">
                  <span className="th-icon">🆔</span>
                  ID
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🏠</span>
                  Jaula
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📅</span>
                  Fecha
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🥚</span>
                  Total
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🟤</span>
                  Café
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">⚪</span>
                  Blanco
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📝</span>
                  Observaciones
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🛠️</span>
                  Acciones
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {huevos.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-4xl">🥚</span>
                    <span>No hay registros de huevos disponibles</span>
                  </div>
                </td>
              </tr>
            ) : (
              huevos.map((h) => {
                const totalCafe =
                  h.huevos_cafe_chico + h.huevos_cafe_mediano + h.huevos_cafe_grande + h.huevos_cafe_jumbo
                const totalBlanco =
                  h.huevos_blanco_chico + h.huevos_blanco_mediano + h.huevos_blanco_grande + h.huevos_blanco_jumbo

                return (
                  <tr key={h.id_huevo} className="table-row">
                    <td className="table-cell id-cell">{h.id_huevo}</td>
                    <td className="table-cell">{h.jaula?.descripcion || `Jaula ${h.id_jaula}`}</td>
                    <td className="table-cell">{new Date(h.fecha_recoleccion).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <span className="cantidad-badge">{h.cantidad_total}</span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {totalCafe}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {totalBlanco}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="max-w-xs truncate" title={h.observaciones || ""}>
                        {h.observaciones || "-"}
                      </span>
                    </td>
                    <td className="table-cell acciones-cell">
                      <div className="flex items-center space-x-2">
                        <button className="btn-editar" onClick={() => handleEdit(h.id_huevo)} title="Editar registro">
                          ✏️ Editar
                        </button>
                        {isAdmin && (
                          <button
                            className="btn-eliminar"
                            onClick={() => handleDelete(h.id_huevo)}
                            title="Eliminar registro"
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {isEditModalOpen && selectedHuevoId && (
        <ModalEditarHuevo
          isOpen={isEditModalOpen}
          huevoId={selectedHuevoId}
          onClose={handleCloseModal}
          onUpdate={handleUpdateSuccess}
        />
      )}
    </div>
  )
}

export default VerHuevos

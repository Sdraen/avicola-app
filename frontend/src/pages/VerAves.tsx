"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { avesAPI } from "../services/api"
import type { Ave } from "../types"
import ModalEditarAve from "../components/modals/ModalEditarAve"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../utils/sweetAlert"

const VerAves: React.FC = () => {
  const [aves, setAves] = useState<Ave[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAveId, setSelectedAveId] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  const fetchAves = async () => {
    try {
      const response = await avesAPI.getAll()
      setAves(response.data)
    } catch (err: any) {
      setError("Error al cargar las aves")
      console.error("Error fetching aves:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAves()
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)
      setUserRole(parsed.rol)
    }
  }, [])

  const handleEdit = (aveId: number) => {
    setSelectedAveId(aveId)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedAveId(null)
  }

  const handleDelete = async (id_ave: number) => {
    const result = await showDeleteConfirmation(
      "¿Eliminar ave?",
      `¿Estás seguro de que deseas eliminar el ave #${id_ave}? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
    )

    if (result.isConfirmed) {
      try {
        showLoadingAlert("Eliminando ave...", "Por favor espere")

        await avesAPI.delete(id_ave)
        setAves((prev) => prev.filter((ave) => ave.id_ave !== id_ave))

        closeLoadingAlert()
        await showSuccessAlert("¡Ave eliminada!", "El ave ha sido eliminada correctamente")
      } catch (err: any) {
        closeLoadingAlert()
        await showErrorAlert("Error al eliminar", "No se pudo eliminar el ave. Inténtalo de nuevo.")
        console.error("Delete error:", err)
      }
    }
  }

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando aves...</div>
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
          <div className="header-icon">🐓</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Aves</h1>
            <p className="table-subtitle">Total de aves registradas: {aves.length}</p>
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
                  Edad
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🥚</span>
                  Estado Puesta
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
                  <span className="th-icon">🛠️</span>
                  Acciones
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {aves.map((ave) => (
              <tr key={ave.id_ave} className="table-row">
                <td className="table-cell id-cell">{ave.id_ave}</td>
                <td className="table-cell">{ave.id_anillo}</td>
                <td className="table-cell">{ave.color_anillo}</td>
                <td className="table-cell especie-cell">{ave.raza}</td>
                <td className="table-cell">{ave.edad}</td>
                <td className="table-cell">
                  <span className="cantidad-badge">{ave.estado_puesta}</span>
                </td>
                <td className="table-cell">{ave.jaula?.codigo_jaula || ave.jaula?.descripcion || ave.id_jaula}</td>
                <td className="table-cell acciones-cell">
                  <button className="btn-editar" onClick={() => handleEdit(ave.id_ave)}>
                    ✏️ Editar
                  </button>
                  {userRole === "admin" && (
                    <button className="btn-eliminar ml-2 text-red-600" onClick={() => handleDelete(ave.id_ave)}>
                      🗑️ Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      <ModalEditarAve
        isOpen={isEditModalOpen}
        aveId={selectedAveId!}
        onClose={handleCloseEditModal}
        onUpdate={fetchAves}
      />
    </div>
  )
}

export default VerAves

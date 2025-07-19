"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { avesAPI } from "../services/api"
import type { Ave } from "../types"
import ModalEditarAve from "../components/modals/ModalEditarAve"
import ModalHistorialClinico from "../components/modals/ModalHistorialClinico"
import ModalRegistroClinico from "../components/modals/ModalRegistroClinico"
import ModalRegistrarFallecimiento from "../components/modals/ModalRegistrarFallecimiento"
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
  const [selectedAve, setSelectedAve] = useState<Ave | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isHistorialModalOpen, setIsHistorialModalOpen] = useState(false)
  const [isRegistroClinicoModalOpen, setIsRegistroClinicoModalOpen] = useState(false)
  const [isFallecimientoModalOpen, setIsFallecimientoModalOpen] = useState(false)
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

  const handleHistorialClinico = (ave: Ave) => {
    setSelectedAve(ave)
    setIsHistorialModalOpen(true)
  }

  const handleCloseHistorialModal = () => {
    setIsHistorialModalOpen(false)
    setSelectedAve(null)
  }

  const handleRegistroClinico = (ave: Ave) => {
    setSelectedAve(ave)
    setIsRegistroClinicoModalOpen(true)
  }

  const handleCloseRegistroClinicoModal = () => {
    setIsRegistroClinicoModalOpen(false)
    setSelectedAve(null)
  }

  const handleRegistrarFallecimiento = (ave: Ave) => {
    setSelectedAve(ave)
    setIsFallecimientoModalOpen(true)
  }

  const handleCloseFallecimientoModal = () => {
    setIsFallecimientoModalOpen(false)
    setSelectedAve(null)
  }

  const handleDelete = async (id_ave: number) => {
    const result = await showDeleteConfirmation(
      "¿Eliminar ave?",
      `¿Estás seguro de que deseas eliminar el ave #${id_ave}? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
    )

    if (result) {
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

  const handleModalSuccess = () => {
    fetchAves()
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
                  <div className="flex flex-wrap gap-1">
                    <button
                      className="btn-editar text-xs px-2 py-1"
                      onClick={() => handleEdit(ave.id_ave)}
                      title="Editar ave"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      className="btn-info text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleHistorialClinico(ave)}
                      title="Ver historial clínico"
                    >
                      🏥 Historial
                    </button>

                    <button
                      className="btn-success text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => handleRegistroClinico(ave)}
                      title="Nuevo registro clínico"
                    >
                      🩺 Tratamiento
                    </button>

                    <button
                      className="btn-warning text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleRegistrarFallecimiento(ave)}
                      title="Registrar fallecimiento"
                    >
                      💀 Fallecimiento
                    </button>

                    {userRole === "admin" && (
                      <button
                        className="btn-eliminar text-xs px-2 py-1 text-red-600"
                        onClick={() => handleDelete(ave.id_ave)}
                        title="Eliminar ave"
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
      <ModalEditarAve
        isOpen={isEditModalOpen}
        aveId={selectedAveId!}
        onClose={handleCloseEditModal}
        onUpdate={fetchAves}
      />

      {/* Modal de historial clínico */}
      {selectedAve && (
        <ModalHistorialClinico
          isOpen={isHistorialModalOpen}
          aveId={selectedAve.id_ave}
          aveInfo={{
            id_anillo: selectedAve.id_anillo,
            raza: selectedAve.raza,
            color_anillo: selectedAve.color_anillo,
          }}
          onClose={handleCloseHistorialModal}
        />
      )}

      {/* Modal de registro clínico */}
      {selectedAve && (
        <ModalRegistroClinico
          isOpen={isRegistroClinicoModalOpen}
          aveId={selectedAve.id_ave}
          aveInfo={{
            id_anillo: selectedAve.id_anillo,
            raza: selectedAve.raza,
            color_anillo: selectedAve.color_anillo,
            id_jaula: selectedAve.id_jaula,
          }}
          onClose={handleCloseRegistroClinicoModal}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Modal de fallecimiento */}
      {selectedAve && (
        <ModalRegistrarFallecimiento
          isOpen={isFallecimientoModalOpen}
          aveId={selectedAve.id_ave}
          onClose={handleCloseFallecimientoModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}

export default VerAves

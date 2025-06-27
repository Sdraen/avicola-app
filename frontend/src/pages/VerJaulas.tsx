"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { jaulasAPI } from "../services/api"
import type { Jaula } from "../types"
import ModalEditarJaula from "../components/modals/ModalEditarJaula"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
} from "../utils/sweetAlert"

const VerJaulas: React.FC = () => {
  const [jaulas, setJaulas] = useState<Jaula[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [jaulaSeleccionada, setJaulaSeleccionada] = useState<Jaula | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchJaulas()
  }, [])

  const fetchJaulas = async () => {
    try {
      const response = await jaulasAPI.getAll()
      setJaulas(response.data)
    } catch (err: any) {
      setError("Error al cargar las jaulas")
      console.error("Error fetching jaulas:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (jaula: Jaula) => {
    setJaulaSeleccionada(jaula)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setJaulaSeleccionada(null)
  }

  const handleDelete = async (jaula: Jaula) => {
    const numAves = jaula.aves?.length || 0

    if (numAves > 0) {
      showErrorAlert(
        "No se puede eliminar",
        `Esta jaula tiene ${numAves} ave(s). Mueve las aves antes de eliminar la jaula.`,
      )
      return
    }

    const confirmed = await showDeleteConfirmation(
      "¿Eliminar jaula?",
      `¿Estás seguro de que deseas eliminar la jaula ${jaula.codigo_jaula}?`,
    )

    if (confirmed) {
      try {
        await jaulasAPI.delete(jaula.id_jaula)
        showSuccessAlert("¡Eliminada!", "La jaula ha sido eliminada correctamente.")
        fetchJaulas()
      } catch (err: any) {
        showErrorAlert("Error", err.response?.data?.error || "Error al eliminar la jaula")
      }
    }
  }

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando jaulas...</div>
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
          <div className="header-icon">🏠</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Jaulas</h1>
            <p className="table-subtitle">Total de jaulas registradas: {jaulas.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="tabla-aves">
          <thead>
            <tr>
              <th><span className="th-content"><span className="th-icon">🆔</span>ID</span></th>
              <th><span className="th-content"><span className="th-icon">🔢</span>Código</span></th>
              <th><span className="th-content"><span className="th-icon">📝</span>Descripción</span></th>
              <th><span className="th-content"><span className="th-icon">🏊</span>Estanque</span></th>
              <th><span className="th-content"><span className="th-icon">🐓</span>Aves</span></th>
              <th><span className="th-content"><span className="th-icon">📊</span>Ocupación</span></th>
              <th><span className="th-content"><span className="th-icon">⚙️</span>Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {jaulas.map((jaula) => {
              const numAves = jaula.aves?.length || 0
              const ocupacion = Math.round((numAves / 20) * 100)

              return (
                <tr key={jaula.id_jaula} className="table-row">
                  <td className="table-cell id-cell">{jaula.id_jaula}</td>
                  <td className="table-cell">
                    <span className="codigo-badge">{jaula.codigo_jaula}</span>
                  </td>
                  <td className="table-cell especie-cell">{jaula.descripcion || `Jaula ${jaula.codigo_jaula}`}</td>
                  <td className="table-cell">{jaula.id_estanque}</td>
                  <td className="table-cell">
                    <span className="cantidad-badge">{numAves}</span>
                  </td>
                  <td className="table-cell">
                    <div className="ocupacion-container">
                      <div className="ocupacion-bar">
                        <div
                          className={`ocupacion-fill ${
                            ocupacion >= 90
                              ? "ocupacion-alta"
                              : ocupacion >= 70
                              ? "ocupacion-media"
                              : "ocupacion-baja"
                          }`}
                          style={{ width: `${ocupacion}%` }}
                        ></div>
                      </div>
                      <span className="ocupacion-text">{ocupacion}%</span>
                    </div>
                  </td>
                  <td className="table-cell acciones-cell">
                    <button className="btn-editar" onClick={() => handleEdit(jaula)}>
                      ✏️ Editar
                    </button>
                    <button className="btn-eliminar ml-2 text-red-600" onClick={() => handleDelete(jaula)}>
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal edición */}
      <ModalEditarJaula
        isOpen={isEditModalOpen}
        jaula={jaulaSeleccionada}
        onClose={handleCloseEditModal}
        onJaulaUpdated={fetchJaulas}
      />
    </div>
  )
}

export default VerJaulas

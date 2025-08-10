"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { jaulasAPI } from "../services/api"
import type { Jaula } from "../types"
import ModalEditarJaula from "../components/modals/ModalEditarJaula"
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from "../utils/sweetAlert"

const VerJaulas: React.FC = () => {
  const [jaulas, setJaulas] = useState<Jaula[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [jaulaSeleccionada, setJaulaSeleccionada] = useState<Jaula | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Cálculos para paginación
  const totalPages = Math.ceil(jaulas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentJaulas = jaulas.slice(startIndex, endIndex)

  // Funciones de navegación
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
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
    <div className="ver-aves-container flex flex-col min-h-screen">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🏠</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Jaulas</h1>
            <p className="table-subtitle">
              Total de jaulas: {jaulas.length} | Mostrando {startIndex + 1}-{Math.min(endIndex, jaulas.length)} de{" "}
              {jaulas.length}
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor de tabla que crece para ocupar el espacio disponible */}
      <div className="flex-1 flex flex-col">
        <div className="table-container flex-1">
          <table className="tabla-aves">
            <thead>
              <tr>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🔢</span>
                    Código
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📝</span>
                    Descripción
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🐓</span>
                    Aves
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📊</span>
                    Ocupación
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">⚙️</span>
                    Acciones
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentJaulas.map((jaula) => {
                const numAves = jaula.aves?.length || 0
                const ocupacion = Math.round((numAves / 20) * 100)
                return (
                  <tr key={jaula.id_jaula} className="table-row">
                    <td className="table-cell">
                      <span className="codigo-badge">{jaula.codigo_jaula}</span>
                    </td>
                    <td className="table-cell especie-cell">{jaula.descripcion || `Jaula ${jaula.codigo_jaula}`}</td>
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

        {/* Paginación fija en la parte inferior */}
        <div className="mt-auto border-t bg-white">
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <div className="text-sm text-gray-700">
                Página <span className="font-medium">{currentPage}</span> de{" "}
                <span className="font-medium">{totalPages}</span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Botón Anterior */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  ← Anterior
                </button>

                {/* Números de página */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
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

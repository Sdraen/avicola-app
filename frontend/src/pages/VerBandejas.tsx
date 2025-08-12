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
import { formatearFechaChilena } from "../utils/formatoFecha"

const VerBandejas: React.FC = () => {
  const [bandejas, setBandejas] = useState<Bandeja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Cálculos para paginación
  const totalPages = Math.ceil(bandejas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBandejas = bandejas.slice(startIndex, endIndex)

  // Navegación
  const goToPage = (page: number) => setCurrentPage(page)
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1)

  const handleDelete = async (id_bandeja: number) => {
    const isConfirmed = await showDeleteConfirmation(
      "¿Eliminar bandeja?",
      `¿Estás seguro de que deseas eliminar la bandeja #${id_bandeja}? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
    )
    if (!isConfirmed) return

    try {
      showLoadingAlert("Eliminando bandeja...", "Por favor espere")
      await bandejasAPI.delete(id_bandeja)
      setBandejas((prev) => prev.filter((b) => b.id_bandeja !== id_bandeja))
      closeLoadingAlert()
      await showSuccessAlert("¡Bandeja eliminada!", "La bandeja ha sido eliminada correctamente")
    } catch (err: any) {
      closeLoadingAlert()
      const errorMessage = err.response?.data?.error
      if (errorMessage?.includes("asociada a una venta")) {
        await showErrorAlert("Error al eliminar", "No se puede eliminar la bandeja porque está asociada a una venta.")
      } else {
        await showErrorAlert("Error al eliminar", errorMessage || "No se pudo eliminar la bandeja. Inténtalo de nuevo.")
      }
      console.error("Error eliminando bandeja:", err)
    }
  }

  if (loading) return <div className="ver-aves-container text-center">Cargando bandejas...</div>
  if (error) return <div className="ver-aves-container text-center text-red-600">{error}</div>

  return (
    <div className="ver-aves-container flex flex-col min-h-screen">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🧺</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Bandejas</h1>
            <p className="table-subtitle">
              Total de bandejas: {bandejas.length} | Mostrando {startIndex + 1}-{Math.min(endIndex, bandejas.length)} de{" "}
              {bandejas.length}
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor de tabla */}
      <div className="flex-1 flex flex-col">
        <div className="table-container flex-1">
          <table className="tabla-aves">
            <thead>
              <tr>
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
                {userRole === "admin" && (
                  <th>
                    <span className="th-content">
                      <span className="th-icon">🛠️</span>Acciones
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentBandejas.map((b) => (
                <tr key={b.id_bandeja} className="table-row">
                  <td className="table-cell">{b.tipo_huevo}</td>
                  <td className="table-cell">{b.tamaño_huevo}</td>
                  <td className="table-cell">{b.cantidad_huevos}</td>
                  <td className="table-cell">
                    {b.fecha_creacion ? formatearFechaChilena(String(b.fecha_creacion)) : ""}
                  </td>
                  <td
                    className={`table-cell font-semibold ${
                      b.estado === "vendida" ? "text-red-600" : b.estado === "disponible" ? "text-green-600" : ""
                    }`}
                  >
                    {b.estado}
                  </td>
                  {userRole === "admin" && (
                    <td className="table-cell acciones-cell">
                      <button className="btn-eliminar text-red-600" onClick={() => handleDelete(b.id_bandeja)}>
                        🗑️ Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-auto border-t bg-white">
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <div className="text-sm text-gray-700">
                Página <span className="font-medium">{currentPage}</span> de{" "}
                <span className="font-medium">{totalPages}</span>
              </div>

              <div className="flex items-center space-x-2">
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

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) pageNumber = i + 1
                    else if (currentPage <= 3) pageNumber = i + 1
                    else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + i
                    else pageNumber = currentPage - 2 + i

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
    </div>
  )
}

export default VerBandejas

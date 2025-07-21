"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { huevosAPI } from "../services/api"
import type { Huevo } from "../types"
import ModalEditarHuevo from "../components/modals/ModalEditarHuevo"
import ModalArmarBandeja from "../components/modals/ModalArmarBandeja"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../utils/sweetAlert"

const VerHuevos: React.FC = () => {
  const [huevos, setHuevos] = useState<Huevo[]>([])
  const [filteredHuevos, setFilteredHuevos] = useState<Huevo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedHuevoId, setSelectedHuevoId] = useState<number | null>(null)
  const [isModalBandejaOpen, setIsModalBandejaOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [filterJaula, setFilterJaula] = useState("")
  const [filterFecha, setFilterFecha] = useState("")

  const fetchHuevos = async () => {
    try {
      const response = await huevosAPI.getAll()
      const huevosData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : []

      const huevosConStock = huevosData.filter((huevo: Huevo) => {
        const totalDisponible =
          (huevo.huevos_cafe_chico || 0) +
          (huevo.huevos_cafe_mediano || 0) +
          (huevo.huevos_cafe_grande || 0) +
          (huevo.huevos_cafe_jumbo || 0) +
          (huevo.huevos_blanco_chico || 0) +
          (huevo.huevos_blanco_mediano || 0) +
          (huevo.huevos_blanco_grande || 0) +
          (huevo.huevos_blanco_jumbo || 0)
        return totalDisponible > 0
      })

      setHuevos(huevosConStock)
      setFilteredHuevos(huevosConStock)
    } catch (err) {
      setError("Error al cargar los huevos")
      setHuevos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHuevos()
  }, [])

  useEffect(() => {
    const filtered = huevos.filter((huevo) => {
      const matchesSearch =
        huevo.jaula?.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        huevo.observaciones?.toLowerCase().includes(search.toLowerCase())

      const matchesJaula =
        !filterJaula || huevo.jaula?.descripcion?.toLowerCase().includes(filterJaula.toLowerCase())

      const matchesFecha =
        !filterFecha || formatDate(huevo.fecha_recoleccion) === filterFecha

      return matchesSearch && matchesJaula && matchesFecha
    })
    setFilteredHuevos(filtered)
  }, [search, filterJaula, filterFecha, huevos])

  const handleEdit = (huevoId: number) => {
    setSelectedHuevoId(huevoId)
    setIsEditModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedHuevoId(null)
  }

  const handleUpdateSuccess = () => {
    fetchHuevos()
  }

  const handleDelete = async (id: number) => {
    const result = await showDeleteConfirmation(
      "¿Eliminar registro?",
      `¿Estás seguro de que deseas eliminar el registro de huevos? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
    )

    if (result) {
      try {
        showLoadingAlert("Eliminando registro...", "Por favor espere")
        await huevosAPI.delete(id)
        setHuevos((prev) => prev.filter((h) => h.id_huevo !== id))
        closeLoadingAlert()
        await showSuccessAlert("¡Registro eliminado!", "El registro de huevos ha sido eliminado correctamente")
      } catch (err) {
        closeLoadingAlert()
        await showErrorAlert("Error al eliminar", "No se pudo eliminar el registro. Inténtalo de nuevo.")
      }
    }
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return "-"
    if (dateString.includes("T")) {
      return dateString.split("T")[0]
    }
    const date = new Date(dateString + "T00:00:00")
    return date.toISOString().split("T")[0]
  }

  const isAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("user") &&
    JSON.parse(localStorage.getItem("user")!).rol === "admin"

  const uniqueJaulas = Array.from(new Set(huevos.map(h => h.jaula?.descripcion || "")))
  const uniqueFechas = Array.from(new Set(huevos.map(h => formatDate(h.fecha_recoleccion))))

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
            <p className="table-subtitle">Total: {filteredHuevos.length}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalBandejaOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
          >
            🧺 Armar Bandeja
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="🔍 Buscar por jaula u observaciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border rounded-md text-sm"
        />
        <select value={filterJaula} onChange={(e) => setFilterJaula(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
          <option value="">Todas las jaulas</option>
          {uniqueJaulas.map((j, i) => (
            <option key={i} value={j}>
              {j || `Jaula sin nombre`}
            </option>
          ))}
        </select>
        <select value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
          <option value="">Todas las fechas</option>
          {uniqueFechas.map((f, i) => (
            <option key={i} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {filteredHuevos.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <span className="text-6xl">🥚</span>
              <h3 className="text-xl font-medium text-gray-900">No hay registros de huevos disponibles</h3>
              <p className="text-gray-500">Los registros aparecerán aquí cuando tengan stock disponible</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHuevos.map((huevo) => {
              const totalCafe =
                (huevo.huevos_cafe_chico || 0) +
                (huevo.huevos_cafe_mediano || 0) +
                (huevo.huevos_cafe_grande || 0) +
                (huevo.huevos_cafe_jumbo || 0)
              const totalBlanco =
                (huevo.huevos_blanco_chico || 0) +
                (huevo.huevos_blanco_mediano || 0) +
                (huevo.huevos_blanco_grande || 0) +
                (huevo.huevos_blanco_jumbo || 0)
              const totalDisponibles = totalCafe + totalBlanco

              return (
                <div
                  key={huevo.id_huevo}
                  className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {huevo.jaula?.descripcion || `Jaula ${huevo.id_jaula}`}
                        </h3>
                        <p className="text-sm text-gray-500">{formatDate(huevo.fecha_recoleccion)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(huevo.id_huevo)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar registro"
                        >
                          ✏️
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(huevo.id_huevo)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar registro"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-blue-600">{totalDisponibles}</div>
                          <div className="text-xs text-blue-500 font-medium">Total</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="bg-amber-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-amber-700">{totalCafe}</div>
                          <div className="text-xs text-amber-600 font-medium">🟤 Café</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-gray-700">{totalBlanco}</div>
                          <div className="text-xs text-gray-600 font-medium">⚪ Blanco</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {totalCafe > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-amber-700 mb-2">🟤 Huevos Café</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {huevo.huevos_cafe_chico > 0 && (
                              <div className="bg-amber-50 rounded p-2 text-center">
                                <div className="text-sm font-bold text-amber-700">{huevo.huevos_cafe_chico}</div>
                                <div className="text-xs text-amber-600">Chico</div>
                              </div>
                            )}
                            {huevo.huevos_cafe_mediano > 0 && (
                              <div className="bg-amber-50 rounded p-2 text-center">
                                <div className="text-sm font-bold text-amber-700">{huevo.huevos_cafe_mediano}</div>
                                <div className="text-xs text-amber-600">Mediano</div>
                              </div>
                            )}
                            {huevo.huevos_cafe_grande > 0 && (
                              <div className="bg-amber-50 rounded p-2 text-center">
                                <div className="text-sm font-bold text-amber-700">{huevo.huevos_cafe_grande}</div>
                                <div className="text-xs text-amber-600">Grande</div>
                              </div>
                            )}
                            {huevo.huevos_cafe_jumbo > 0 && (
                              <div className="bg-amber-50 rounded p-2 text-center">
                                <div className="text-sm font-bold text-amber-700">{huevo.huevos_cafe_jumbo}</div>
                                <div className="text-xs text-amber-600">Jumbo</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {totalBlanco > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">⚪ Huevos Blanco</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {huevo.huevos_blanco_chico > 0 && (
                              <div className="bg-gray-50 rounded p-2 text-center">
                                <div className="text-sm font-bold text-gray-700">{huevo.huevos_blanco_chico}</div>
                                <div className="text-xs text-gray-600">Chico</div>
                              </div>
                            )}
                            {huevo.huevos_blanco_mediano > 0 && (
                              <div className="bg-gray-50 rounded p-2 text-center">
                                <div className="text-sm font-bold text-gray-700">{huevo.huevos_blanco_mediano}</div>
                                <div className="text-xs text-gray-600">Mediano</div>
                              </div>
                            )}
                            {huevo.huevos_blanco_grande > 0 && (
                              <div className="bg-gray-50 rounded p-2 text-center">
                                <div className="text-sm font-bold text-gray-700">{huevo.huevos_blanco_grande}</div>
                                <div className="text-xs text-gray-600">Grande</div>
                              </div>
                            )}
                            {huevo.huevos_blanco_jumbo > 0 && (
                              <div className="bg-gray-50 rounded p-2 text-center">
                                <div className="text-sm font-bold text-gray-700">{huevo.huevos_blanco_jumbo}</div>
                                <div className="text-xs text-gray-600">Jumbo</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {huevo.observaciones && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Observaciones:</span> {huevo.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isEditModalOpen && selectedHuevoId && (
        <ModalEditarHuevo
          isOpen={isEditModalOpen}
          huevoId={selectedHuevoId}
          onClose={handleCloseModal}
          onUpdate={handleUpdateSuccess}
        />
      )}

      {isModalBandejaOpen && (
        <ModalArmarBandeja
          isOpen={isModalBandejaOpen}
          onClose={() => setIsModalBandejaOpen(false)}
          onUpdate={handleUpdateSuccess}
        />
      )}
    </div>
  )
}

export default VerHuevos

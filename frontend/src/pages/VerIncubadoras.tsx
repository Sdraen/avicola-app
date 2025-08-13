"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { incubadorasAPI } from "../services/api"
import type { Incubadora } from "../types"
import ModalEditarIncubadora from "../components/modals/ModalEditarIncubadora"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../utils/sweetAlert"

const VerIncubadoras: React.FC = () => {
  const navigate = useNavigate()

  const [incubadoras, setIncubadoras] = useState<Incubadora[]>([])
  const [filtered, setFiltered] = useState<Incubadora[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)

  // Filtros
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("")

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal edición
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selected, setSelected] = useState<Incubadora | null>(null)

  const fetchIncubadoras = async () => {
    try {
      setLoading(true)
      const { data } = await incubadorasAPI.getAll()
      setIncubadoras(data)
      setFiltered(data)
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar las incubadoras")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncubadoras()
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)
      setUserRole(parsed.rol)
    }
  }, [])

  // Filtro + búsqueda
  useEffect(() => {
    const f = incubadoras.filter((i) => {
      const matchesSearch = i.nombre.toLowerCase().includes(search.toLowerCase())
      const matchesEstado = !filterEstado || (i.estado || "").toLowerCase() === filterEstado.toLowerCase()
      return matchesSearch && matchesEstado
    })
    setFiltered(f)
    setCurrentPage(1)
  }, [search, filterEstado, incubadoras])

  // Cálculos de paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filtered.slice(startIndex, endIndex)

  const goToPage = (page: number) => setCurrentPage(page)
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1)

  const getEstadoClass = (estado?: string) => {
    switch ((estado || "").toLowerCase()) {
      case "activa":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactiva":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const openEdit = (inc: Incubadora) => {
    setSelected(inc)
    setIsEditOpen(true)
  }
  const closeEdit = () => {
    setIsEditOpen(false)
    setSelected(null)
  }

  const handleDeleted = async (inc: Incubadora) => {
    const ok = await showDeleteConfirmation(
      "¿Eliminar incubadora?",
      `¿Estás seguro de eliminar "${inc.nombre}"? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
    )
    if (!ok) return

    try {
      showLoadingAlert("Eliminando incubadora...", "Por favor espere")
      await incubadorasAPI.delete(inc.id_incubadora)
      await fetchIncubadoras()
      closeLoadingAlert()
      await showSuccessAlert("¡Incubadora eliminada!", `"${inc.nombre}" ha sido eliminada correctamente`)
    } catch (err) {
      console.error(err)
      closeLoadingAlert()
      await showErrorAlert("Error al eliminar", "No se pudo eliminar la incubadora. Inténtalo de nuevo.")
    }
  }

  const handleSaved = async () => {
    await fetchIncubadoras()
    await showSuccessAlert("Cambios guardados", "La incubadora se actualizó correctamente")
  }

  if (loading) return <div className="text-center py-4">Cargando incubadoras...</div>
  if (error) return <div className="text-center text-red-600 py-4">{error}</div>

  const uniqueEstados = Array.from(new Set(incubadoras.map((i) => i.estado || ""))).filter(Boolean)

  return (
    <div className="ver-aves-container">
      {/* Encabezado */}
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🧰</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Incubadoras</h1>
            <p className="table-subtitle">
              Total: {filtered.length} | Mostrando {Math.min(startIndex + 1, filtered.length)}-
              {Math.min(endIndex, filtered.length)} de {filtered.length}
            </p>
          </div>
        </div>

        {/* Botón compacto */}
        <button
          type="button"
          title="Registrar Incubadora"
          onClick={() => navigate("/registrar-incubadora")}
          className="inline-flex w-auto items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>＋</span>
          <span>Registrar Incubadora</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border rounded-md text-sm"
        />

        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">Todos los estados</option>
          {uniqueEstados.map((e, i) => (
            <option key={i} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="table-container overflow-x-auto">
        <table className="tabla-aves text-sm w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Capacidad</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((i) => (
              <tr key={i.id_incubadora} className="border-b hover:bg-gray-50">
                <td className="p-2">{i.nombre}</td>
                <td className="p-2">{i.capacidad}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoClass(i.estado)}`}>
                    {i.estado || "—"}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-1">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs p-1 rounded"
                      title="Editar"
                      onClick={() => openEdit(i)}
                    >
                      ✏️
                    </button>
                    {userRole === "admin" && (
                      <button
                        className="bg-red-700 hover:bg-red-800 text-white text-xs p-1 rounded"
                        title="Eliminar"
                        onClick={() => handleDeleted(i)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {currentItems.length === 0 && (
              <tr>
                <td className="p-2 text-center" colSpan={4}>
                  No hay incubadoras para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
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

      {/* Modal de edición */}
      <ModalEditarIncubadora
        open={isEditOpen}
        incubadora={selected}
        onClose={closeEdit}
        onSaved={handleSaved}
        onDeleted={async () => {
          closeEdit()
          await fetchIncubadoras()
        }}
      />
    </div>
  )
}

export default VerIncubadoras

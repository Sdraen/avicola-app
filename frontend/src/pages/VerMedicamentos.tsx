"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { medicamentosAPI } from "../services/api"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../utils/sweetAlert"
import type { Medicamento } from "../types"
import ModalEditarMedicamento from "../components/modals/ModalEditarMedicamento"

const VerMedicamentos: React.FC = () => {
  const [items, setItems] = useState<Medicamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)

  // Búsqueda
  const [query, setQuery] = useState("")
  const [typing, setTyping] = useState(false)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal edición
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const parsed = JSON.parse(user)
        setUserRole(parsed.rol)
      } catch {}
    }
  }, [])

  const fetchMedicamentos = async (q?: string) => {
    try {
      setLoading(true)
      const resp = await medicamentosAPI.getAll(q)
      const data = Array.isArray(resp.data) ? resp.data : Array.isArray(resp.data?.data) ? resp.data.data : []
      setItems(data)
    } catch (err) {
      console.error("Error cargando medicamentos:", err)
      setError("Error al cargar los medicamentos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicamentos()
  }, [])

  // Debounce búsqueda
  useEffect(() => {
    setTyping(true)
    const t = setTimeout(() => {
      setTyping(false)
      setCurrentPage(1)
      fetchMedicamentos(query.trim() || undefined)
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  // Paginación
  const totalPages = Math.ceil(items.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex])

  const goToPage = (page: number) => setCurrentPage(page)
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1)

  const handleDelete = async (id_medicamento: number, nombre: string) => {
    const isConfirmed = await showDeleteConfirmation(
      "¿Eliminar medicamento?",
      `¿Seguro que deseas eliminar ${nombre}? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
    )
    if (!isConfirmed) return

    try {
      showLoadingAlert("Eliminando medicamento...", "Por favor espere")
      await medicamentosAPI.delete(id_medicamento)
      setItems((prev) => prev.filter((m) => m.id_medicamento !== id_medicamento))
      closeLoadingAlert()
      await showSuccessAlert("¡Eliminado!", "El medicamento ha sido eliminado correctamente.")
    } catch (err: any) {
      closeLoadingAlert()
      const msg =
        err?.response?.status === 409
          ? "No se puede eliminar porque el medicamento ya fue aplicado en al menos un estanque."
          : err?.response?.data?.error || "No se pudo eliminar el medicamento. Inténtalo nuevamente."
      await showErrorAlert("Error al eliminar", msg)
    }
  }

  const openEdit = (id: number) => {
    setSelectedId(id)
    setIsEditOpen(true)
  }

  const closeEdit = () => {
    setIsEditOpen(false)
    setSelectedId(null)
  }

  const handleUpdated = () => {
    fetchMedicamentos(query.trim() || undefined)
  }

  if (loading) {
    return <div className="ver-aves-container text-center">Cargando medicamentos...</div>
  }

  if (error) {
    return <div className="ver-aves-container text-center text-red-600">{error}</div>
  }

  const muestraAcciones = userRole === "admin" || userRole === "operador"

  return (
    <div className="ver-aves-container flex flex-col min-h-screen">
      <div className="table-header">
        <div className="header-content justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="header-icon">💊</div>
            <div className="header-text">
              <h1 className="table-title">Listado de Medicamentos</h1>
              <p className="table-subtitle">
                Total: {items.length} | Mostrando {items.length === 0 ? 0 : startIndex + 1}-
                {Math.min(endIndex, items.length)} de {items.length}
              </p>
            </div>
          </div>
          {/* Buscador */}
          <div className="w-full max-w-xs">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre..."
              className="form-input"
            />
            {typing && <p className="text-xs text-gray-500 mt-1">Buscando…</p>}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="table-container flex-1">
          <table className="tabla-aves">
            <thead>
              <tr>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🏷️</span>Nombre
                  </span>
                </th>
                <th className="text-center">
                  <span className="th-content justify-center">
                    <span className="th-icon">📏</span>Dosis
                  </span>
                </th>
                {muestraAcciones && (
                  <th className="text-right pr-6">
                    <span className="th-content justify-end">
                      <span className="th-icon">🛠️</span>Acciones
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((m) => (
                <tr key={m.id_medicamento} className="table-row">
                  <td className="table-cell especie-cell">{m.nombre}</td>
                  {/* Centramos también el TD de Dosis */}
                  <td className="table-cell text-center">{m.dosis}</td>
                  {muestraAcciones && (
                    <td className="table-cell text-right">
                      <div className="acciones-cell justify-end">
                        {(userRole === "admin" || userRole === "operador") && (
                          <button className="btn-editar" onClick={() => openEdit(m.id_medicamento)}>
                            ✏️ Editar
                          </button>
                        )}
                        {userRole === "admin" && (
                          <button className="btn-eliminar" onClick={() => handleDelete(m.id_medicamento, m.nombre)}>
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td className="table-cell text-center text-gray-500" colSpan={muestraAcciones ? 3 : 2}>
                    No se encontraron medicamentos.
                  </td>
                </tr>
              )}
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

      {/* Modal de edición */}
      <ModalEditarMedicamento
        isOpen={isEditOpen}
        medicamentoId={selectedId ?? 0}
        onClose={closeEdit}
        onUpdate={handleUpdated}
      />
    </div>
  )
}

export default VerMedicamentos

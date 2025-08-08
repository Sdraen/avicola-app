"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
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

const calcularEdadSemanas = (edadInicial: string | number, fechaRegistro: string): string => {
  const hoy = new Date()
  const inicio = new Date(fechaRegistro)
  const semanasPasadas = Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 7))

  const edadBase = typeof edadInicial === "string" ? parseInt(edadInicial) : edadInicial
  const edadTotal = isNaN(edadBase) ? semanasPasadas : edadBase + semanasPasadas

  return `${edadTotal} semanas`
}

const VerAves: React.FC = () => {
  const [aves, setAves] = useState<Ave[]>([])
  const [filteredAves, setFilteredAves] = useState<Ave[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAveId, setSelectedAveId] = useState<number | null>(null)
  const [selectedAve, setSelectedAve] = useState<Ave | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isHistorialModalOpen, setIsHistorialModalOpen] = useState(false)
  const [isRegistroClinicoModalOpen, setIsRegistroClinicoModalOpen] = useState(false)
  const [isFallecimientoModalOpen, setIsFallecimientoModalOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Filtros / búsqueda
  const [search, setSearch] = useState("")
  const [filterJaula, setFilterJaula] = useState("")
  const [filterEstado, setFilterEstado] = useState("")
  const [filterRaza, setFilterRaza] = useState("")

  // ---------------------------
  // Paginación
  // ---------------------------
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const totalItems = filteredAves.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const startIdx = (currentPage - 1) * pageSize
  const endIdx = Math.min(startIdx + pageSize, totalItems)

  const pageItems = useMemo(() => filteredAves.slice(startIdx, endIdx), [filteredAves, startIdx, endIdx])

  const goToPage = (p: number) => {
    const safe = Math.min(Math.max(1, p), totalPages)
    setCurrentPage(safe)
  }

  // Reset a página 1 cuando cambian filtros/búsqueda o la data
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterJaula, filterEstado, filterRaza, aves])

  // Ajuste si disminuye el total de páginas
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const fetchAves = async () => {
    try {
      const response = await avesAPI.getAll()

      const avesConEdadCalculada = response.data.map((ave: Ave) => ({
        ...ave,
        edad: calcularEdadSemanas(ave.edad, ave.fecha_registro),
      }))

      setAves(avesConEdadCalculada)
      setFilteredAves(avesConEdadCalculada)
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

  useEffect(() => {
    const filtered = aves.filter((ave) => {
      const matchesSearch =
        ave.id_anillo.toLowerCase().includes(search.toLowerCase()) ||
        ave.color_anillo.toLowerCase().includes(search.toLowerCase()) ||
        ave.raza.toLowerCase().includes(search.toLowerCase())

      const matchesJaula =
        !filterJaula ||
        ave.jaula?.descripcion?.toLowerCase().includes(filterJaula.toLowerCase()) ||
        ave.jaula?.codigo_jaula?.toLowerCase().includes(filterJaula.toLowerCase())

      const matchesEstado = !filterEstado || ave.estado_puesta.toLowerCase() === filterEstado.toLowerCase()
      const matchesRaza = !filterRaza || ave.raza.toLowerCase() === filterRaza.toLowerCase()

      return matchesSearch && matchesJaula && matchesEstado && matchesRaza
    })

    setFilteredAves(filtered)
  }, [search, filterJaula, filterEstado, filterRaza, aves])

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

  const handleDelete = async (id_ave: number, id_anillo: string) => {
    const result = await showDeleteConfirmation(
      "¿Eliminar ave?",
      `¿Estás seguro de que deseas eliminar el ave con ID Anillo #${id_anillo}? Esta acción no se puede deshacer.`,
      "Sí, eliminar"
    )

    if (result) {
      try {
        showLoadingAlert("Eliminando ave...", "Por favor espere")
        await avesAPI.delete(id_ave)
        await fetchAves()
        closeLoadingAlert()
        await showSuccessAlert("¡Ave eliminada!", `El ave con ID Anillo #${id_anillo} ha sido eliminada correctamente`)
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

  const uniqueEstados = Array.from(new Set(aves.map((a) => a.estado_puesta)))
  const uniqueJaulas = Array.from(
    new Set(aves.map((a) => a.jaula?.descripcion || a.jaula?.codigo_jaula || ""))
  )
  const uniqueRazas = Array.from(new Set(aves.map((a) => a.raza)))

  if (loading) return <div className="text-center py-4">Cargando aves...</div>
  if (error) return <div className="text-center text-red-600 py-4">{error}</div>

  // Helper para botones de páginas (ventana de hasta 5 páginas alrededor de la actual)
  const pageNumbers = useMemo(() => {
    const windowSize = 5
    const half = Math.floor(windowSize / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + windowSize - 1)
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [currentPage, totalPages])

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🐓</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Aves</h1>
            <p className="table-subtitle">
              Total filtrado: {totalItems}
              {totalItems > 0 && (
                <span className="ml-2 text-gray-500">
                  (Mostrando {startIdx + 1}–{endIdx})
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y controles */}
      <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="🔍 Buscar por anillo, raza o color..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border rounded-md text-sm"
        />

        <select
          value={filterJaula}
          onChange={(e) => setFilterJaula(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">Todas las jaulas</option>
          {uniqueJaulas.map((j, i) => (
            <option key={i} value={j}>
              {j || `Jaula sin nombre`}
            </option>
          ))}
        </select>

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

        <select
          value={filterRaza}
          onChange={(e) => setFilterRaza(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">Todas las razas</option>
          {uniqueRazas.map((r, i) => (
            <option key={i} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Tamaño de página */}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-gray-600">Por página:</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container overflow-x-auto">
        <table className="tabla-aves text-sm w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID Anillo</th>
              <th className="p-2 text-left">Color Anillo</th>
              <th className="p-2 text-left">Raza</th>
              <th className="p-2 text-left">Edad</th>
              <th className="p-2 text-left">Estado Puesta</th>
              <th className="p-2 text-left">Jaula</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No se encontraron aves con los filtros aplicados.
                </td>
              </tr>
            ) : (
              pageItems.map((ave) => (
                <tr key={ave.id_ave} className="border-b hover:bg-gray-50">
                  <td className="p-2">{ave.id_anillo}</td>
                  <td className="p-2">{ave.color_anillo}</td>
                  <td className="p-2">{ave.raza}</td>
                  <td className="p-2">{ave.edad}</td>
                  <td className="p-2">
                    <span className="cantidad-badge">{ave.estado_puesta}</span>
                  </td>
                  <td className="p-2">{ave.jaula?.codigo_jaula || ave.jaula?.descripcion || ave.id_jaula}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs p-1 rounded"
                        title="Editar"
                        onClick={() => handleEdit(ave.id_ave)}
                      >
                        ✏️
                      </button>
                      <button
                        className="bg-blue-400 hover:bg-blue-500 text-white text-xs p-1 rounded"
                        title="Historial"
                        onClick={() => handleHistorialClinico(ave)}
                      >
                        🏥
                      </button>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white text-xs p-1 rounded"
                        title="Tratamiento"
                        onClick={() => handleRegistroClinico(ave)}
                      >
                        🩺
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white text-xs p-1 rounded"
                        title="Fallecimiento"
                        onClick={() => handleRegistrarFallecimiento(ave)}
                      >
                        💀
                      </button>
                      {userRole === "admin" && (
                        <button
                          className="bg-red-700 hover:bg-red-800 text-white text-xs p-1 rounded"
                          title="Eliminar"
                          onClick={() => handleDelete(ave.id_ave, ave.id_anillo)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          {totalItems > 0
            ? `Mostrando ${startIdx + 1}–${endIdx} de ${totalItems} aves`
            : "Sin resultados"}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            aria-label="Primera página"
            title="Primera"
          >
            «
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Anterior"
            title="Anterior"
          >
            ‹
          </button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              className={`px-3 py-1 border rounded ${
                p === currentPage ? "bg-gray-800 text-white" : "bg-white"
              }`}
              onClick={() => goToPage(p)}
              aria-current={p === currentPage ? "page" : undefined}
              title={`Página ${p}`}
            >
              {p}
            </button>
          ))}

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalItems === 0}
            aria-label="Siguiente"
            title="Siguiente"
          >
            ›
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages || totalItems === 0}
            aria-label="Última página"
            title="Última"
          >
            »
          </button>

          {/* Ir a página */}
          <div className="ml-2 flex items-center gap-1">
            <label htmlFor="goto" className="text-sm text-gray-600">Ir a:</label>
            <input
              id="goto"
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (!Number.isNaN(v)) goToPage(v)
              }}
              className="w-16 px-2 py-1 border rounded text-sm"
            />
            <span className="text-sm text-gray-600">/ {totalPages}</span>
          </div>
        </div>
      </div>

      <ModalEditarAve isOpen={isEditModalOpen} aveId={selectedAveId!} onClose={handleCloseEditModal} onUpdate={fetchAves} />
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

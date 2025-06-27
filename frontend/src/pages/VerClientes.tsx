"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { clientesAPI } from "../services/api"
import type { Cliente } from "../types"
import ModalEditarCliente from "../components/modals/ModalEditarCliente"
import Swal from "sweetalert2"

const VerClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const response = await clientesAPI.getAll()
      setClientes(response.data)
      setError("")
    } catch (err: any) {
      setError("Error al cargar los clientes")
      console.error("Error fetching clientes:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)
      setUserRole(parsed.rol)
    }
  }, [])

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await clientesAPI.search(searchTerm)
        setClientes(response.data)
      } catch (err) {
        console.error("Error searching clientes:", err)
      }
    } else {
      fetchClientes()
    }
  }

  const handleEdit = (id: number) => {
    setSelectedClienteId(id)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: number, nombre: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar Cliente?",
      html: `
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p class="text-sm text-gray-600">
            Esta acción eliminará permanentemente el cliente:<br>
            <strong class="text-gray-900">${nombre}</strong>
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "🗑️ Sí, Eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
    })

    if (result.isConfirmed) {
      try {
        await clientesAPI.delete(id)
        setClientes((prev) => prev.filter((cliente) => cliente.id_cliente !== id))

        Swal.fire({
          title: "¡Eliminado!",
          text: "El cliente ha sido eliminado correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        })
      } catch (err: any) {
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el cliente. Inténtalo de nuevo.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        })
        console.error("Delete error:", err)
      }
    }
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedClienteId(null)
  }

  const handleUpdateSuccess = () => {
    fetchClientes()
    handleCloseModal()
  }

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ver-aves-container">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-2">⚠️ {error}</div>
          <button
            onClick={fetchClientes}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">👥</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Clientes</h1>
            <p className="table-subtitle">Total de clientes registrados: {clientes.length}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔍 Buscar
          </button>
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes registrados</h3>
          <p className="text-gray-600">Comienza agregando tu primer cliente al sistema.</p>
        </div>
      ) : (
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
                    <span className="th-icon">👤</span>
                    Nombre
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📍</span>
                    Dirección
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📞</span>
                    Teléfono
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🏷️</span>
                    Tipo
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
              {clientes.map((cliente) => (
                <tr key={cliente.id_cliente} className="table-row">
                  <td className="table-cell id-cell">{cliente.id_cliente}</td>
                  <td className="table-cell especie-cell">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">👤</span>
                      {cliente.nombre}
                    </div>
                  </td>
                 <td className="table-cell">
  {cliente.direccion ? (
    <details className="group cursor-pointer max-w-md text-sm text-gray-800">
      <summary
        className="flex items-center overflow-hidden whitespace-nowrap text-ellipsis max-w-full"
        title={cliente.direccion}
      >
        <span className="text-sm mr-1">📍</span>
        {cliente.direccion.length > 40
          ? cliente.direccion.slice(0, 40) + "..."
          : cliente.direccion}
        {cliente.direccion.length > 40 && (
          <span className="ml-1 text-blue-500 group-hover:underline">ver más</span>
        )}
      </summary>
      <div className="mt-1 ml-5 text-gray-700">{cliente.direccion}</div>
    </details>
  ) : (
    <span className="text-gray-400">Sin dirección</span>
  )}
</td>
                  <td className="table-cell">
                    {cliente.telefono ? (
                      <span className="flex items-center">
                        <span className="text-sm mr-1">📞</span>
                        {cliente.telefono}
                      </span>
                    ) : (
                      <span className="text-gray-400">Sin teléfono</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span
                      className={`cantidad-badge ${
                        cliente.tipo_cliente === "mayorista"
                          ? "bg-purple-100 text-purple-800"
                          : cliente.tipo_cliente === "minorista"
                            ? "bg-blue-100 text-blue-800"
                            : cliente.tipo_cliente === "distribuidor"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {cliente.tipo_cliente === "mayorista" && "🏢"}
                      {cliente.tipo_cliente === "minorista" && "🛒"}
                      {cliente.tipo_cliente === "distribuidor" && "🚚"}
                      {!cliente.tipo_cliente && "👤"} {cliente.tipo_cliente || "General"}
                    </span>
                  </td>
                  <td className="table-cell acciones-cell">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cliente.id_cliente)}
                        className="btn-editar"
                        title="Editar cliente"
                      >
                        ✏️ Editar
                      </button>
                      {userRole === "admin" && (
                        <button
                          onClick={() => handleDelete(cliente.id_cliente, cliente.nombre)}
                          className="btn-eliminar"
                          title="Eliminar cliente"
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
      )}

      {/* Modal de edición */}
      {isEditModalOpen && selectedClienteId && (
        <ModalEditarCliente
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          clienteId={selectedClienteId}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  )
}

export default VerClientes
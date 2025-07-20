"use client"

import { useState, useEffect } from "react"
import { comprasAPI } from "../services/api"
import ModalEditarCompra from "../components/modals/ModalEditarCompra"
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from "../utils/sweetAlert"

interface Implemento {
  id_implemento: number
  nombre: string
  cantidad: number
  precio_unitario: number
  categoria?: string
  descripcion?: string
  estado?: string
  ubicacion?: string
}

interface Compra {
  id_compra: number
  fecha: string
  costo_total: number
  proveedor?: string
  implementos?: Implemento[]
}

const VerCompras = () => {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchCompras()
  }, [])

  const fetchCompras = async () => {
    try {
      const response = await comprasAPI.getAll()
      setCompras(response.data)
    } catch (err: any) {
      setError("Error al cargar las compras")
      console.error("Error fetching compras:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (compra: Compra) => {
    setSelectedCompra(compra)
    setIsEditModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedCompra(null)
    setIsEditModalOpen(false)
  }

  const handleDelete = async (compra: Compra) => {
    const confirmed = await showDeleteConfirmation(
      "¿Eliminar compra?",
      `¿Estás seguro de que deseas eliminar esta compra? Esto también eliminará todos los implementos asociados.`,
    )
    if (!confirmed) return

    try {
      await comprasAPI.delete(compra.id_compra)
      await showSuccessAlert("¡Eliminada!", "La compra y sus implementos han sido eliminados correctamente.")
      fetchCompras()
    } catch (err: any) {
      await showErrorAlert("Error", err.response?.data?.error || "No se pudo eliminar la compra")
    }
  }

  const totalCompras = compras.reduce((sum, compra) => sum + Number(compra.costo_total), 0)
  const totalImplementos = compras.reduce((sum, compra) => sum + (compra.implementos?.length || 0), 0)

  const formatFechaLocal = (fechaISO: string): string => {
    const raw = new Date(fechaISO)
    const local = new Date(raw.getTime() + raw.getTimezoneOffset() * 60000)
    return local.toLocaleDateString("es-CL")
  }

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando compras...</div>
      </div>
    )
  }

  return (
    <>
      <div className="ver-aves-container">
        <div className="table-header">
          <div className="header-content">
            <div className="header-icon">🛒</div>
            <div className="header-text">
              <h1 className="table-title">Historial de Compras</h1>
              <p className="table-subtitle">
                Total de compras: {compras.length} | Implementos: {totalImplementos} | Gastos:{" "}
                {totalCompras.toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="tabla-aves">
            <thead>
              <tr>
                <th>📅 Fecha</th>
                <th>🏪 Proveedor</th>
                <th>💰 Total</th>
                <th>📦 Implementos</th>
                <th>⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => (
                <tr key={compra.id_compra}>
                  <td className="table-cell">{formatFechaLocal(compra.fecha)}</td>
                  <td className="table-cell">{compra.proveedor || "N/A"}</td>
                  <td className="table-cell font-semibold text-red-600">
                    {Number(compra.costo_total).toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    })}
                  </td>
                  <td className="table-cell">
                    {compra.implementos?.length ? (
                      <div className="space-y-2">
                        {compra.implementos.map((imp) => (
                          <div key={imp.id_implemento} className="p-2 rounded bg-gray-50 shadow-sm text-sm space-y-1">
                            <div className="font-medium text-gray-800">{imp.nombre}</div>
                            <div className="text-gray-600">
                              Cant: {imp.cantidad} ×{" "}
                              {Number(imp.precio_unitario).toLocaleString("es-CL", {
                                style: "currency",
                                currency: "CLP",
                              })}{" "}
                              ={" "}
                              {(imp.cantidad * imp.precio_unitario).toLocaleString("es-CL", {
                                style: "currency",
                                currency: "CLP",
                              })}
                            </div>
                            {imp.categoria && <div className="text-gray-500">📂 Categoría: {imp.categoria}</div>}
                            {imp.estado && <div className="text-gray-500">⚙️ Estado: {imp.estado}</div>}
                            {imp.ubicacion && <div className="text-gray-500">📍 Ubicación: {imp.ubicacion}</div>}
                            {imp.descripcion && <div className="text-gray-500 italic">📝 {imp.descripcion}</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Sin implementos</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <button className="btn-editar" onClick={() => handleEdit(compra)}>✏️ Editar</button>
                    <button className="btn-eliminar ml-2" onClick={() => handleDelete(compra)}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {compras.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay compras registradas</div>
        )}
      </div>

      {isEditModalOpen && selectedCompra && (
        <ModalEditarCompra
          isOpen={true}
          compra={selectedCompra}
          onClose={handleCloseModal}
          onUpdate={fetchCompras}
        />
      )}
    </>
  )
}

export default VerCompras

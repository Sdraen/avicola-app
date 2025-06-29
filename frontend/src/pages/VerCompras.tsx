"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { comprasAPI } from "../services/api"
import ModalEditarCompra from "../components/modals/ModalEditarCompra"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
} from "../utils/sweetAlert"
import type { Compra } from "../types"

const VerCompras: React.FC = () => {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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

  useEffect(() => {
    fetchCompras()
  }, [])

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
      `¿Estás seguro de que deseas eliminar la compra #${compra.id_compras}? Esta acción no se puede deshacer.`,
    )
    if (!confirmed) return

    try {
      await comprasAPI.delete(compra.id_compras)
      await showSuccessAlert("¡Eliminada!", "La compra ha sido eliminada correctamente.")
      fetchCompras()
    } catch (err: any) {
      await showErrorAlert("Error", err.response?.data?.error || "No se pudo eliminar la compra")
    }
  }

  const totalCompras = compras.reduce((sum, compra) => sum + Number(compra.costo_total), 0)

  const formatFechaLocal = (fechaISO: string): string => {
    const raw = new Date(fechaISO)
    const local = new Date(raw.getTime() + raw.getTimezoneOffset() * 60000)
    return local.toLocaleDateString("es-CL")
  }

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🛒</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Compras</h1>
            <p className="table-subtitle">
              Total de compras: {compras.length} | Gastos: {totalCompras.toLocaleString("es-CL", {
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
              <th><span className="th-content"><span className="th-icon">🆔</span>ID</span></th>
              <th><span className="th-content"><span className="th-icon">📅</span>Fecha</span></th>
              <th><span className="th-content"><span className="th-icon">💰</span>Total</span></th>
              <th><span className="th-content"><span className="th-icon">📦</span>Implementos</span></th>
              <th><span className="th-content"><span className="th-icon">⚙️</span>Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {compras.map((compra) => (
              <tr key={compra.id_compras} className="table-row">
                <td className="table-cell id-cell">{compra.id_compras}</td>
                <td className="table-cell">{formatFechaLocal(compra.fecha)}</td>
                <td className="table-cell font-semibold text-red-600">
                  {Number(compra.costo_total).toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    minimumFractionDigits: 0,
                  })}
                </td>
                <td className="table-cell">
                  {compra.implementos?.length ? (
                    <ul className="text-sm text-gray-700 list-disc pl-5">
                      {compra.implementos.map((imp, i) => (
                        <li key={i}>
                          {imp.nombre} ({imp.cantidad} ×{" "}
                          {Number(imp.costo_unitario).toLocaleString("es-CL", {
                            style: "currency",
                            currency: "CLP",
                            minimumFractionDigits: 0,
                          })})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">Sin datos</span>
                  )}
                </td>
                <td className="table-cell acciones-cell">
                  <button className="btn-editar" onClick={() => handleEdit(compra)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-eliminar ml-2" onClick={() => handleDelete(compra)}>
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalEditarCompra
        isOpen={isEditModalOpen}
        compra={selectedCompra}
        onClose={handleCloseModal}
        onUpdate={fetchCompras}
      />
    </div>
  )
}

export default VerCompras

"use client"

import { useState, useEffect } from "react"
import { huevosAPI } from "../services/api"
import type { Huevo } from "../types"
import ModalEditarHuevo from "../components/modals/ModalEditarHuevo"

const VerHuevos = () => {
  const [huevos, setHuevos] = useState<Huevo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [modalHuevoId, setModalHuevoId] = useState<number | null>(null)

  const fetchHuevos = async () => {
    try {
      const response = await huevosAPI.getAll()
      setHuevos(response.data)
    } catch (err) {
      console.error("Error al cargar los huevos", err)
      setError("Error al cargar los huevos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHuevos()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este registro?")) return
    try {
      await huevosAPI.delete(id)
      setHuevos((prev) => prev.filter((h) => h.id_huevo !== id))
    } catch (err) {
      console.error("Error al eliminar el registro", err)
    }
  }

  const handleOpenModal = (id: number) => setModalHuevoId(id)
  const handleCloseModal = () => {
    setModalHuevoId(null)
    fetchHuevos()
  }

  const isAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("user") &&
    JSON.parse(localStorage.getItem("user")!).rol === "admin"

  if (loading) return <p className="text-center">Cargando...</p>
  if (error) return <p className="text-red-600 text-center">{error}</p>

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🥚</div>
          <div className="header-text">
            <h1 className="table-title">Registros de Huevos</h1>
            <p className="table-subtitle">Total: {huevos.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="tabla-aves">
          <thead>
            <tr>
              <th>ID</th>
              <th>Jaula</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Café</th>
              <th>Blanco</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {huevos.map((h) => {
              const totalCafe =
                h.huevos_cafe_chico + h.huevos_cafe_mediano + h.huevos_cafe_grande + h.huevos_cafe_jumbo
              const totalBlanco =
                h.huevos_blanco_chico + h.huevos_blanco_mediano + h.huevos_blanco_grande + h.huevos_blanco_jumbo

              return (
                <tr key={h.id_huevo} className="table-row">
                  <td className="table-cell">{h.id_huevo}</td>
                  <td className="table-cell">{h.jaula?.descripcion || `Jaula ${h.id_jaula}`}</td>
                  <td className="table-cell">{new Date(h.fecha_recoleccion).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <span className="cantidad-badge">{h.cantidad_total}</span>
                  </td>
                  <td className="table-cell">{totalCafe}</td>
                  <td className="table-cell">{totalBlanco}</td>
                  <td className="table-cell">{h.observaciones || "-"}</td>
                  <td className="table-cell">
                    <button className="text-blue-600 hover:underline" onClick={() => handleOpenModal(h.id_huevo)}>
                      Editar
                    </button>
                    {isAdmin && (
                      <button className="ml-4 text-red-600 hover:underline" onClick={() => handleDelete(h.id_huevo)}>
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modalHuevoId && (
        <ModalEditarHuevo idHuevo={modalHuevoId} onClose={handleCloseModal} />
      )}
    </div>
  )
}

export default VerHuevos

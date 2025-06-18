"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { avesAPI } from "../services/api"
import type { Ave } from "../types"
import ModalEditarAve from "../components/modals/ModalEditarAve"

const VerAves: React.FC = () => {
  const [aves, setAves] = useState<Ave[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAveId, setSelectedAveId] = useState<number | null>(null)
  const navigate = useNavigate()

  const fetchAves = async () => {
    try {
      const response = await avesAPI.getAll()
      setAves(response.data)
    } catch (err: any) {
      setError("Error al cargar las aves")
      console.error("Error fetching aves:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id_ave: number) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar esta ave?")
    if (!confirm) return

    try {
      await avesAPI.delete(id_ave)
      setAves((prev) => prev.filter((ave) => ave.id_ave !== id_ave))
    } catch (err: any) {
      setError("Error al eliminar el ave")
      console.error("Delete error:", err)
    }
  }

  useEffect(() => {
    fetchAves()
  }, [])

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando aves...</div>
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
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🐓</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Aves</h1>
            <p className="table-subtitle">Total de aves registradas: {aves.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="tabla-aves">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Anillo</th>
              <th>Color Anillo</th>
              <th>Raza</th>
              <th>Edad</th>
              <th>Estado Puesta</th>
              <th>Jaula</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {aves.map((ave) => (
              <tr key={ave.id_ave} className="table-row">
                <td className="table-cell">{ave.id_ave}</td>
                <td className="table-cell">{ave.id_anillo}</td>
                <td className="table-cell">{ave.color_anillo}</td>
                <td className="table-cell">{ave.raza}</td>
                <td className="table-cell">{ave.edad}</td>
                <td className="table-cell">
                  <span className="cantidad-badge">{ave.estado_puesta}</span>
                </td>
                <td className="table-cell">
                  {ave.jaula?.numero_jaula || ave.jaula?.descripcion || ave.id_jaula}
                </td>
                <td className="table-cell acciones-cell">
                  <button
                    className="btn-editar"
                    onClick={() => setSelectedAveId(ave.id_ave)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn-eliminar ml-2 text-red-600"
                    onClick={() => handleDelete(ave.id_ave)}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {selectedAveId !== null && (
        <ModalEditarAve
          idAve={selectedAveId}
          onClose={() => setSelectedAveId(null)}
          onUpdate={fetchAves}
        />
      )}
    </div>
  )
}

export default VerAves

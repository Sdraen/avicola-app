"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import ModalEditarIncubacion from "../components/modals/ModalEditarIncubacion"
import {
  showDeleteConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
} from "../utils/sweetAlert"

// ✅ Interfaz local
interface Incubacion {
  id_incubacion: number
  lote: string
  cantidad_huevos: number
  fecha_inicio: string
  fecha_estimada_eclosion: string
  temperatura: number
  observaciones: string | null
}

export default function VerIncubacion() {
  const [incubaciones, setIncubaciones] = useState<Incubacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchIncubaciones = async () => {
    try {
      const res = await api.get("/incubacion")
      setIncubaciones(res.data)
    } catch (err) {
      console.error("Error al cargar incubaciones:", err)
      setError("Error al cargar incubaciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncubaciones()
  }, [])

  const handleEdit = (id: number) => {
    setSelectedId(id)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    const confirm = await showDeleteConfirmation(
      "¿Eliminar incubación?",
      `¿Estás seguro de eliminar la incubación #${id}?`,
      "Sí, eliminar"
    )

    if (confirm) {
      try {
        showLoadingAlert("Eliminando...", "Espere un momento")
        await api.delete(`/incubacion/${id}`)
        setIncubaciones((prev) => prev.filter((i) => i.id_incubacion !== id))
        closeLoadingAlert()
        await showSuccessAlert("Eliminada", "La incubación fue eliminada correctamente")
      } catch (err) {
        closeLoadingAlert()
        await showErrorAlert("Error", "No se pudo eliminar la incubación")
        console.error("Error al eliminar:", err)
      }
    }
  }

  const calcularDiasRestantes = (fecha: string) => {
    const hoy = new Date()
    const objetivo = new Date(fecha)
    const diff = Math.ceil((objetivo.getTime() - hoy.getTime()) / (1000 * 3600 * 24))
    return diff >= 0 ? `${diff} días restantes` : `${Math.abs(diff)} días desde la eclosión`
  }

  if (loading) return <div className="p-6 text-center">Cargando incubaciones...</div>

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🐣</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Incubaciones</h1>
            <p className="table-subtitle">Total de incubaciones registradas: {incubaciones.length}</p>
          </div>
        </div>
      </div>

      {error && <div className="text-red-600 text-center">{error}</div>}

      <div className="table-container overflow-x-auto">
        <table className="tabla-aves w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="px-4 py-3">🆔 ID</th>
              <th className="px-4 py-3">📄 Lote</th>
              <th className="px-4 py-3">🥚 Huevos</th>
              <th className="px-4 py-3">📅 Inicio</th>
              <th className="px-4 py-3">🎯 Nacimiento</th>
              <th className="px-4 py-3">⏳ Días</th>
              <th className="px-4 py-3">🌡️ Temp.</th>
              <th className="px-4 py-3">📝 Obs.</th>
              <th className="px-4 py-3">🛠️ Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incubaciones.map((i) => (
              <tr
                key={i.id_incubacion}
                className="border-b hover:bg-gray-50 transition duration-200"
              >
                <td className="px-4 py-3 align-middle">{i.id_incubacion}</td>
                <td className="px-4 py-3 align-middle">{i.lote}</td>
                <td className="px-4 py-3 align-middle">{i.cantidad_huevos}</td>
                <td className="px-4 py-3 align-middle">
                  {new Date(i.fecha_inicio).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 align-middle">
                  {new Date(i.fecha_estimada_eclosion).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 align-middle">
                  {calcularDiasRestantes(i.fecha_estimada_eclosion)}
                </td>
                <td className="px-4 py-3 align-middle">{i.temperatura}°C</td>
                <td className="px-4 py-3 align-middle">{i.observaciones || "—"}</td>
                <td className="px-4 py-3 align-middle whitespace-nowrap">
                  <button
                    className="btn-editar"
                    onClick={() => handleEdit(i.id_incubacion)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-eliminar ml-2"
                    onClick={() => handleDelete(i.id_incubacion)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && selectedId && (
        <ModalEditarIncubacion
          id={selectedId}
          onClose={() => {
            setModalOpen(false)
            setSelectedId(null)
          }}
          onUpdated={fetchIncubaciones}
        />
      )}
    </div>
  )
}

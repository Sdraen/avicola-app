"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { huevosAPI } from "../services/api"
import type { Huevo } from "../types"

const VerHuevos: React.FC = () => {
  const [huevos, setHuevos] = useState<Huevo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHuevos = async () => {
      try {
        const response = await huevosAPI.getAll()
        setHuevos(response.data)
      } catch (err: any) {
        setError("Error al cargar los registros de huevos")
        console.error("Error fetching huevos:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHuevos()
  }, [])

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando registros de huevos...</div>
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
          <div className="header-icon">🥚</div>
          <div className="header-text">
            <h1 className="table-title">Registros de Huevos</h1>
            <p className="table-subtitle">Total de registros: {huevos.length}</p>
          </div>
        </div>
      </div>

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
                  <span className="th-icon">🏠</span>
                  Jaula
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📅</span>
                  Fecha Recolección
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🥚</span>
                  Cantidad Total
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🟤</span>
                  Café
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">⚪</span>
                  Blanco
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📝</span>
                  Observaciones
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {huevos.map((huevo) => {
              const totalCafe =
                huevo.huevos_cafe_chico + huevo.huevos_cafe_mediano + huevo.huevos_cafe_grande + huevo.huevos_cafe_jumbo
              const totalBlanco =
                huevo.huevos_blanco_chico +
                huevo.huevos_blanco_mediano +
                huevo.huevos_blanco_grande +
                huevo.huevos_blanco_jumbo

              return (
                <tr key={huevo.id_huevo} className="table-row">
                  <td className="table-cell id-cell">{huevo.id_huevo}</td>
                  <td className="table-cell">{huevo.jaula?.descripcion || `Jaula ${huevo.id_jaula}`}</td>
                  <td className="table-cell">{new Date(huevo.fecha_recoleccion).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <span className="cantidad-badge">{huevo.cantidad_total}</span>
                  </td>
                  <td className="table-cell">{totalCafe}</td>
                  <td className="table-cell">{totalBlanco}</td>
                  <td className="table-cell">{huevo.observaciones || "-"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VerHuevos

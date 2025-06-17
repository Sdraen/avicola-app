"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { avesAPI } from "../services/api"
import type { Ave } from "../types"

const VerAves: React.FC = () => {
  const [aves, setAves] = useState<Ave[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
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
              <th>
                <span className="th-content">
                  <span className="th-icon">🆔</span>
                  ID
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🎨</span>
                  Color Anillo
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🧬</span>
                  Raza
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📅</span>
                  Edad
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🥚</span>
                  Estado Puesta
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🏠</span>
                  Jaula
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {aves.map((ave) => (
              <tr key={ave.id_ave} className="table-row">
                <td className="table-cell id-cell">{ave.id_ave}</td>
                <td className="table-cell">{ave.color_anillo}</td>
                <td className="table-cell especie-cell">{ave.raza}</td>
                <td className="table-cell">{ave.edad}</td>
                <td className="table-cell">
                  <span className="cantidad-badge">{ave.estado_puesta}</span>
                </td>
                <td className="table-cell">{ave.jaula?.numero_jaula || ave.jaula?.descripcion || ave.id_jaula}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VerAves

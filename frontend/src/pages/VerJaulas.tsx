"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { jaulasAPI } from "../services/api"
import type { Jaula } from "../types"

const VerJaulas: React.FC = () => {
  const [jaulas, setJaulas] = useState<Jaula[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchJaulas = async () => {
      try {
        const response = await jaulasAPI.getAll()
        setJaulas(response.data)
      } catch (err: any) {
        setError("Error al cargar las jaulas")
        console.error("Error fetching jaulas:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchJaulas()
  }, [])

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando jaulas...</div>
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
          <div className="header-icon">🏠</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Jaulas</h1>
            <p className="table-subtitle">Total de jaulas registradas: {jaulas.length}</p>
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
                  Descripción
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🏊</span>
                  Estanque
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🐓</span>
                  Aves
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📊</span>
                  Ocupación
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {jaulas.map((jaula) => {
              const numAves = jaula.aves?.length || 0
              const ocupacion = Math.round((numAves / 20) * 100) // Asumiendo capacidad máxima de 20

              return (
                <tr key={jaula.id_jaula} className="table-row">
                  <td className="table-cell id-cell">{jaula.id_jaula}</td>
                  <td className="table-cell especie-cell">{jaula.descripcion || `Jaula ${jaula.id_jaula}`}</td>
                  <td className="table-cell">{jaula.id_estanque}</td>
                  <td className="table-cell">
                    <span className="cantidad-badge">{numAves}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            ocupacion >= 90 ? "bg-red-500" : ocupacion >= 70 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${ocupacion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{ocupacion}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VerJaulas

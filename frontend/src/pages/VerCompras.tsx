"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { comprasAPI } from "../services/api"
import type { Compra } from "../types"

const VerCompras: React.FC = () => {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
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

    fetchCompras()
  }, [])

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando compras...</div>
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

  const totalCompras = compras.reduce((sum, compra) => sum + Number.parseFloat(compra.costo_total), 0)

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🛒</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Compras</h1>
            <p className="table-subtitle">
              Total de compras: {compras.length} | Gastos: ${totalCompras.toLocaleString()}
            </p>
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
                  <span className="th-icon">📅</span>
                  Fecha
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">💰</span>
                  Costo Total
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📦</span>
                  Implementos
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {compras.map((compra) => (
              <tr key={compra.id_compras} className="table-row">
                <td className="table-cell id-cell">{compra.id_compras}</td>
                <td className="table-cell">{new Date(compra.fecha).toLocaleDateString()}</td>
                <td className="table-cell font-semibold text-red-600">
                  ${Number.parseFloat(compra.costo_total).toLocaleString()}
                </td>
                <td className="table-cell">
                  <span className="cantidad-badge">{compra.implementos?.length || 0}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VerCompras

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ventasAPI } from "../services/api"
import type { Venta } from "../types"

const VerVentas: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await ventasAPI.getAll()
        setVentas(response.data)
      } catch (err: any) {
        setError("Error al cargar las ventas")
        console.error("Error fetching ventas:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchVentas()
  }, [])

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando ventas...</div>
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

  const totalVentas = ventas.reduce((sum, venta) => sum + venta.costo_total, 0)

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">💰</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Ventas</h1>
            <p className="table-subtitle">
              Total de ventas: {ventas.length} | Ingresos: ${totalVentas.toLocaleString()}
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
                  <span className="th-icon">👤</span>
                  Cliente
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
                  <span className="th-icon">📦</span>
                  Cantidad
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">💰</span>
                  Total
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🏷️</span>
                  Código
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id_venta} className="table-row">
                <td className="table-cell id-cell">{venta.id_venta}</td>
                <td className="table-cell especie-cell">{venta.cliente?.nombre || `Cliente ${venta.id_cliente}`}</td>
                <td className="table-cell">{new Date(venta.fecha_venta).toLocaleDateString()}</td>
                <td className="table-cell">
                  <span className="cantidad-badge">{venta.cantidad_total}</span>
                </td>
                <td className="table-cell font-semibold text-green-600">${venta.costo_total.toLocaleString()}</td>
                <td className="table-cell id-cell">{venta.codigo_barras}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VerVentas

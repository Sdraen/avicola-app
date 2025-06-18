"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { clientesAPI } from "../services/api"
import type { Cliente } from "../types"

const VerClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await clientesAPI.getAll()
        setClientes(response.data)
      } catch (err: any) {
        setError("Error al cargar los clientes")
        console.error("Error fetching clientes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [])

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await clientesAPI.search(searchTerm)
        setClientes(response.data)
      } catch (err) {
        console.error("Error searching clientes:", err)
      }
    } else {
      // Reload all clients if search is empty
      const response = await clientesAPI.getAll()
      setClientes(response.data)
    }
  }

  if (loading) {
    return (
      <div className="ver-aves-container">
        <div className="text-center">Cargando clientes...</div>
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
          <div className="header-icon">👥</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Clientes</h1>
            <p className="table-subtitle">Total de clientes registrados: {clientes.length}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Buscar
          </button>
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
                  Nombre
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📍</span>
                  Dirección
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📞</span>
                  Teléfono
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">🏷️</span>
                  Tipo
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id_cliente} className="table-row">
                <td className="table-cell id-cell">{cliente.id_cliente}</td>
                <td className="table-cell especie-cell">{cliente.nombre}</td>
                <td className="table-cell">{cliente.direccion || "-"}</td>
                <td className="table-cell">{cliente.telefono || "-"}</td>
                <td className="table-cell">
                  <span className="cantidad-badge">{cliente.tipo_cliente || "General"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VerClientes

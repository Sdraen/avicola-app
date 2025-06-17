"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import  api  from "../services/api"

interface Vacuna {
  id: number
  nombre: string
  tipo: string
  descripcion: string
  dosis: string
  via_administracion: string
  edad_aplicacion: string
  intervalo_dosis: number
  stock: number
  fecha_vencimiento: string
  precio_unitario: number
  laboratorio: string
  created_at: string
}

export default function VerVacunas() {
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchVacunas()
  }, [])

  const fetchVacunas = async () => {
    try {
      const response = await api.get("/vacunas")
      setVacunas(response.data)
    } catch (err) {
      setError("Error al cargar las vacunas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredVacunas = vacunas.filter(
    (vacuna) =>
      vacuna.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacuna.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando vacunas...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vacunas</h1>
          <p className="text-gray-600 mt-2">Lista de todas las vacunas registradas</p>
        </div>
        <Link
          to="/registrar-vacuna"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Agregar Vacuna
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar vacunas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vacuna</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edad Aplicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVacunas.map((vacuna) => (
              <tr key={vacuna.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{vacuna.nombre}</div>
                    <div className="text-sm text-gray-500">{vacuna.laboratorio}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    {vacuna.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vacuna.edad_aplicacion}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vacuna.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(vacuna.fecha_vencimiento).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredVacunas.length === 0 && (
          <div className="text-center py-8 text-gray-500">No se encontraron vacunas</div>
        )}
      </div>
    </div>
  )
}

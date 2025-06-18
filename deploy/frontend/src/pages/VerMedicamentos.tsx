"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import  api  from "../services/api"

interface Medicamento {
  id: number
  nombre: string
  tipo: string
  descripcion: string
  dosis: string
  via_administracion: string
  tiempo_retiro: number
  stock: number
  fecha_vencimiento: string
  precio_unitario: number
  proveedor: string
  created_at: string
}

export default function VerMedicamentos() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchMedicamentos()
  }, [])

  const fetchMedicamentos = async () => {
    try {
      const response = await api.get("/medicamentos")
      setMedicamentos(response.data)
    } catch (err) {
      setError("Error al cargar los medicamentos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMedicamentos = medicamentos.filter(
    (medicamento) =>
      medicamento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicamento.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando medicamentos...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicamentos</h1>
          <p className="text-gray-600 mt-2">Lista de todos los medicamentos registrados</p>
        </div>
        <Link
          to="/registrar-medicamento"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Agregar Medicamento
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar medicamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medicamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMedicamentos.map((medicamento) => (
              <tr key={medicamento.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{medicamento.nombre}</div>
                    <div className="text-sm text-gray-500">{medicamento.descripcion}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {medicamento.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicamento.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(medicamento.fecha_vencimiento).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${medicamento.precio_unitario.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMedicamentos.length === 0 && (
          <div className="text-center py-8 text-gray-500">No se encontraron medicamentos</div>
        )}
      </div>
    </div>
  )
}

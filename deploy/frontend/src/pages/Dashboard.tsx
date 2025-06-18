"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { avesAPI, huevosAPI, ventasAPI, jaulasAPI } from "../services/api"

interface DashboardStats {
  totalBirds: number
  deceasedThisMonth: number
  totalEggs: number
  totalEggsToday: number
  totalSales: number
  totalRevenue: number
  totalCages: number
  emptyCages: number
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [avesResponse, huevosResponse, ventasResponse, jaulasResponse] = await Promise.all([
          avesAPI.getStats(),
          huevosAPI.getStats(),
          ventasAPI.getStats(),
          jaulasAPI.getStats(),
        ])

        setStats({
          totalBirds: avesResponse.data.totalBirds || 0,
          deceasedThisMonth: avesResponse.data.deceasedThisMonth || 0,
          totalEggs: huevosResponse.data.totalEggs || 0,
          totalEggsToday: huevosResponse.data.totalEggsToday || 0,
          totalSales: ventasResponse.data.totalSales || 0,
          totalRevenue: ventasResponse.data.totalRevenueThisMonth || 0,
          totalCages: jaulasResponse.data.totalCages || 0,
          emptyCages: jaulasResponse.data.emptyCages || 0,
        })
      } catch (err: any) {
        setError("Error al cargar estadísticas")
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="text-center">Cargando estadísticas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Bienvenido al Dashboard 🐔</h1>
        <p className="dashboard-subtitle">Resumen del estado actual del sistema avícola IECI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card card-jaulas">
          <div className="card-icon">🏠</div>
          <div className="card-content">
            <h3>Jaulas</h3>
            <p className="card-number">{stats?.totalCages || 0}</p>
            <span className="card-label">registradas</span>
            <p className="text-sm text-gray-500 mt-1">{stats?.emptyCages || 0} vacías</p>
          </div>
        </div>

        <div className="card card-aves">
          <div className="card-icon">🐓</div>
          <div className="card-content">
            <h3>Aves</h3>
            <p className="card-number">{stats?.totalBirds || 0}</p>
            <span className="card-label">en total</span>
            <p className="text-sm text-gray-500 mt-1">{stats?.deceasedThisMonth || 0} fallecidas este mes</p>
          </div>
        </div>

        <div className="card card-huevos">
          <div className="card-icon">🥚</div>
          <div className="card-content">
            <h3>Huevos</h3>
            <p className="card-number">{stats?.totalEggs || 0}</p>
            <span className="card-label">recolectados</span>
            <p className="text-sm text-gray-500 mt-1">{stats?.totalEggsToday || 0} hoy</p>
          </div>
        </div>

        <div className="card card-clinica">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Ventas</h3>
            <p className="card-number">{stats?.totalSales || 0}</p>
            <span className="card-label">realizadas</span>
            <p className="text-sm text-gray-500 mt-1">${(stats?.totalRevenue || 0).toLocaleString()} este mes</p>
          </div>
        </div>
      </div>

      {/* Sección de accesos rápidos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/registrar-ave"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl mr-3">🐓</span>
            <div>
              <h3 className="font-semibold text-blue-800">Registrar Ave</h3>
              <p className="text-sm text-blue-600">Añadir nueva ave al sistema</p>
            </div>
          </a>

          <a
            href="/registrar-huevos"
            className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <span className="text-2xl mr-3">🥚</span>
            <div>
              <h3 className="font-semibold text-yellow-800">Registrar Huevos</h3>
              <p className="text-sm text-yellow-600">Registrar recolección diaria</p>
            </div>
          </a>

          <a
            href="/registrar-venta"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl mr-3">💰</span>
            <div>
              <h3 className="font-semibold text-green-800">Registrar Venta</h3>
              <p className="text-sm text-green-600">Nueva venta de productos</p>
            </div>
          </a>

          <a
            href="/registrar-cliente"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="text-2xl mr-3">👥</span>
            <div>
              <h3 className="font-semibold text-purple-800">Registrar Cliente</h3>
              <p className="text-sm text-purple-600">Añadir nuevo cliente</p>
            </div>
          </a>

          <a
            href="/ver-medicamentos"
            className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <span className="text-2xl mr-3">💊</span>
            <div>
              <h3 className="font-semibold text-red-800">Control Sanitario</h3>
              <p className="text-sm text-red-600">Medicamentos y vacunas</p>
            </div>
          </a>

          <a
            href="/ver-incubacion"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <span className="text-2xl mr-3">🐣</span>
            <div>
              <h3 className="font-semibold text-orange-800">Incubación</h3>
              <p className="text-sm text-orange-600">Proceso de incubación</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

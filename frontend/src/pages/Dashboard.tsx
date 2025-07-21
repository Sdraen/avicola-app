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
        console.log("🔄 Fetching dashboard stats...")

        const [avesResponse, huevosResponse, ventasResponse, jaulasResponse] = await Promise.all([
          avesAPI.getStats().catch((err) => {
            console.error("❌ Error fetching aves stats:", err)
            return { data: { totalBirds: 0, deceasedThisMonth: 0 } }
          }),
          huevosAPI.getStats().catch((err) => {
            console.error("❌ Error fetching huevos stats:", err)
            return { data: { totalEggs: 0, totalEggsToday: 0 } }
          }),
          ventasAPI.getStats().catch((err) => {
            console.error("❌ Error fetching ventas stats:", err)
            return { data: { totalSales: 0, totalRevenueThisMonth: 0 } }
          }),
          jaulasAPI.getStats().catch((err) => {
            console.error("❌ Error fetching jaulas stats:", err)
            return { data: { totalCages: 0, emptyCages: 0 } }
          }),
        ])

        console.log("📊 Dashboard responses:")
        console.log("🐓 Aves:", avesResponse.data)
        console.log("🥚 Huevos:", huevosResponse.data)
        console.log("💰 Ventas:", ventasResponse.data)
        console.log("🏠 Jaulas:", jaulasResponse.data)

        // ✅ SOLUCIÓN: Manejar tanto el formato antiguo como el nuevo
        const huevosData = huevosResponse.data?.data || huevosResponse.data
        const avesData = avesResponse.data?.data || avesResponse.data
        const ventasData = ventasResponse.data?.data || ventasResponse.data
        const jaulasData = jaulasResponse.data?.data || jaulasResponse.data

        console.log("🔧 Processed data:")
        console.log("🥚 Huevos processed:", huevosData)
        console.log("🐓 Aves processed:", avesData)

        setStats({
          totalBirds: avesData?.totalBirds || 0,
          deceasedThisMonth: avesData?.deceasedThisMonth || 0,
          totalEggs: huevosData?.totalEggs || huevosData?.totalRecords || 0,
          totalEggsToday: huevosData?.totalEggsToday || 0,
          totalSales: ventasData?.totalSales || 0,
          totalRevenue: ventasData?.totalRevenueThisMonth || ventasData?.totalRevenue || 0,
          totalCages: jaulasData?.totalCages || 0,
          emptyCages: jaulasData?.emptyCages || 0,
        })

        console.log("✅ Dashboard stats set successfully")
      } catch (err: any) {
        console.error("❌ Error fetching dashboard stats:", err)
        setError("Error al cargar estadísticas del dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Función para forzar actualización
  const forceRefresh = async () => {
    setLoading(true)
    setError("")

    // Limpiar caché del navegador
    if ("caches" in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((name) => caches.delete(name)))
    }

    // Recargar datos
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          <button
            onClick={forceRefresh}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Bienvenido al Dashboard 🐔</h1>
        <p className="dashboard-subtitle">Resumen del estado actual del sistema avícola Santa Luisa.</p>
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

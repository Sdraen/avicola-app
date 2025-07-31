"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { avesAPI, huevosAPI, ventasAPI, jaulasAPI, reportesAPI } from "../services/api"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import Swal from "sweetalert2"
import { formatearFechaChilena, formatearFechaLarga } from "../utils/formatoFecha"

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

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

interface ReportData {
  ventasMensuales: any[]
  produccionHuevos: any[]
  estadisticasAves: any[]
  usoInsumos: any[]
  produccionPorJaula: any[]
  ventasPorCliente: any[]
  evolucionAves: any[]
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate())
      .toISOString()
      .split("T")[0], // 1 mes antes de hoy
    endDate: new Date().toISOString().split("T")[0], // Hoy
  })
  const [selectedJaula, setSelectedJaula] = useState<number | null>(null)
  const [jaulas, setJaulas] = useState<any[]>([])
  const [ventasMetadata, setVentasMetadata] = useState<any>(null)

  // Solo cargar datos iniciales y jaulas al montar el componente, y cuando cambie el tab activo
  useEffect(() => {
    fetchDashboardData()
    fetchJaulas()
  }, []) // Solo carga inicial

  // Agregar este nuevo useEffect para recargas automáticas selectivas
  useEffect(() => {
    if (stats) {
      fetchDashboardData()
    }
  }, [activeTab, selectedJaula]) // Agregar selectedJaula aquí

  const fetchJaulas = async () => {
    try {
      const response = await jaulasAPI.getAll()
      setJaulas(response.data?.data || response.data || [])
    } catch (error) {
      console.error("Error fetching jaulas:", error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching dashboard data...")

      // Estadísticas básicas
      const [avesResponse, huevosResponse, ventasResponse, jaulasResponse] = await Promise.all([
        avesAPI.getStats().catch(() => ({ data: { totalBirds: 0, deceasedThisMonth: 0 } })),
        huevosAPI.getStats().catch(() => ({ data: { totalEggs: 0, totalEggsToday: 0 } })),
        ventasAPI.getStats().catch(() => ({ data: { totalSales: 0, totalRevenueThisMonth: 0 } })),
        jaulasAPI.getStats().catch(() => ({ data: { totalCages: 0, emptyCages: 0 } })),
      ])

      const huevosData = huevosResponse.data?.data || huevosResponse.data
      const avesData = avesResponse.data?.data || avesResponse.data
      const ventasData = ventasResponse.data?.data || ventasResponse.data
      const jaulasData = jaulasResponse.data?.data || jaulasResponse.data

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

      // Datos para reportes (ahora usando datos reales)
      await fetchReportData()

      console.log("✅ Dashboard data loaded successfully")
    } catch (err: any) {
      console.error("❌ Error fetching dashboard data:", err)
      setError("Error al cargar datos del dashboard")
    } finally {
      setLoading(false)
    }
  }

  const fetchReportData = async () => {
    try {
      const params = {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        ...(selectedJaula && { id_jaula: selectedJaula }),
      }

      console.log("🔄 Fetching report data with params:", params)

      const [
        ventasMensualesRes,
        produccionHuevosRes,
        estadisticasAvesRes,
        usoInsumosRes,
        produccionPorJaulaRes,
        ventasPorClienteRes,
        evolucionAvesRes,
      ] = await Promise.all([
        reportesAPI.getVentasMensuales(params).catch(() => ({ data: { data: [], meta: {} } })),
        reportesAPI.getProduccionHuevos(params).catch(() => ({ data: { data: [] } })),
        reportesAPI.getEstadisticasAves(params).catch(() => ({ data: { data: [] } })),
        reportesAPI.getUsoInsumos(params).catch(() => ({ data: { data: [] } })),
        reportesAPI.getProduccionPorJaula(params).catch(() => ({ data: { data: [] } })),
        reportesAPI.getVentasPorCliente(params).catch(() => ({ data: { data: [] } })),
        reportesAPI.getEvolucionAves(params).catch(() => ({ data: { data: [] } })),
      ])

      // Guardar metadata de ventas para mostrar información adicional
      setVentasMetadata(ventasMensualesRes.data?.meta || {})

      setReportData({
        ventasMensuales: ventasMensualesRes.data?.data || [],
        produccionHuevos: produccionHuevosRes.data?.data || [],
        estadisticasAves: estadisticasAvesRes.data?.data || [],
        usoInsumos: usoInsumosRes.data?.data || [],
        produccionPorJaula: produccionPorJaulaRes.data?.data || [],
        ventasPorCliente: ventasPorClienteRes.data?.data || [],
        evolucionAves: evolucionAvesRes.data?.data || [],
      })

      console.log("✅ Report data loaded successfully")
    } catch (error) {
      console.error("❌ Error fetching report data:", error)
    }
  }

  // Función para manejar la actualización manual
  const handleUpdateData = () => {
    console.log("🔄 Actualizando datos con filtros:", {
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
      selectedJaula,
    })
    fetchDashboardData()
  }

  // Función para calcular 1 mes antes de una fecha
  const getOneMonthBefore = (dateString: string): string => {
    const date = new Date(dateString)
    const oneMonthBefore = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate())
    return oneMonthBefore.toISOString().split("T")[0]
  }

  // Configuraciones de gráficos actualizadas
  const ventasChartData = {
    labels: reportData?.ventasMensuales.map((item) => item.periodo) || [],
    datasets: [
      {
        label: "Ventas ($)",
        data: reportData?.ventasMensuales.map((item) => item.ventas) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  }

  const produccionChartData = {
    labels: reportData?.produccionHuevos.map((item) => item.tipo) || [],
    datasets: [
      {
        label: "Cantidad",
        data: reportData?.produccionHuevos.map((item) => item.cantidad) || [],
        backgroundColor: ["#8B4513", "#A0522D", "#CD853F", "#DEB887", "#F5F5DC", "#FFFACD", "#FFFFE0", "#FFFFF0"],
      },
    ],
  }

  const avesChartData = {
    labels: reportData?.estadisticasAves.map((item) => item.categoria) || [],
    datasets: [
      {
        data: reportData?.estadisticasAves.map((item) => item.cantidad) || [],
        backgroundColor: reportData?.estadisticasAves.map((item) => item.color) || [],
      },
    ],
  }

  const evolucionAvesChartData = {
    labels:
      reportData?.evolucionAves.map((item) => {
        // Si item.mes es una fecha ISO, formatearla
        if (item.mes && item.mes.includes("-")) {
          return formatearFechaChilena(item.mes)
        }
        return item.mes
      }) || [],
    datasets: [
      {
        label: "Nacimientos",
        data: reportData?.evolucionAves.map((item) => item.nacimientos) || [],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
      {
        label: "Muertes",
        data: reportData?.evolucionAves.map((item) => item.muertes) || [],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
  }

  // Función helper para formatear fechas en tablas
  const formatearFechaTabla = (fecha: string | Date) => {
    if (!fecha) return "-"
    const fechaStr = typeof fecha === "string" ? fecha : fecha.toISOString()
    return formatearFechaChilena(fechaStr)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Avícola 📊</h1>
          <p className="text-gray-600 mt-1">
            Reportes gráficos y estadísticas operativas - {formatearFechaLarga(new Date().toISOString())}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Desde: {dateFilter.startDate ? formatearFechaChilena(dateFilter.startDate) : ""}
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter((prev) => ({ ...prev, startDate: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Hasta: {dateFilter.endDate ? formatearFechaChilena(dateFilter.endDate) : ""}
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => {
                  const newEndDate = e.target.value
                  setDateFilter((prev) => ({
                    startDate: getOneMonthBefore(newEndDate),
                    endDate: newEndDate,
                  }))
                }}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Jaula:</label>
              <select
                value={selectedJaula || ""}
                onChange={(e) => setSelectedJaula(e.target.value ? Number(e.target.value) : null)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las jaulas</option>
                {jaulas.map((jaula) => (
                  <option key={jaula.id_jaula} value={jaula.id_jaula}>
                    {jaula.codigo_jaula || `Jaula ${jaula.id_jaula}`}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleUpdateData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Actualizar
            </button>
            {/* Indicador del tipo de vista */}
            {ventasMetadata && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Vista: {ventasMetadata.tipo === "dias" ? "Por días" : "Por meses"}({ventasMetadata.rango_dias} días)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Resumen General", icon: "📈" },
              { id: "sales", name: "Ventas", icon: "💰" },
              { id: "production", name: "Producción", icon: "🥚" },
              { id: "birds", name: "Aves", icon: "🐓" },
              { id: "supplies", name: "Insumos", icon: "📦" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-lg">🐓</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Aves</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.totalBirds || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">🥚</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Huevos Recolectados</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.totalEggs || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-lg">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.totalSales || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-lg">🏠</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Jaulas Activas</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(stats?.totalCages || 0) - (stats?.emptyCages || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos de resumen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {ventasMetadata?.tipo === "dias" ? "Ventas Diarias" : "Ventas Mensuales"}
                  {ventasMetadata && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({ventasMetadata.total_registros} {ventasMetadata.tipo === "dias" ? "días" : "meses"})
                    </span>
                  )}
                </h3>
                <div className="h-64">
                  <Line data={ventasChartData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Aves</h3>
                <div className="h-64">
                  <Doughnut data={avesChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sales" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {ventasMetadata?.tipo === "dias" ? "Ventas Diarias" : "Ventas Mensuales"}
                </h3>
                <div className="h-80">
                  <Line data={ventasChartData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Cliente</h3>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: reportData?.ventasPorCliente.map((item) => item.cliente) || [],
                      datasets: [
                        {
                          label: "Ventas ($)",
                          data: reportData?.ventasPorCliente.map((item) => item.ventas) || [],
                          backgroundColor: "rgba(59, 130, 246, 0.8)",
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>

            {/* Tabla de ventas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Ventas por Cliente</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ventas ($)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pedidos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.ventasPorCliente.map((cliente, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cliente.cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${cliente.ventas.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.pedidos}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${Math.round(cliente.ventas / cliente.pedidos).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "production" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Producción por Tipo de Huevo</h3>
                <div className="h-80">
                  <Bar data={produccionChartData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Producción por Jaula</h3>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: reportData?.produccionPorJaula.map((item) => item.jaula) || [],
                      datasets: [
                        {
                          label: "Producción",
                          data: reportData?.produccionPorJaula.map((item) => item.produccion) || [],
                          backgroundColor: "rgba(16, 185, 129, 0.8)",
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>

            {/* Tabla de producción */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Producción por Jaula</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jaula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Eficiencia (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.produccionPorJaula.map((jaula, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{jaula.jaula}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{jaula.produccion} huevos</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{jaula.eficiencia}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              jaula.eficiencia >= 80
                                ? "bg-green-100 text-green-800"
                                : jaula.eficiencia >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {jaula.eficiencia >= 80 ? "Excelente" : jaula.eficiencia >= 60 ? "Buena" : "Baja"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "birds" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Aves</h3>
                <div className="h-80">
                  <Doughnut data={avesChartData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución Mensual</h3>
                <div className="h-80">
                  <Line data={evolucionAvesChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Resumen de aves */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Aves</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {reportData?.estadisticasAves.map((stat, index) => (
                  <div key={index} className="text-center p-4 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold" style={{ color: stat.color }}>
                      {stat.cantidad}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{stat.categoria}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "supplies" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Insumos</h3>
              <div className="h-80">
                <Bar
                  data={{
                    labels: reportData?.usoInsumos.map((item) => item.insumo) || [],
                    datasets: [
                      {
                        label: "Consumo (unidades)",
                        data: reportData?.usoInsumos.map((item) => item.consumo) || [],
                        backgroundColor: "rgba(59, 130, 246, 0.8)",
                        yAxisID: "y",
                      },
                      {
                        label: "Costo ($)",
                        data: reportData?.usoInsumos.map((item) => item.costo) || [],
                        backgroundColor: "rgba(239, 68, 68, 0.8)",
                        yAxisID: "y1",
                      },
                    ],
                  }}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        type: "linear",
                        display: true,
                        position: "left",
                      },
                      y1: {
                        type: "linear",
                        display: true,
                        position: "right",
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Tabla de insumos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Consumo de Insumos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Insumo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consumo (unidades)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Costo ($)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.usoInsumos.map((insumo, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {insumo.insumo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insumo.consumo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${insumo.costo.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insumo.items}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => {
            Swal.fire({
              title: "🚧 Función en desarrollo",
              text: "La exportación de reportes estará disponible próximamente",
              icon: "info",
              confirmButtonText: "Entendido",
              confirmButtonColor: "#3B82F6",
              showClass: {
                popup: "animate__animated animate__fadeInDown",
              },
              hideClass: {
                popup: "animate__animated animate__fadeOutUp",
              },
            })
          }}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Exportar reportes"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Dashboard

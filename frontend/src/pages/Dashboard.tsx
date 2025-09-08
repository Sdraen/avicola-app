"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
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
import {
  formatearFechaChilena,
  formatearFechaLarga,
  obtenerFechaLocalHoy,
} from "../utils/formatoFecha"

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
  /** Resumen por categoría (insumo, consumo, costo, items) */
  usoInsumos: any[]
  /** Nuevo: detalle por implemento (nombre, categoria, caracteristicas, ubicacion, proveedor, compra, fecha, estado, cantidad, costo_total) */
  usoInsumosDetalle: any[]
  produccionPorJaula: any[]
  ventasPorCliente: any[]
  evolucionAves: any[]
}

// util local: formatea Date -> "YYYY-MM-DD" *en horario local*
const toInputDateLocal = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// util: un mes antes de una fecha de input "YYYY-MM-DD"
const getOneMonthBefore = (dateString: string): string => {
  // construir fecha en local evitando UTC
  const [y, m, d] = dateString.split("-").map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)
  const oneMonthBefore = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate())
  return toInputDateLocal(oneMonthBefore)
}

// helpers UI
const SortIcon: React.FC<{ dir?: "asc" | "desc" | null }> = ({ dir }) => {
  return (
    <span className="inline-block ml-1 text-gray-400">
      {dir === "asc" ? "▲" : dir === "desc" ? "▼" : "↕"}
    </span>
  )
}

type Dir = "asc" | "desc"
type SummaryKey = "insumo" | "consumo" | "costo" | "items"
type DetailKey =
  | "nombre"
  | "categoria"
  | "proveedor"
  | "compra"
  | "fecha"
  | "cantidad"
  | "costo_total"
  | "estado"
  | "ubicacion"

const Dashboard: React.FC = () => {
  const hoy = new Date()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [dateFilter, setDateFilter] = useState({
    // 1 mes antes de HOY en horario local (sin UTC)
    startDate: toInputDateLocal(new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate())),
    endDate: obtenerFechaLocalHoy(), // HOY local
  })
  const [selectedJaula, setSelectedJaula] = useState<number | null>(null)
  const [jaulas, setJaulas] = useState<any[]>([])
  const [ventasMetadata, setVentasMetadata] = useState<any>(null)

  // ====== Estados nuevos para Insumos ======
  // Controles superiores
  const [suppliesSearch, setSuppliesSearch] = useState("")
  const [filterCategoria, setFilterCategoria] = useState<string>("")
  const [filterProveedor, setFilterProveedor] = useState<string>("")
  const [chartSortBy, setChartSortBy] = useState<"consumo" | "costo" | "insumo">("costo")
  const [chartTopN, setChartTopN] = useState<number>(10)

  // Ordenamiento resumen
  const [summarySort, setSummarySort] = useState<{ key: SummaryKey; dir: Dir }>({ key: "costo", dir: "desc" })
  // Ordenamiento detalle
  const [detailSort, setDetailSort] = useState<{ key: DetailKey; dir: Dir }>({ key: "fecha", dir: "desc" })

  // Paginación detalle
  const [detailPage, setDetailPage] = useState(1)
  const [detailPageSize, setDetailPageSize] = useState<10 | 25 | 50>(10)

  // cargar datos iniciales y jaulas al montar
  useEffect(() => {
    fetchDashboardData()
    fetchJaulas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // recargas selectivas
  useEffect(() => {
    if (stats) {
      fetchDashboardData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedJaula])

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

      // Datos para reportes
      await fetchReportData()

      console.log("✅ Dashboard cargada con éxito")
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

      // Guardar metadata de ventas
      setVentasMetadata(ventasMensualesRes.data?.meta || {})

      // Normalización de usoInsumos
      const ui = usoInsumosRes?.data?.data
      const usoResumen = Array.isArray(ui) ? ui : Array.isArray(ui?.consumoPorCategoria) ? ui.consumoPorCategoria : []
      const usoDetalle = Array.isArray(ui?.detalle) ? ui.detalle : []

      setReportData({
        ventasMensuales: ventasMensualesRes.data?.data || [],
        produccionHuevos: produccionHuevosRes.data?.data || [],
        estadisticasAves: estadisticasAvesRes.data?.data || [],
        usoInsumos: usoResumen,
        usoInsumosDetalle: usoDetalle,
        produccionPorJaula: produccionPorJaulaRes.data?.data || [],
        ventasPorCliente: ventasPorClienteRes.data?.data || [],
        evolucionAves: evolucionAvesRes.data?.data || [],
      })

      // cada vez que cambia el dataset, reseteamos paginación para no quedar en una página fuera de rango
      setDetailPage(1)

      console.log("✅ Report data loaded successfully")
    } catch (error) {
      console.error("❌ Error fetching report data:", error)
    }
  }

  // Actualizar con filtros
  const handleUpdateData = () => {
    console.log("🔄 Actualizando datos con filtros:", {
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
      selectedJaula,
    })
    fetchDashboardData()
  }

  // =======================
  // Derivados para Insumos
  // =======================
  const categorias = useMemo(() => {
    const set = new Set<string>()
    reportData?.usoInsumosDetalle?.forEach((d) => d?.categoria && set.add(String(d.categoria)))
    return Array.from(set).sort()
  }, [reportData?.usoInsumosDetalle])

  const proveedores = useMemo(() => {
    const set = new Set<string>()
    reportData?.usoInsumosDetalle?.forEach((d) => d?.proveedor && set.add(String(d.proveedor)))
    return Array.from(set).sort()
  }, [reportData?.usoInsumosDetalle])

  // Función de orden genérica
  function cmp(a: any, b: any, key: string, dir: Dir) {
    const va = a?.[key]
    const vb = b?.[key]
    const na = typeof va === "number" ? va : key === "fecha" ? new Date(va || 0).getTime() : String(va ?? "").toLowerCase()
    const nb = typeof vb === "number" ? vb : key === "fecha" ? new Date(vb || 0).getTime() : String(vb ?? "").toLowerCase()
    if (na < nb) return dir === "asc" ? -1 : 1
    if (na > nb) return dir === "asc" ? 1 : -1
    return 0
  }

  // Resumen (arriba de la sección) con orden + búsqueda
  const resumenFiltradoYOrdenado = useMemo(() => {
    let rows = (reportData?.usoInsumos || []).slice()

    const term = suppliesSearch.trim().toLowerCase()
    if (term) {
      rows = rows.filter(
        (r) =>
          String(r.insumo ?? "").toLowerCase().includes(term) ||
          String(r.categoria ?? "").toLowerCase().includes(term)
      )
    }

    if (filterCategoria) {
      rows = rows.filter((r) => String(r.categoria ?? "") === filterCategoria)
    }

    if (filterProveedor) {
      // Para el resumen, intentamos filtrar por proveedor si existe ese campo en r,
      // si no existe, intentamos una intersección con el detalle por nombre de insumo
      const prov = filterProveedor
      const nombresQueTienenProveedor = new Set(
        (reportData?.usoInsumosDetalle || [])
          .filter((d) => String(d.proveedor ?? "") === prov)
          .map((d) => String(d.nombre ?? ""))
      )
      rows = rows.filter((r) => {
        if (r.proveedor) return String(r.proveedor) === prov
        return nombresQueTienenProveedor.has(String(r.insumo ?? ""))
      })
    }

    rows.sort((a, b) => {
      if (summarySort.key === "insumo") {
        return cmp(a, b, "insumo", summarySort.dir)
      }
      if (summarySort.key === "consumo") {
        return cmp(a, b, "consumo", summarySort.dir)
      }
      if (summarySort.key === "costo") {
        return cmp(a, b, "costo", summarySort.dir)
      }
      return cmp(a, b, "items", summarySort.dir)
    })
    return rows
  }, [reportData?.usoInsumos, summarySort, suppliesSearch, filterCategoria, filterProveedor, reportData?.usoInsumosDetalle])

  // Datos del gráfico con Top N y orden elegible
  const chartSupplies = useMemo(() => {
    const rows = resumenFiltradoYOrdenado.slice()
    rows.sort((a, b) => cmp(a, b, chartSortBy, "desc"))
    const top = rows.slice(0, chartTopN)
    return {
      labels: top.map((r) => r.insumo),
      datasets: [
        {
          label: "Consumo (unidades)",
          data: top.map((r) => Number(r.consumo || 0)),
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          yAxisID: "y",
        },
        {
          label: "Costo ($)",
          data: top.map((r) => Number(r.costo || 0)),
          backgroundColor: "rgba(239, 68, 68, 0.8)",
          yAxisID: "y1",
        },
      ],
    }
  }, [resumenFiltradoYOrdenado, chartSortBy, chartTopN])

  // Detalle filtrado + ordenado + paginado
  const detalleFiltradoOrdenado = useMemo(() => {
    let rows = (reportData?.usoInsumosDetalle || []).slice()

    const term = suppliesSearch.trim().toLowerCase()
    if (term) {
      rows = rows.filter((d) => {
        return (
          String(d.nombre ?? "").toLowerCase().includes(term) ||
          String(d.categoria ?? "").toLowerCase().includes(term) ||
          String(d.proveedor ?? "").toLowerCase().includes(term) ||
          String(d.estado ?? "").toLowerCase().includes(term) ||
          String(d.ubicacion ?? "").toLowerCase().includes(term)
        )
      })
    }
    if (filterCategoria) rows = rows.filter((d) => String(d.categoria ?? "") === filterCategoria)
    if (filterProveedor) rows = rows.filter((d) => String(d.proveedor ?? "") === filterProveedor)

    rows.sort((a, b) => cmp(a, b, detailSort.key, detailSort.dir))

    return rows
  }, [reportData?.usoInsumosDetalle, suppliesSearch, filterCategoria, filterProveedor, detailSort])

  const detallePaginado = useMemo(() => {
    const start = (detailPage - 1) * detailPageSize
    const end = start + detailPageSize
    return detalleFiltradoOrdenado.slice(start, end)
  }, [detalleFiltradoOrdenado, detailPage, detailPageSize])

  const detalleTotalPages = Math.max(1, Math.ceil((detalleFiltradoOrdenado.length || 0) / detailPageSize))

  // Configs de gráficos generales
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
        if (item.mes && typeof item.mes === "string" && item.mes.includes("-")) {
          return formatearFechaChilena(item.mes) // ahora usa zona America/Santiago desde utils
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
      legend: { position: "top" as const },
      title: { display: false },
    },
  }

  // Helper de tablas
  const formatearFechaTabla = (fecha: string | Date) => {
    if (!fecha) return "-"
    const fechaStr = typeof fecha === "string" ? fecha : toInputDateLocal(fecha)
    return formatearFechaChilena(fechaStr)
  }

  // Para cambiar orden al hacer click en cabecera
  function toggleSummarySort(key: SummaryKey) {
    setSummarySort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" }
      return { key, dir: key === "insumo" ? "asc" : "desc" }
    })
  }
  function toggleDetailSort(key: DetailKey) {
    setDetailSort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" }
      // heurística: nombre asc; números/fecha desc por defecto
      const defaultDir: Dir = ["nombre", "categoria", "proveedor", "compra", "estado", "ubicacion"].includes(key) ? "asc" : "desc"
      return { key, dir: defaultDir }
    })
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
            Reportes gráficos y estadísticas operativas - {formatearFechaLarga(obtenerFechaLocalHoy())}
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
                  setDateFilter({
                    startDate: getOneMonthBefore(newEndDate),
                    endDate: newEndDate,
                  })
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
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
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
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cliente.cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ${cliente.ventas.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cliente.pedidos}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ${Math.round(cliente.ventas / Math.max(cliente.pedidos || 1, 1)).toLocaleString()}
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
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{jaula.jaula}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{jaula.produccion} huevos</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 relative">
                          {jaula.eficiencia}%
                          <span className="ml-1 cursor-help text-gray-400 group relative">ⓘ
                            <span className="absolute z-10 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-pre">
                              {`🥚 ¿Qué significa la eficiencia? La eficiencia muestra la relación entre la producción por jaula y lo esperado por aves y días del rango.`}
                            </span>
                          </span>
                        </td>
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
            {/* Controles de Insumos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
                  <input
                    placeholder="Nombre, categoría, proveedor, estado, ubicación…"
                    value={suppliesSearch}
                    onChange={(e) => { setSuppliesSearch(e.target.value); setDetailPage(1) }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
                  <select
                    value={filterCategoria}
                    onChange={(e) => { setFilterCategoria(e.target.value); setDetailPage(1) }}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas</option>
                    {categorias.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor</label>
                  <select
                    value={filterProveedor}
                    onChange={(e) => { setFilterProveedor(e.target.value); setDetailPage(1) }}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos</option>
                    {proveedores.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Orden gráfico</label>
                  <select
                    value={chartSortBy}
                    onChange={(e) => setChartSortBy(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="costo">Mayor costo</option>
                    <option value="consumo">Mayor consumo</option>
                    <option value="insumo">A–Z</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Top N</label>
                  <select
                    value={chartTopN}
                    onChange={(e) => setChartTopN(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[5, 10, 15, 20, 30].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Insumos</h3>
              <div className="h-80">
                <Bar
                  data={chartSupplies}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: { type: "linear", display: true, position: "left" },
                      y1: { type: "linear", display: true, position: "right", grid: { drawOnChartArea: false } },
                    },
                  }}
                />
              </div>
            </div>

            {/* Tabla de resumen por categoría */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Resumen de Consumo por Insumo</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Orden:</span>
                  <button
                    className={`px-2 py-1 rounded border ${summarySort.key === "costo" ? "border-blue-500 text-blue-600" : "border-gray-300 text-gray-700"}`}
                    onClick={() => toggleSummarySort("costo")}
                  >
                    Costo <SortIcon dir={summarySort.key === "costo" ? summarySort.dir : null} />
                  </button>
                  <button
                    className={`px-2 py-1 rounded border ${summarySort.key === "consumo" ? "border-blue-500 text-blue-600" : "border-gray-300 text-gray-700"}`}
                    onClick={() => toggleSummarySort("consumo")}
                  >
                    Consumo <SortIcon dir={summarySort.key === "consumo" ? summarySort.dir : null} />
                  </button>
                  <button
                    className={`px-2 py-1 rounded border ${summarySort.key === "insumo" ? "border-blue-500 text-blue-600" : "border-gray-300 text-gray-700"}`}
                    onClick={() => toggleSummarySort("insumo")}
                  >
                    Insumo <SortIcon dir={summarySort.key === "insumo" ? summarySort.dir : null} />
                  </button>
                  <button
                    className={`px-2 py-1 rounded border ${summarySort.key === "items" ? "border-blue-500 text-blue-600" : "border-gray-300 text-gray-700"}`}
                    onClick={() => toggleSummarySort("items")}
                  >
                    Ítems <SortIcon dir={summarySort.key === "items" ? summarySort.dir : null} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => toggleSummarySort("insumo")}>
                        Insumo <SortIcon dir={summarySort.key === "insumo" ? summarySort.dir : null} />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => toggleSummarySort("consumo")}>
                        Consumo (unidades) <SortIcon dir={summarySort.key === "consumo" ? summarySort.dir : null} />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => toggleSummarySort("costo")}>
                        Costo ($) <SortIcon dir={summarySort.key === "costo" ? summarySort.dir : null} />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => toggleSummarySort("items")}>
                        Ítems <SortIcon dir={summarySort.key === "items" ? summarySort.dir : null} />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resumenFiltradoYOrdenado.map((insumo, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {insumo.insumo}
                          {insumo.categoria && (
                            <span className="ml-2 text-xs text-gray-500">({insumo.categoria})</span>
                          )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{Number(insumo.consumo || 0).toLocaleString()}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                          ${Number(insumo.costo || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{Number(insumo.items || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    {resumenFiltradoYOrdenado.length === 0 && (
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                          No hay datos para los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabla de detalle de insumos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalle de Consumo de Insumos</h3>
                {/* Paginación controles */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600">
                    Filas:
                    <select
                      className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                      value={detailPageSize}
                      onChange={(e) => { setDetailPageSize(Number(e.target.value) as any); setDetailPage(1) }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </label>
                  <div className="text-sm text-gray-600">{detalleFiltradoOrdenado.length} registros</div>
                  <div className="flex items-center gap-1">
                    <button
                      className="px-2 py-1 border rounded disabled:opacity-50"
                      onClick={() => setDetailPage((p) => Math.max(1, p - 1))}
                      disabled={detailPage === 1}
                    >
                      ←
                    </button>
                    <span className="text-sm text-gray-700 px-1">
                      {detailPage} / {detalleTotalPages}
                    </span>
                    <button
                      className="px-2 py-1 border rounded disabled:opacity-50"
                      onClick={() => setDetailPage((p) => Math.min(detalleTotalPages, p + 1))}
                      disabled={detailPage === detalleTotalPages}
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {[
                        { k: "nombre", label: "Insumo" },
                        { k: "categoria", label: "Categoría" },
                        { k: "caracteristicas", label: "Características", noSort: true },
                        { k: "ubicacion", label: "Ubicación", noSort: false },
                        { k: "proveedor", label: "Proveedor" },
                        { k: "compra", label: "Compra" },
                        { k: "fecha", label: "Fecha" },
                        { k: "cantidad", label: "Cantidad" },
                        { k: "costo_total", label: "Costo" },
                        { k: "estado", label: "Estado" },
                      ].map((col) => (
                        <th
                          key={col.k}
                          className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${col.noSort ? "" : "cursor-pointer"}`}
                          onClick={() => { if (!col.noSort) toggleDetailSort(col.k as DetailKey) }}
                          title={col.noSort ? undefined : "Ordenar"}
                        >
                          <span className="inline-flex items-center">
                            {col.label} {!col.noSort && <SortIcon dir={detailSort.key === col.k ? detailSort.dir : null} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detallePaginado.map((d, idx) => (
                      <tr key={`${d.nombre}-${idx}`} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{d.nombre}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{d.categoria || "Sin categoría"}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{d.caracteristicas || "—"}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{d.ubicacion || "—"}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{d.proveedor || "—"}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{d.compra || "—"}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                          {d.fecha ? formatearFechaTabla(d.fecha) : "—"}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                          {Number(d.cantidad || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                          ${Number(d.costo_total || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{d.estado || "—"}</td>
                      </tr>
                    ))}
                    {detallePaginado.length === 0 && (
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-500" colSpan={10}>
                          No hay detalle disponible para los filtros aplicados.
                        </td>
                      </tr>
                    )}
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
              showClass: { popup: "animate__animated animate__fadeInDown" },
              hideClass: { popup: "animate__animated animate__fadeOutUp" },
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

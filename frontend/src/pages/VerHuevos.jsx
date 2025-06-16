"use client"

import { useState } from "react"
import "../styles/VerHuevos.css"

const VerHuevos = () => {
  // Datos mock de registros históricos
  const [registros, setRegistros] = useState([
    {
      id: 1,
      fecha: "2024-01-15",
      hora: "08:30",
      cantidad: 45,
      raza: "Leghorn",
      observaciones: "Recolección matutina normal",
    },
    {
      id: 2,
      fecha: "2024-01-15",
      hora: "14:15",
      cantidad: 32,
      raza: "Rhode Island",
      observaciones: "Algunas aves parecían estresadas",
    },
    {
      id: 3,
      fecha: "2024-01-15",
      hora: "18:00",
      cantidad: 28,
      raza: "Plymouth Rock",
      observaciones: "",
    },
    {
      id: 4,
      fecha: "2024-01-14",
      hora: "09:00",
      cantidad: 52,
      raza: "Leghorn",
      observaciones: "Excelente producción",
    },
    {
      id: 5,
      fecha: "2024-01-14",
      hora: "16:30",
      cantidad: 38,
      raza: "Sussex",
      observaciones: "Recolección vespertina",
    },
    {
      id: 6,
      fecha: "2024-01-13",
      hora: "08:45",
      cantidad: 41,
      raza: "Australorp",
      observaciones: "Producción estable",
    },
  ])

  // Filtros
  const [filtroFecha, setFiltroFecha] = useState("")
  const [filtroRaza, setFiltroRaza] = useState("")

  // Obtener razas únicas para el filtro
  const razasUnicas = [...new Set(registros.map((registro) => registro.raza))].sort()

  // Filtrar registros
  const registrosFiltrados = registros.filter((registro) => {
    const cumpleFecha = !filtroFecha || registro.fecha === filtroFecha
    const cumpleRaza = !filtroRaza || registro.raza === filtroRaza
    return cumpleFecha && cumpleRaza
  })

  // Estadísticas
  const totalHuevos = registrosFiltrados.reduce((total, registro) => total + registro.cantidad, 0)
  const promedioHuevos = registrosFiltrados.length > 0 ? Math.round(totalHuevos / registrosFiltrados.length) : 0

  // Agrupar por fecha para mejor visualización
  const registrosAgrupados = registrosFiltrados.reduce((grupos, registro) => {
    const fecha = registro.fecha
    if (!grupos[fecha]) {
      grupos[fecha] = []
    }
    grupos[fecha].push(registro)
    return grupos
  }, {})

  const formatearFecha = (fecha) => {
    return new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="ver-huevos-container">
      {/* Header con estadísticas */}
      <div className="stats-header">
        <div className="header-content">
          <div className="header-icon">🥚</div>
          <div className="header-text">
            <h1 className="table-title">Historial de Recolección</h1>
            <p className="table-subtitle">Registros de producción de huevos</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{totalHuevos}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{registrosFiltrados.length}</span>
              <span className="stat-label">Registros</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{promedioHuevos}</span>
              <span className="stat-label">Promedio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">
              <span className="filter-icon">📅</span>
              Filtrar por fecha
            </label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">
              <span className="filter-icon">🧬</span>
              Filtrar por raza
            </label>
            <select value={filtroRaza} onChange={(e) => setFiltroRaza(e.target.value)} className="filter-select">
              <option value="">Todas las razas</option>
              {razasUnicas.map((raza) => (
                <option key={raza} value={raza}>
                  {raza}
                </option>
              ))}
            </select>
          </div>
          {(filtroFecha || filtroRaza) && (
            <button
              className="clear-filters"
              onClick={() => {
                setFiltroFecha("")
                setFiltroRaza("")
              }}
            >
              <span className="clear-icon">🗑️</span>
              <span className="clear-text">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Registros agrupados por fecha */}
      <div className="registros-section">
        {Object.keys(registrosAgrupados).length > 0 ? (
          <div className="fechas-container">
            {Object.entries(registrosAgrupados)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([fecha, registrosDia]) => {
                const totalDia = registrosDia.reduce((total, registro) => total + registro.cantidad, 0)
                return (
                  <div key={fecha} className="fecha-group">
                    <div className="fecha-header">
                      <div className="fecha-info">
                        <h3 className="fecha-title">{formatearFecha(fecha)}</h3>
                        <span className="fecha-total">{totalDia} huevos recolectados</span>
                      </div>
                    </div>
                    <div className="registros-grid">
                      {registrosDia
                        .sort((a, b) => a.hora.localeCompare(b.hora))
                        .map((registro, index) => (
                          <div key={registro.id} className="registro-card">
                            <div className="card-header">
                              <div className="card-time">
                                <span className="time-icon">🕐</span>
                                <span className="time-text">{registro.hora}</span>
                              </div>
                              <div className="card-cantidad">
                                <span className="cantidad-number">{registro.cantidad}</span>
                                <span className="cantidad-label">huevos</span>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="card-raza">
                                <span className="raza-icon">🧬</span>
                                <span className="raza-text">{registro.raza}</span>
                              </div>
                              {registro.observaciones && (
                                <div className="card-observaciones">
                                  <span className="obs-icon">📝</span>
                                  <span className="obs-text">{registro.observaciones}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🥚</div>
            <p className="empty-text">No se encontraron registros</p>
            <p className="empty-subtitle">
              {filtroFecha || filtroRaza
                ? "Intenta ajustar los filtros"
                : "Comienza registrando tu primera recolección"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerHuevos

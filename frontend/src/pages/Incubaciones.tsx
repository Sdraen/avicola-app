// src/pages/Incubaciones.tsx
"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const Incubaciones: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">🥚</div>
        <h1 className="modulo-title">Gestión de Incubaciones</h1>
        <p className="modulo-description">
          Inicia, monitorea y finaliza procesos de incubación. Registra nacimientos y consulta estadísticas.
        </p>
      </div>

      {/* Accesos rápidos */}
      <div className="button-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Ver Incubaciones */}
        <button
          className="action-button primary"
          onClick={() => navigate("/ver-incubaciones")}
          aria-label="Ver Incubaciones"
        >
          📋 Ver Incubaciones
        </button>

        {/* Registrar / Iniciar Incubación */}
        <button
          className="action-button secondary"
          onClick={() => navigate("/registrar-incubacion")}
          aria-label="Registrar Incubación"
        >
          ➕ Iniciar Incubación
        </button>

        {/* Ver Incubadoras */}
        <button
          className="action-button secondary"
          onClick={() => navigate("/ver-incubadoras")}
          aria-label="Ver Incubadoras"
        >
          🧺 Ver Incubadoras
        </button>

        {/* Registrar Incubadora */}
        <button
          className="action-button secondary"
          onClick={() => navigate("/registrar-incubadora")}
          aria-label="Registrar Incubadora"
        >
          🛠️ Registrar Incubadora
        </button>
      </div>
    </div>
  )
}

export default Incubaciones

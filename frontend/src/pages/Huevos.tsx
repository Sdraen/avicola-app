// src/pages/Huevos.tsx
"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const Huevos: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">🥚</div>
        <h1 className="modulo-title">Gestión de Huevos</h1>
        <p className="modulo-description">
          Administra el registro, clasificación y seguimiento de la producción de huevos del sistema avícola.
        </p>
      </div>

      {/* Accesos rápidos */}
      <div className="button-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 my-6">
        {/* Ver Huevos */}
        <button
          className="action-button primary"
          onClick={() => navigate("/ver-huevos")}
          aria-label="Ver Registros de Huevos"
        >
          📋 Ver Registros de Huevos
        </button>

        {/* Registrar Huevos */}
        <button
          className="action-button secondary"
          onClick={() => navigate("/registrar-huevos")}
          aria-label="Registrar Huevos"
        >
          ➕ Registrar Huevos por Jaula
        </button>

        {/* Ver Bandejas */}
        <button
          className="action-button secondary"
          onClick={() => navigate("/ver-bandejas")}
          aria-label="Ver Bandejas"
        >
          🧺 Bandejas
        </button>
      </div>

      {/* Información del módulo */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Módulo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Funcionalidades:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Registro de huevos por jaula</li>
              <li>• Clasificación por tipo y tamaño</li>
              <li>• Estadísticas de producción</li>
              <li>• Reportes por fecha</li>
              <li>• Gestión de bandejas y asignación de huevos</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Tipos de Huevos:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Café: Chico, Mediano, Grande, Jumbo</li>
              <li>• Blanco: Chico, Mediano, Grande, Jumbo</li>
              <li>• Control de calidad integrado</li>
              <li>• Trazabilidad completa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Huevos

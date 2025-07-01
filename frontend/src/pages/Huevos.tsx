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
          Administra el registro y seguimiento de la producción de huevos del sistema avícola.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-6 my-6">
        <button className="action-button primary" onClick={() => navigate("/ver-huevos")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Registros de Huevos</span>
        </button>

        <button className="action-button primary" onClick={() => navigate("/registrar-huevos")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Huevos por Jaula</span>
        </button>
      </div>

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

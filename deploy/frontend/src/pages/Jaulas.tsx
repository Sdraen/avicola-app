"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const Jaulas: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">🏠</div>
        <h1 className="modulo-title">Gestión de Jaulas</h1>
        <p className="modulo-description">
          Administra las jaulas del sistema avícola, su capacidad, ubicación y estado.
        </p>
      </div>

      <div className="button-group">
        <button className="action-button primary" onClick={() => navigate("/ver-jaulas")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Jaulas</span>
        </button>
        <button className="action-button secondary" onClick={() => navigate("/registrar-jaula")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Jaula</span>
        </button>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Módulo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Funcionalidades:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Registro de jaulas por estanque</li>
              <li>• Control de capacidad</li>
              <li>• Seguimiento de aves por jaula</li>
              <li>• Servicios de higiene</li>
              <li>• Estadísticas de ocupación</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Características:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Capacidad máxima: 20 aves por jaula</li>
              <li>• Organización por estanques</li>
              <li>• Control sanitario integrado</li>
              <li>• Trazabilidad completa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Jaulas

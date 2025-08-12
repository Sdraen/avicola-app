"use client"

import { useNavigate } from "react-router-dom"
import React from "react"

const ControlSanitario: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      {/* Header */}
      <div className="modulo-header">
        <div className="modulo-icon">🧪</div>
        <h1 className="modulo-title">Control Sanitario</h1>
        <p className="modulo-description">
          Administra medicamentos y vacunas del sistema avícola desde un solo lugar.
        </p>
      </div>

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 my-6">
        {/* Medicamentos */}
        <button className="action-button primary" onClick={() => navigate("/ver-medicamentos")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Medicamentos</span>
        </button>

        <button className="action-button primary" onClick={() => navigate("/registrar-medicamento")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Medicamento</span>
        </button>

        {/* Vacunas */}
        <button className="action-button primary" onClick={() => navigate("/ver-vacunas")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Vacunas</span>
        </button>

        <button className="action-button primary" onClick={() => navigate("/registrar-vacuna")}>
          <span className="button-icon">💉</span>
          <span className="button-text">Registrar Vacuna</span>
        </button>
      </div>

      {/* Información del módulo */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Módulo</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medicamentos */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Medicamentos — Funciones:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Registro de medicamentos con nombre y dosis estándar</li>
              <li>• Búsqueda por nombre</li>
              <li>• Edición y eliminación (solo si no han sido aplicados)</li>
            </ul>

            <h3 className="font-semibold text-gray-700 mt-4 mb-2">Reglas:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Nombres deben ser únicos</li>
              <li>• Solo Admin puede eliminar</li>
              <li>• Si el medicamento ya fue aplicado, no se puede eliminar</li>
            </ul>
          </div>

          {/* Vacunas */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Vacunas — Funciones:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Registro de vacunas (nombre, dosis y fecha de administración)</li>
              <li>• Búsqueda por nombre</li>
              <li>• Edición y eliminación (solo si no han sido aplicadas)</li>
            </ul>

            <h3 className="font-semibold text-gray-700 mt-4 mb-2">Reglas:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Nombres deben ser únicos</li>
              <li>• La fecha de administración es obligatoria y no puede ser futura</li>
              <li>• Solo Admin puede eliminar</li>
              <li>• Si la vacuna ya fue aplicada, no se puede eliminar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlSanitario

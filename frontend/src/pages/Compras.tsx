"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const Compras: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">🛒</div>
        <h1 className="modulo-title">Gestión de Compras</h1>
        <p className="modulo-description">
          Administra las compras de implementos, alimentos y suministros para el sistema avícola.
        </p>
      </div>

      <div className="button-group">
        <button className="action-button primary" onClick={() => navigate("/ver-compras")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Compras</span>
        </button>
        <button className="action-button secondary" onClick={() => navigate("/registrar-compra")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Compra</span>
        </button>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Módulo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Funcionalidades:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Registro de compras con implementos</li>
              <li>• Control de costos y gastos</li>
              <li>• Seguimiento de proveedores</li>
              <li>• Reportes por fecha</li>
              <li>• Estadísticas de gastos</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Tipos de Compras:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Alimentos y concentrados</li>
              <li>• Medicamentos y vacunas</li>
              <li>• Equipos y herramientas</li>
              <li>• Materiales de construcción</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Compras

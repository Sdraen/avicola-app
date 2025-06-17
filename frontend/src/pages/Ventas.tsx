"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const Ventas: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">💰</div>
        <h1 className="modulo-title">Gestión de Ventas</h1>
        <p className="modulo-description">
          Administra las ventas de productos avícolas, facturación y seguimiento de ingresos.
        </p>
      </div>

      <div className="button-group">
        <button className="action-button primary" onClick={() => navigate("/ver-ventas")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Ventas</span>
        </button>
        <button className="action-button secondary" onClick={() => navigate("/registrar-venta")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Venta</span>
        </button>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Módulo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Funcionalidades:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Registro de ventas por cliente</li>
              <li>• Control de códigos de barras</li>
              <li>• Seguimiento de ingresos</li>
              <li>• Reportes por fecha</li>
              <li>• Estadísticas de ventas</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Características:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Vinculación con clientes</li>
              <li>• Control de inventario</li>
              <li>• Facturación automática</li>
              <li>• Análisis de rentabilidad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ventas

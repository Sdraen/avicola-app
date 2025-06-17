"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const Clientes: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">👥</div>
        <h1 className="modulo-title">Gestión de Clientes</h1>
        <p className="modulo-description">
          Administra la base de datos de clientes, sus datos de contacto y historial de compras.
        </p>
      </div>

      <div className="button-group">
        <button className="action-button primary" onClick={() => navigate("/ver-clientes")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Clientes</span>
        </button>
        <button className="action-button secondary" onClick={() => navigate("/registrar-cliente")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Cliente</span>
        </button>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Módulo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Funcionalidades:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Registro completo de clientes</li>
              <li>• Historial de ventas por cliente</li>
              <li>• Búsqueda y filtrado</li>
              <li>• Clasificación por tipo</li>
              <li>• Estadísticas de ventas</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Tipos de Cliente:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Mayorista - Compras al por mayor</li>
              <li>• Minorista - Ventas al detalle</li>
              <li>• Distribuidor - Intermediarios</li>
              <li>• Seguimiento personalizado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Clientes

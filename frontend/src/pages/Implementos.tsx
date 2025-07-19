"use client"

import { useNavigate } from "react-router-dom"
import React from "react"

const Implementos: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">🛠️</div>
        <h1 className="modulo-title">Gestión de Implementos</h1>
        <p className="modulo-description">
          Administra herramientas, equipos y recursos del sistema avícola, incluyendo compras asociadas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 my-6">
        <button className="action-button primary" onClick={() => navigate("/ver-implementos")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Inventario de Implementos</span>
        </button>

        <button className="action-button primary" onClick={() => navigate("/registrar-implemento")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Nuevo Implemento</span>
        </button>

        <button className="action-button primary" onClick={() => navigate("/ver-compras")}>
          <span className="button-icon">🧾</span>
          <span className="button-text">Ver Compras</span>
        </button>

        <button className="action-button primary" onClick={() => navigate("/registrar-compra")}>
          <span className="button-icon">🛒</span>
          <span className="button-text">Registrar Nueva Compra</span>
        </button>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Módulo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Funciones disponibles:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Registro de herramientas y equipos</li>
              <li>• Asociación de implementos a compras realizadas</li>
              <li>• Seguimiento de estado y ubicación</li>
              <li>• Reportes de inventario y adquisición</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Categorías comunes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Herramientas</li>
              <li>• Equipos</li>
              <li>• Contenedores</li>
              <li>• Otros insumos técnicos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Implementos

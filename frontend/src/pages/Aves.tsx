"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const Aves: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center px-4 py-8">
      {/* Encabezado */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🐓</div>
        <h1 className="text-2xl font-bold">Gestión de Aves</h1>
        <p className="text-gray-600 mt-1">Administra el ciclo de vida, salud y ubicación de las aves en el sistema.</p>
      </div>

      {/* Botones */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow flex items-center gap-2"
          onClick={() => navigate("/ver-aves")}
        >
          📋 <span>Ver Aves Registradas</span>
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg shadow flex items-center gap-2"
          onClick={() => navigate("/registrar-ave")}
        >
          ➕ <span>Registrar Nueva Ave</span>
        </button>
      </div>

      {/* Información del módulo */}
      <div className="bg-white shadow rounded-lg p-6 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">
        <div>
          <h2 className="font-semibold text-base mb-2">Funcionalidades:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Registro de nuevas aves</li>
            <li>Visualización con filtros por jaula, raza y estado</li>
            <li>Historial clínico individual</li>
            <li>Tratamientos médicos y seguimiento</li>
            <li>Registro de fallecimientos</li>
            <li>Edición y eliminación de datos</li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">Datos por Ave:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>ID de anillo y color identificador</li>
            <li>Raza, edad y jaula asignada</li>
            <li>Estado de puesta (activa/inactiva)</li>
            <li>Ubicación y trazabilidad completa</li>
            <li>Acciones disponibles según rol</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Aves

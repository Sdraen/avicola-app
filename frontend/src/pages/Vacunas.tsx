"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const Vacunas: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center px-4 py-8">
      {/* Encabezado */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">💉</div>
        <h1 className="text-2xl font-bold">Gestión de Vacunas</h1>
        <p className="text-gray-600 mt-1">
          Registra y administra las vacunas del sistema avícola. La fecha de administración es obligatoria.
        </p>
      </div>

      {/* Botones */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow flex items-center gap-2"
          onClick={() => navigate("/ver-vacunas")}
        >
          📋 <span>Ver Vacunas</span>
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg shadow flex items-center gap-2"
          onClick={() => navigate("/registrar-vacuna")}
        >
          ➕ <span>Registrar Vacuna</span>
        </button>
      </div>

      {/* Info del módulo */}
      <div className="bg-white shadow rounded-lg p-6 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">
        <div>
          <h2 className="font-semibold text-base mb-2">Funcionalidades:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Registro de vacunas (nombre, dosis y fecha de administración)</li>
            <li>Búsqueda por nombre</li>
            <li>Edición y eliminación (solo si no han sido aplicadas)</li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">Reglas:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Nombres deben ser únicos</li>
            <li>La fecha de administración es obligatoria y no puede ser futura</li>
            <li>Solo Admin puede eliminar</li>
            <li>Si la vacuna ya fue aplicada, no se puede eliminar</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Vacunas

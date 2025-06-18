import { Link } from "react-router-dom"

export default function Incubacion() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Incubación</h1>
        <p className="text-gray-600 mt-2">Gestión de procesos de incubación de huevos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/ver-incubacion"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500"
        >
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Ver Incubaciones</h3>
              <p className="text-gray-600">Lista de procesos de incubación</p>
            </div>
          </div>
        </Link>

        <Link
          to="/registrar-incubacion"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Incubación</h3>
              <p className="text-gray-600">Iniciar proceso de incubación</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

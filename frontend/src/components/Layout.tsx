"use client"

import type React from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: "📊",
      path: "/dashboard",
    },
    {
      title: "Gestión de Aves",
      icon: "🐓",
      path: "/aves",
      submenu: [
        { title: "Ver Aves", path: "/ver-aves" },
        { title: "Registrar Ave", path: "/registrar-ave" },
      ],
    },
    {
      title: "Gestión de Huevos",
      icon: "🥚",
      path: "/huevos",
      submenu: [
        { title: "Ver Huevos", path: "/ver-huevos" },
        { title: "Registrar Huevos", path: "/registrar-huevos" },
        { title: "Registro Diario", path: "/registro-huevos-diario" },
      ],
    },
    {
      title: "Gestión de Jaulas",
      icon: "🏠",
      path: "/jaulas",
      submenu: [
        { title: "Ver Jaulas", path: "/ver-jaulas" },
        { title: "Registrar Jaula", path: "/registrar-jaula" },
      ],
    },
    {
      title: "Gestión de Clientes",
      icon: "👥",
      path: "/clientes",
      submenu: [
        { title: "Ver Clientes", path: "/ver-clientes" },
        { title: "Registrar Cliente", path: "/registrar-cliente" },
      ],
    },
    {
      title: "Gestión de Ventas",
      icon: "💰",
      path: "/ventas",
      submenu: [
        { title: "Ver Ventas", path: "/ver-ventas" },
        { title: "Registrar Venta", path: "/registrar-venta" },
      ],
    },
    {
      title: "Gestión de Compras",
      icon: "🛒",
      path: "/compras",
      submenu: [
        { title: "Ver Compras", path: "/ver-compras" },
        { title: "Registrar Compra", path: "/registrar-compra" },
      ],
    },
    {
      title: "Control Sanitario",
      icon: "💊",
      path: "/medicamentos",
      submenu: [
        { title: "Medicamentos", path: "/ver-medicamentos" },
        { title: "Vacunas", path: "/ver-vacunas" },
        { title: "Registrar Medicamento", path: "/registrar-medicamento" },
        { title: "Registrar Vacuna", path: "/registrar-vacuna" },
      ],
    },
    {
      title: "Incubación",
      icon: "🐣",
      path: "/incubacion",
      submenu: [
        { title: "Ver Incubación", path: "/ver-incubacion" },
        { title: "Registrar Incubación", path: "/registrar-incubacion" },
      ],
    },
    {
      title: "Inventario",
      icon: "📦",
      path: "/implementos",
      submenu: [
        { title: "Ver Implementos", path: "/ver-implementos" },
        { title: "Registrar Implemento", path: "/registrar-implemento" },
      ],
    },
  ]

  // Solo admin puede ver razas
  if (user?.rol === "admin") {
    menuItems.push({
      title: "Configuración",
      icon: "⚙️",
      path: "/razas",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🐔 Sistema Avícola IECI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email} ({user?.rol})
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.title}
                  </Link>
                  {item.submenu && (
                    <ul className="ml-8 mt-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                              isActive(subItem.path)
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

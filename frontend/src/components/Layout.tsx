"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const toggleMenu = (menuPath: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(menuPath)) {
        newSet.delete(menuPath)
      } else {
        newSet.add(menuPath)
      }
      return newSet
    })
  }

  // Cierra menú usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
        { title: "Aves Fallecidas", path: "/ver-aves-fallecidas" },
      ],
    },
    {
      title: "Gestión de Huevos",
      icon: "🥚",
      path: "/huevos",
      submenu: [
        { title: "Ver Huevos", path: "/ver-huevos" },
        { title: "Registrar Huevos", path: "/registrar-huevos" },
        { title: "Bandejas", path: "/ver-bandejas" },
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
      path: "/incubaciones",
      submenu: [
        { title: "Ver Incubaciones", path: "/ver-incubaciones" },
        { title: "Registrar Incubación", path: "/registrar-incubacion" },
        { title: "Ver Incubadoras", path: "/ver-incubadoras" },
        { title: "Registrar Incubadora", path: "/registrar-incubadora" },
      ],
    },
  ]


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 mr-4"
                aria-label={sidebarOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              >
                <div className="w-6 h-6 relative">
                  <span
                    className={`absolute left-0 top-1 w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                      sidebarOpen ? "rotate-45 translate-y-2" : "rotate-0 translate-y-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-2.5 w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                      sidebarOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-4 w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                      sidebarOpen ? "-rotate-45 -translate-y-2" : "rotate-0 translate-y-0"
                    }`}
                  />
                </div>
              </button>
              <h1 className="text-xl font-bold text-gray-900">🐔 Sistema Avícola Santa Luisa</h1>
            </div>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-medium">{user?.email}</span>
                  <span className="text-xs text-gray-500 capitalize">{user?.rol}</span>
                </div>
                <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ease-out"
          onClick={closeSidebar}
        />
      )}

      <nav
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-200 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Navegación</h2>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full pb-20">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                {item.submenu ? (
                  // Menu item with submenu - collapsible
                  <div>
                    <div className="flex items-center">
                      <Link
                        to={item.path}
                        onClick={closeSidebar}
                        className={`flex-1 flex items-center px-4 py-3 text-sm font-medium rounded-l-lg transition-all duration-150 ${
                          isActive(item.path)
                            ? "bg-blue-100 text-blue-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        <span className="flex-1 text-left">{item.title}</span>
                      </Link>
                      <button
                        onClick={() => toggleMenu(item.path)}
                        className={`px-2 py-3 text-sm font-medium rounded-r-lg transition-all duration-150 ${
                          isActive(item.path)
                            ? "bg-blue-100 text-blue-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expandedMenus.has(item.path) ? "rotate-90" : "rotate-0"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Submenu with smooth animation */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedMenus.has(item.path) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <ul className="ml-8 mt-2 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              onClick={closeSidebar}
                              className={`block px-4 py-2 text-sm rounded-md transition-all duration-150 ${
                                isActive(subItem.path)
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                              }`}
                            >
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                                {subItem.title}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  // Regular menu item without submenu
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 ${
                      isActive(item.path)
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="flex-1">{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="w-full">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout

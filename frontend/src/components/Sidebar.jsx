// Actualización del Sidebar para incluir logout
"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import "../styles/Sidebar.css"

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/jaulas", label: "Jaulas", icon: "🏠" },
    { path: "/aves", label: "Aves", icon: "🐓" },
    { path: "/huevos", label: "Huevos", icon: "🥚" },
  ]

  const handleLogout = () => {
    // Limpiar datos de autenticación
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")

    // Redirigir al login
    navigate("/login", { replace: true })
  }

  const userEmail = localStorage.getItem("userEmail") || "Usuario"

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <span className="logo-icon">🐔</span>
          <h2 className="app-title">Avícola App</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link to={item.path} className={`nav-link ${location.pathname === item.path ? "active" : ""}`}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-avatar">👤</span>
          <span className="user-name">{userEmail.split("@")[0]}</span>
        </div>
        <button className="logout-button" onClick={handleLogout} title="Cerrar sesión">
          <span className="logout-icon">🚪</span>
          <span className="logout-text">Salir</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

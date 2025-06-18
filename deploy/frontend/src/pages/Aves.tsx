"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const Aves: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">🐓</div>
        <h1 className="modulo-title">Gestión de Aves</h1>
        <p className="modulo-description">Aquí podrás registrar, ver y administrar las aves del sistema.</p>
      </div>

      <div className="button-group">
        <button className="action-button primary" onClick={() => navigate("/registrar-ave")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Ave</span>
        </button>
        <button className="action-button secondary" onClick={() => navigate("/ver-aves")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Aves</span>
        </button>
      </div>
    </div>
  )
}

export default Aves

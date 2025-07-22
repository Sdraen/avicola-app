"use client"

import { useNavigate } from "react-router-dom"

export default function Incubacion() {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">🐣</div>
        <h1 className="modulo-title">Gestión de Incubación</h1>
        <p className="modulo-description">Aquí podrás registrar, ver y administrar los procesos de incubación de huevos.</p>
      </div>

      <div className="button-group">
        <button className="action-button primary" onClick={() => navigate("/registrar-incubacion")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Incubación</span>
        </button>
        <button className="action-button secondary" onClick={() => navigate("/ver-incubacion")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Incubaciones</span>
        </button>
      </div>
    </div>
  )
}

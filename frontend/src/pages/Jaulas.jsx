"use client"

// src/pages/Jaulas.jsx
import { useNavigate } from "react-router-dom"
import "../styles/Modulo.css"

const Jaulas = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">🏠</div>
        <h1 className="modulo-title">Gestión de Jaulas</h1>
        <p className="modulo-description">Aquí podrás registrar, ver y administrar las jaulas del sistema.</p>
      </div>

      <div className="button-group">
        <button className="action-button primary" onClick={() => navigate("/registrar-jaula")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Jaula</span>
        </button>
        <button className="action-button secondary" onClick={() => navigate("/ver-jaulas")}>
          <span className="button-icon">📋</span>
          <span className="button-text">Ver Jaulas</span>
        </button>
      </div>
    </div>
  )
}

export default Jaulas

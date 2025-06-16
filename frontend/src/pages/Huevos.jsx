"use client"

// src/pages/Huevos.jsx
import { useNavigate } from "react-router-dom"
import "../styles/Modulo.css"

const Huevos = () => {
  const navigate = useNavigate()

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <div className="modulo-icon">🥚</div>
        <h1 className="modulo-title">Gestión de Huevos</h1>
        <p className="modulo-description">
          Aquí podrás registrar la recolección diaria de huevos y consultar el historial de producción.
        </p>
      </div>

      <div className="button-group">
        <button className="action-button primary" onClick={() => navigate("/registrar-huevos")}>
          <span className="button-icon">➕</span>
          <span className="button-text">Registrar Huevos</span>
        </button>
        <button className="action-button secondary" onClick={() => navigate("/ver-huevos")}>
          <span className="button-icon">📊</span>
          <span className="button-text">Ver Registros</span>
        </button>
      </div>
    </div>
  )
}

export default Huevos

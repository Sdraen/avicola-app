"use client"

// src/pages/RegistrarJaula.jsx
import { useState } from "react"
import "../styles/RegistrarJaula.css"

const RegistrarJaula = () => {
  const [jaula, setJaula] = useState({ numero: "", descripcion: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setJaula({ ...jaula, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Enviando jaula:", jaula)
    // Aquí puedes hacer un fetch o axios.post al backend
    // Reiniciar formulario
    setJaula({ numero: "", descripcion: "" })
  }

  return (
    <div className="jaula-form-container">
      <div className="form-header">
        <div className="form-icon">🏠</div>
        <h2 className="form-title">Registrar Jaula</h2>
        <p className="form-subtitle">Complete los datos para registrar una nueva jaula</p>
      </div>

      <form onSubmit={handleSubmit} className="jaula-form">
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🔢</span>
            Número de Jaula
          </label>
          <input
            type="text"
            name="numero"
            value={jaula.numero}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: J001"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📝</span>
            Descripción
          </label>
          <input
            type="text"
            name="descripcion"
            value={jaula.descripcion}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: Jaula para aves ponedoras"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          <span className="button-icon">💾</span>
          <span className="button-text">Registrar Jaula</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarJaula

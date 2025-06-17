"use client"

// src/pages/RegistrarAve.jsx
import { useState } from "react"
import "../styles/RegistrarAves.css"

const RegistrarAve = () => {
  const [form, setForm] = useState({
    colorAnillo: "",
    numeroAnillo: "",
    fechaNacimiento: "",
    raza: "",
    jaula: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Ave registrada:", form)
    // Aquí se conectará al backend más adelante
  }

  return (
    <div className="registrar-ave-container">
      <div className="form-header">
        <div className="form-icon">🐓</div>
        <h2 className="form-title">Registrar Nueva Ave</h2>
        <p className="form-subtitle">Complete los datos para registrar un ave en el sistema</p>
      </div>

      <form className="registrar-ave-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🎨</span>
            Color Anillo:
          </label>
          <input
            type="text"
            name="colorAnillo"
            value={form.colorAnillo}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: Rojo, Azul, Verde"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🔢</span>
            Número Anillo:
          </label>
          <input
            type="text"
            name="numeroAnillo"
            value={form.numeroAnillo}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: A001, B025"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📅</span>
            Fecha de Registro:
          </label>
          <input
            type="date"
            name="fechaNacimiento"
            value={form.fechaNacimiento}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🧬</span>
            Raza:
          </label>
          <input
            type="text"
            name="raza"
            value={form.raza}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: Leghorn, Rhode Island"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🏠</span>
            Jaula:
          </label>
          <input
            type="text"
            name="jaula"
            value={form.jaula}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: J001, J025"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          <span className="button-icon">💾</span>
          <span className="button-text">Registrar Ave</span>
        </button>
      </form>
    </div>
  )
}

export default RegistrarAve

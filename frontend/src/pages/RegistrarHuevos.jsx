"use client"

import { useState } from "react"
import "../styles/RegistrarHuevos.css"

const RegistrarHuevos = () => {
  const [formData, setFormData] = useState({
    cantidad: "",
    raza: "",
    observaciones: "",
  })

  // Datos mock de registros del día actual
  const [registrosHoy, setRegistrosHoy] = useState([
    {
      id: 1,
      hora: "08:30",
      cantidad: 45,
      raza: "Leghorn",
      observaciones: "Recolección matutina normal",
    },
    {
      id: 2,
      hora: "14:15",
      cantidad: 32,
      raza: "Rhode Island",
      observaciones: "Algunas aves parecían estresadas",
    },
    {
      id: 3,
      hora: "18:00",
      cantidad: 28,
      raza: "Plymouth Rock",
      observaciones: "",
    },
  ])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Crear nuevo registro
    const nuevoRegistro = {
      id: registrosHoy.length + 1,
      hora: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      cantidad: Number.parseInt(formData.cantidad),
      raza: formData.raza,
      observaciones: formData.observaciones || "Sin observaciones",
    }

    // Agregar a la lista
    setRegistrosHoy((prev) => [...prev, nuevoRegistro])

    // Limpiar formulario
    setFormData({
      cantidad: "",
      raza: "",
      observaciones: "",
    })

    console.log("Registro de huevos:", nuevoRegistro)
    // Aquí se haría la llamada al backend
  }

  const totalHuevosHoy = registrosHoy.reduce((total, registro) => total + registro.cantidad, 0)
  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="registrar-huevos-container">
      {/* Formulario de registro */}
      <div className="form-section">
        <div className="form-header">
          <div className="form-icon">🥚</div>
          <h2 className="form-title">Registrar Recolección de Huevos</h2>
          <p className="form-subtitle">Registra la cantidad de huevos recolectados por raza</p>
        </div>

        <form className="huevos-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔢</span>
                Cantidad de Huevos
              </label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: 25"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🧬</span>
                Raza de Origen
              </label>
              <select name="raza" value={formData.raza} onChange={handleInputChange} className="form-select" required>
                <option value="">Seleccionar raza</option>
                <option value="Leghorn">Leghorn</option>
                <option value="Rhode Island">Rhode Island</option>
                <option value="Plymouth Rock">Plymouth Rock</option>
                <option value="Sussex">Sussex</option>
                <option value="Orpington">Orpington</option>
                <option value="Australorp">Australorp</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📝</span>
              Observaciones (Opcional)
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Ej: Recolección normal, algunas aves parecían estresadas, etc."
              rows="3"
            />
          </div>

          <button type="submit" className="submit-button">
            <span className="button-icon">💾</span>
            <span className="button-text">Registrar Recolección</span>
          </button>
        </form>
      </div>

      {/* Lista de registros del día */}
      <div className="registros-section">
        <div className="registros-header">
          <div className="header-content">
            <div className="header-icon">📋</div>
            <div className="header-text">
              <h3 className="registros-title">Registros de Hoy</h3>
              <p className="registros-subtitle">{fechaHoy}</p>
            </div>
            <div className="total-badge">
              <span className="total-number">{totalHuevosHoy}</span>
              <span className="total-label">Total</span>
            </div>
          </div>
        </div>

        <div className="registros-container">
          {registrosHoy.length > 0 ? (
            <div className="registros-grid">
              {registrosHoy.map((registro, index) => (
                <div key={registro.id} className="registro-card">
                  <div className="card-header">
                    <div className="card-time">
                      <span className="time-icon">🕐</span>
                      <span className="time-text">{registro.hora}</span>
                    </div>
                    <div className="card-cantidad">
                      <span className="cantidad-number">{registro.cantidad}</span>
                      <span className="cantidad-label">huevos</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="card-raza">
                      <span className="raza-icon">🧬</span>
                      <span className="raza-text">{registro.raza}</span>
                    </div>
                    {registro.observaciones && (
                      <div className="card-observaciones">
                        <span className="obs-icon">📝</span>
                        <span className="obs-text">{registro.observaciones}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🥚</div>
              <p className="empty-text">No hay registros para hoy</p>
              <p className="empty-subtitle">Comienza registrando tu primera recolección</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegistrarHuevos

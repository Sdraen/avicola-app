"use client"

import { useState } from "react"
import "../styles/VerJaulas.css"

const VerJaulas = () => {
  // Temporalmente datos estáticos. Se reemplazarán con fetch a API.
  const [jaulas, setJaulas] = useState([
    { id: 1, descripcion: "Jaula Pequeña", capacidad: 25 },
    { id: 2, descripcion: "Jaula Grande", capacidad: 30 },
    { id: 3, descripcion: "Jaula Mediana", capacidad: 20 },
    { id: 4, descripcion: "Jaula Mediana", capacidad: 15 },
  ])

  const [modalOpen, setModalOpen] = useState(false)
  const [jaulaEditando, setJaulaEditando] = useState(null)
  const [formData, setFormData] = useState({
    descripcion: "",
    capacidad: "",
  })

  const abrirModal = (jaula) => {
    setJaulaEditando(jaula)
    setFormData({
      descripcion: jaula.descripcion,
      capacidad: jaula.capacidad.toString(),
    })
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setJaulaEditando(null)
    setFormData({ descripcion: "", capacidad: "" })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí se haría la llamada al backend para actualizar
    const jaulasActualizadas = jaulas.map((jaula) =>
      jaula.id === jaulaEditando.id
        ? {
            ...jaula,
            descripcion: formData.descripcion,
            capacidad: Number.parseInt(formData.capacidad),
          }
        : jaula,
    )
    setJaulas(jaulasActualizadas)
    console.log("Jaula actualizada:", { id: jaulaEditando.id, ...formData })
    cerrarModal()
  }

  return (
    <div className="verjaulas-wrapper">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">📋</div>
          <div className="header-text">
            <h2 className="table-title">Lista de Jaulas</h2>
            <p className="table-subtitle">Total de jaulas registradas: {jaulas.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="jaulas-table">
          <thead>
            <tr>
              <th>
                <span className="th-content">
                  <span className="th-icon">🆔</span>
                  ID
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📝</span>
                  Descripción
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📊</span>
                  Capacidad
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">⚙️</span>
                  Acciones
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {jaulas.map((jaula, index) => (
              <tr key={`${jaula.id}-${index}`} className="table-row">
                <td className="table-cell id-cell">{jaula.id}</td>
                <td className="table-cell description-cell">{jaula.descripcion}</td>
                <td className="table-cell capacity-cell">
                  <span className="capacity-badge">{jaula.capacidad}</span>
                </td>
                <td className="table-cell actions-cell">
                  <button className="edit-button" onClick={() => abrirModal(jaula)} title="Editar jaula">
                    <span className="edit-icon">✏️</span>
                    <span className="edit-text">Editar</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {modalOpen && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">🏠</div>
              <h3 className="modal-title">Editar Jaula</h3>
              <p className="modal-subtitle">Modifica los datos de la jaula seleccionada</p>
              <button className="modal-close" onClick={cerrarModal}>
                <span className="close-icon">✕</span>
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <span className="modal-label-icon">📝</span>
                  Descripción
                </label>
                <input
                  type="text"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="modal-input"
                  placeholder="Ej: Jaula para aves ponedoras"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <span className="modal-label-icon">📊</span>
                  Capacidad
                </label>
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleInputChange}
                  className="modal-input"
                  placeholder="Ej: 25"
                  min="1"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={cerrarModal}>
                  <span className="button-icon">❌</span>
                  <span className="button-text">Cancelar</span>
                </button>
                <button type="submit" className="modal-submit">
                  <span className="button-icon">💾</span>
                  <span className="button-text">Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerJaulas

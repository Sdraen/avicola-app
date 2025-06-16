// src/pages/Dashboard.jsx
import "../styles/Dashboard.css"

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Bienvenido al Dashboard 🐔</h1>
        <p className="dashboard-subtitle">Selecciona una sección desde el menú lateral.</p>
      </div>

      <div className="card-container">
        <div className="card card-jaulas">
          <div className="card-icon">🏠</div>
          <div className="card-content">
            <h3>Jaulas</h3>
            <p className="card-number">12</p>
            <span className="card-label">registradas</span>
          </div>
        </div>
        <div className="card card-aves">
          <div className="card-icon">🐓</div>
          <div className="card-content">
            <h3>Aves</h3>
            <p className="card-number">350</p>
            <span className="card-label">en total</span>
          </div>
        </div>
        <div className="card card-huevos">
          <div className="card-icon">🥚</div>
          <div className="card-content">
            <h3>Huevos</h3>
            <p className="card-number">1,250</p>
            <span className="card-label">recolectados</span>
          </div>
        </div>
        <div className="card card-clinica">
          <div className="card-icon">🏥</div>
          <div className="card-content">
            <h3>Aves en Clínica</h3>
            <p className="card-number">5</p>
            <span className="card-label">en tratamiento</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

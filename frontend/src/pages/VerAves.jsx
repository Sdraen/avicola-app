// src/pages/VerAves.jsx
import "../styles/VerAves.css"

const VerAves = () => {
  // Datos de ejemplo mientras se integra el backend
  const aves = [
    { id: 1, especie: "Leghorn", cantidad: 120 },
    { id: 2, especie: "Rhode Island", cantidad: 85 },
    { id: 3, especie: "Plymouth Rock", cantidad: 60 },
  ]

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🐓</div>
          <div className="header-text">
            <h1 className="table-title">Listado de Aves</h1>
            <p className="table-subtitle">Total de especies registradas: {aves.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="tabla-aves">
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
                  <span className="th-icon">🧬</span>
                  Especie
                </span>
              </th>
              <th>
                <span className="th-content">
                  <span className="th-icon">📊</span>
                  Cantidad
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {aves.map((ave, index) => (
              <tr key={ave.id} className="table-row">
                <td className="table-cell id-cell">{ave.id}</td>
                <td className="table-cell especie-cell">{ave.especie}</td>
                <td className="table-cell cantidad-cell">
                  <span className="cantidad-badge">{ave.cantidad}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VerAves

import { useState, useEffect } from "react"
import { avesAPI } from "../../services/api"
import type { Ave } from "../../types"

interface ModalEditarAveProps {
  idAve: number
  onClose: () => void
  onUpdate: () => void
}

const ModalEditarAve = ({ idAve, onClose, onUpdate }: ModalEditarAveProps) => {
  const [form, setForm] = useState<Ave | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAve = async () => {
      try {
        const response = await avesAPI.getById(idAve)
        setForm(response.data)
      } catch {
        setError("Error al cargar los datos del ave")
      }
    }
    fetchAve()
  }, [idAve])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!form) return
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setLoading(true)
    try {
      await avesAPI.update(idAve, form)
      onUpdate()
      onClose()
    } catch {
      setError("Error al actualizar el ave")
    } finally {
      setLoading(false)
    }
  }

  if (!form) {
    return (
      <div className="modal">
        <div className="modal-content">
          <p className="text-center">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          ✖
        </button>
        <h2 className="modal-title">Editar Ave #{idAve}</h2>

        {error && <div className="text-red-600 mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            name="id_anillo"
            value={form.id_anillo}
            onChange={handleChange}
            placeholder="ID Anillo"
            className="form-input"
            required
            minLength={1}
            maxLength={10}
          />
          <input
            name="color_anillo"
            value={form.color_anillo}
            onChange={handleChange}
            placeholder="Color Anillo"
            className="form-input"
          />
          <input
            name="edad"
            value={form.edad}
            onChange={handleChange}
            placeholder="Edad"
            className="form-input"
          />
          <input
            name="raza"
            value={form.raza}
            onChange={handleChange}
            placeholder="Raza"
            className="form-input"
          />
          <select
            name="estado_puesta"
            value={form.estado_puesta}
            onChange={handleChange}
            className="form-input"
          >
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
            <option value="en_desarrollo">En desarrollo</option>
          </select>

          <button type="submit" className="btn-primary mt-4" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>

        <button className="btn-cancel" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default ModalEditarAve

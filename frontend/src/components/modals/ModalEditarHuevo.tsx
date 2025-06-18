import { useState, useEffect } from "react"
import { huevosAPI } from "../../services/api"
import type { Huevo } from "../../types"

interface ModalEditarHuevoProps {
  idHuevo: number
  onClose: () => void
}

const ModalEditarHuevo = ({ idHuevo, onClose }: ModalEditarHuevoProps) => {
  const [form, setForm] = useState<Huevo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHuevo = async () => {
      try {
        const response = await huevosAPI.getById(idHuevo)
        setForm(response.data)
      } catch {
        setError("Error al cargar los datos del huevo")
      }
    }
    fetchHuevo()
  }, [idHuevo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!form) return
    const { name, value } = e.target
    setForm({ ...form, [name]: name === "observaciones" ? value : Number(value) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setLoading(true)
    try {
      await huevosAPI.update(idHuevo, form)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al actualizar el huevo")
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
        <button className="modal-close-button" onClick={onClose}>✖</button>
        <h2 className="modal-title">Editar Huevo #{idHuevo}</h2>

        {error && <div className="text-red-600 mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            name="cantidad_total"
            value={form.cantidad_total}
            onChange={handleChange}
            placeholder="Cantidad total"
            type="number"
            className="form-input"
          />

          <div className="form-group">
            <label className="form-label">Huevos café</label>
            <input name="huevos_cafe_chico" type="number" value={form.huevos_cafe_chico} onChange={handleChange} className="form-input" />
            <input name="huevos_cafe_mediano" type="number" value={form.huevos_cafe_mediano} onChange={handleChange} className="form-input" />
            <input name="huevos_cafe_grande" type="number" value={form.huevos_cafe_grande} onChange={handleChange} className="form-input" />
            <input name="huevos_cafe_jumbo" type="number" value={form.huevos_cafe_jumbo} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Huevos blancos</label>
            <input name="huevos_blanco_chico" type="number" value={form.huevos_blanco_chico} onChange={handleChange} className="form-input" />
            <input name="huevos_blanco_mediano" type="number" value={form.huevos_blanco_mediano} onChange={handleChange} className="form-input" />
            <input name="huevos_blanco_grande" type="number" value={form.huevos_blanco_grande} onChange={handleChange} className="form-input" />
            <input name="huevos_blanco_jumbo" type="number" value={form.huevos_blanco_jumbo} onChange={handleChange} className="form-input" />
          </div>

          <textarea
            name="observaciones"
            value={form.observaciones || ""}
            onChange={handleChange}
            placeholder="Observaciones"
            className="form-input"
          />

          <button type="submit" className="btn-primary mt-4" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>

        <button className="btn-cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}

export default ModalEditarHuevo

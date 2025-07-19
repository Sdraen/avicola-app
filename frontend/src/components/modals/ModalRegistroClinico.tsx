"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { aveClinicaAPI, jaulasAPI } from "../../services/api"
import type { Jaula } from "../../types"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../../utils/sweetAlert"

interface ModalRegistroClinicoProps {
  isOpen: boolean
  aveId: number
  aveInfo: {
    id_anillo: string
    raza: string
    color_anillo: string
    id_jaula: number
  }
  onClose: () => void
  onSuccess: () => void
}

const ModalRegistroClinico: React.FC<ModalRegistroClinicoProps> = ({ isOpen, aveId, aveInfo, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id_jaula: aveInfo.id_jaula || 0,
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    descripcion: "",
  })
  const [jaulas, setJaulas] = useState<Jaula[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchJaulas = async () => {
    try {
      const response = await jaulasAPI.getAll()
      setJaulas(response.data)
    } catch (err: any) {
      console.error("Error fetching jaulas:", err)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchJaulas()
      setFormData({
        id_jaula: aveInfo.id_jaula || 0,
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: "",
        descripcion: "",
      })
      setError("")
    }
  }, [isOpen, aveInfo])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      showLoadingAlert("Registrando tratamiento...", "Por favor espere")

      const dataToSend = {
        id_ave: aveId,
        id_jaula: formData.id_jaula,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || undefined,
        descripcion: formData.descripcion,
      }

      await aveClinicaAPI.create(dataToSend)

      closeLoadingAlert()
      await showSuccessAlert("¡Tratamiento registrado!", "El registro clínico ha sido creado correctamente")

      onSuccess()
      onClose()
    } catch (err: any) {
      closeLoadingAlert()
      const errorMessage = err.response?.data?.error || "Error al registrar el tratamiento"
      setError(errorMessage)
      await showErrorAlert("Error al registrar", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-2xl">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="modal-icon bg-green-100">
              <span className="text-2xl">🩺</span>
            </div>
            <div>
              <h2 className="modal-title">Nuevo Registro Clínico</h2>
              <p className="text-sm text-gray-600">
                Ave #{aveInfo.id_anillo} - {aveInfo.raza} ({aveInfo.color_anillo})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="id_jaula" className="form-label">
                  <span className="label-icon">🏠</span>
                  Jaula
                </label>
                <select
                  id="id_jaula"
                  name="id_jaula"
                  value={formData.id_jaula}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Seleccionar jaula</option>
                  {jaulas.map((jaula) => (
                    <option key={jaula.id_jaula} value={jaula.id_jaula}>
                      {jaula.descripcion || `Jaula #${jaula.id_jaula}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fecha_inicio" className="form-label">
                  <span className="label-icon">📅</span>
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  id="fecha_inicio"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="fecha_fin" className="form-label">
                  <span className="label-icon">🏁</span>
                  Fecha de Fin (Opcional)
                </label>
                <input
                  type="date"
                  id="fecha_fin"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleInputChange}
                  className="form-input"
                  min={formData.fecha_inicio}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion" className="form-label">
                <span className="label-icon">📝</span>
                Descripción del Tratamiento
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="form-input"
                rows={4}
                placeholder="Describe el tratamiento, enfermedad, medicamentos aplicados, observaciones, etc."
                required
              />
              <p className="text-sm text-gray-500 mt-1">Máximo 500 caracteres ({formData.descripcion.length}/500)</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Tratamiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalRegistroClinico

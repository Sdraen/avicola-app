"use client"

import React, { useState } from "react"
import { aveClinicaAPI } from "../../services/api"
import Swal from "sweetalert2"

interface ModalRegistrarFallecimientoProps {
  isOpen: boolean
  onClose: () => void
  aveId: number
  onSuccess: () => void
}

const ModalRegistrarFallecimiento: React.FC<ModalRegistrarFallecimientoProps> = ({
  isOpen,
  onClose,
  aveId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    id_ave: aveId,
    fecha: "",
    motivo: "",
  })
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, id_ave: aveId }))
    }
  }, [isOpen, aveId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Confirmación antes de registrar fallecimiento
    const result = await Swal.fire({
      title: "¿Confirmar Fallecimiento?",
      text: "Esta acción registrará el ave como fallecida y no se podrán crear nuevos registros clínicos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        id_ave: Number(formData.id_ave),
      }

      const response = await aveClinicaAPI.registrarFallecimiento(dataToSend)

      if (response.data.success) {
        await Swal.fire({
          title: "Fallecimiento Registrado",
          text: "El fallecimiento ha sido registrado exitosamente",
          icon: "success",
          confirmButtonColor: "#10B981",
        })
        onSuccess()
        onClose()
        resetForm()
      }
    } catch (error: any) {
      console.error("Error al registrar fallecimiento:", error)

      let errorMessage = "Error al registrar el fallecimiento"
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      await Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#EF4444",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      id_ave: aveId,
      fecha: "",
      motivo: "",
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-800">⚠️ Registrar Fallecimiento</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ave ID</label>
            <input
              type="number"
              value={formData.id_ave}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fallecimiento *</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
              required
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del Fallecimiento *</label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData((prev) => ({ ...prev, motivo: e.target.value }))}
              required
              rows={4}
              maxLength={200}
              placeholder="Describe la causa o motivo del fallecimiento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="text-right text-xs text-gray-500 mt-1">{formData.motivo.length}/200</div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong>Advertencia:</strong> Una vez registrado el fallecimiento, no se podrán crear nuevos registros
              clínicos para esta ave.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Registrando..." : "Registrar Fallecimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalRegistrarFallecimiento

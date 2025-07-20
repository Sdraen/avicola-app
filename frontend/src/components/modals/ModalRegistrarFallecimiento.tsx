"use client"

import React, { useState, useEffect } from "react"
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

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, id_ave: aveId }))
    }
  }, [isOpen, aveId])

  const resetForm = () => {
    setFormData({ id_ave: aveId, fecha: "", motivo: "" })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      const response = await aveClinicaAPI.registrarFallecimiento({
        ...formData,
        id_ave: Number(formData.id_ave),
      })

      if (response.data.success) {
        await Swal.fire({
          title: "Fallecimiento Registrado",
          text: "El fallecimiento ha sido registrado exitosamente",
          icon: "success",
          confirmButtonColor: "#10B981",
        })
        onSuccess()
        handleClose()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-label="Cerrar modal"
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Encabezado rojo */}
          <div className="bg-red-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl text-white">💀</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Registrar Fallecimiento</h2>
                  <p className="text-sm text-red-100">ID Ave: #{aveId}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fallecimiento *</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 resize-none"
                />
                <p className="text-right text-xs text-gray-500 mt-1">{formData.motivo.length}/200</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                <strong>Advertencia:</strong> Una vez registrado el fallecimiento, no se podrán crear nuevos registros
                clínicos para esta ave.
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Registrando..." : "Registrar Fallecimiento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModalRegistrarFallecimiento

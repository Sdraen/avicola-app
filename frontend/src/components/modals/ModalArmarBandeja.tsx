"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { bandejasAPI } from "../../services/api"
import type { HuevoDisponible } from "../../types"
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from "../../utils/sweetAlert"

interface ModalArmarBandejaProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

interface BandejaForm {
  tipo_huevo: "cafe" | "blanco"
  tamaño_huevo: "chico" | "mediano" | "grande" | "jumbo"
  cantidad_huevos: number
  huevos_seleccionados: number[]
}

const getCantidadMinima = (tamaño: string) => (tamaño === "jumbo" ? 24 : 30)

const ModalArmarBandeja: React.FC<ModalArmarBandejaProps> = ({ isOpen, onClose, onUpdate }) => {
  const [huevosDisponibles, setHuevosDisponibles] = useState<HuevoDisponible[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<BandejaForm>({
    tipo_huevo: "cafe",
    tamaño_huevo: "mediano",
    cantidad_huevos: 30,
    huevos_seleccionados: [],
  })

  const cantidadMinima = getCantidadMinima(form.tamaño_huevo)

  const fetchHuevosDisponibles = async () => {
    try {
      setLoading(true)
      const response = await bandejasAPI.getHuevosDisponibles(form.tipo_huevo, form.tamaño_huevo)
      const huevosData = Array.isArray(response.data?.data) ? response.data.data : []
      setHuevosDisponibles(huevosData)
    } catch (error) {
      console.error("Error al cargar huevos disponibles:", error)
      await showErrorAlert("Error", "No se pudieron cargar los huevos disponibles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchHuevosDisponibles()
    }
  }, [isOpen, form.tipo_huevo, form.tamaño_huevo])

  const huevosFiltrados = huevosDisponibles
  const cantidadDisponible = huevosFiltrados.reduce((total, huevo) => total + huevo.cantidad_disponible, 0)

  const seleccionarHuevosAutomaticamente = () => {
    let cantidadRestante = form.cantidad_huevos
    const huevosSeleccionados: number[] = []

    for (const huevo of huevosFiltrados) {
      if (cantidadRestante <= 0) break
      const cantidadAUsar = Math.min(cantidadRestante, huevo.cantidad_disponible)
      if (cantidadAUsar > 0) {
        huevosSeleccionados.push(huevo.id_huevo)
        cantidadRestante -= cantidadAUsar
      }
    }

    setForm((prev) => ({ ...prev, huevos_seleccionados: huevosSeleccionados }))
  }

  useEffect(() => {
    seleccionarHuevosAutomaticamente()
  }, [form.cantidad_huevos, huevosDisponibles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cantidadDisponible < cantidadMinima) {
      await showErrorAlert("No hay suficientes huevos", `Se requieren al menos ${cantidadMinima} huevos`)
      return
    }

    try {
      showLoadingAlert("Armando bandeja...", "Por favor espere")

      const bandejaData = {
        tipo: form.tipo_huevo,
        tamaño: form.tamaño_huevo,
        id_huevos: form.huevos_seleccionados,
      }

      await bandejasAPI.create(bandejaData)

      closeLoadingAlert()
      await showSuccessAlert("¡Bandeja creada!", "La bandeja ha sido armada correctamente")

      onUpdate()
      onClose()
    } catch (error: any) {
      closeLoadingAlert()
      console.error("Error al armar bandeja:", error)
      await showErrorAlert("Error", error.response?.data?.error || "No se pudo armar la bandeja")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl">🧺</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Armar Bandeja</h3>
                  <p className="text-sm text-yellow-100">Seleccionar huevos para bandeja</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                <span className="text-gray-600">Cargando huevos disponibles...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Huevo</label>
                  <select
                    value={form.tipo_huevo}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, tipo_huevo: e.target.value as "cafe" | "blanco" }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="cafe">🟤 Café</option>
                    <option value="blanco">⚪ Blanco</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño</label>
                  <select
                    value={form.tamaño_huevo}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, tamaño_huevo: e.target.value as any }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="chico">Chico</option>
                    <option value="mediano">Mediano</option>
                    <option value="grande">Grande</option>
                    <option value="jumbo">Jumbo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad de Huevos (Disponible: {cantidadDisponible})
                </label>
                <input
                  type="number"
                  value={form.cantidad_huevos}
                  onChange={(e) => setForm((prev) => ({ ...prev, cantidad_huevos: Number(e.target.value) }))}
                  min={cantidadMinima}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
                {cantidadDisponible < cantidadMinima && (
                  <p className="text-sm text-red-600 mt-1">
                    ⚠️ No hay suficientes huevos para armar una bandeja de tamaño {form.tamaño_huevo}. Se requieren al
                    menos {cantidadMinima}.
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Huevos Seleccionados Automáticamente:</h4>
                {form.huevos_seleccionados.length > 0 ? (
                  <div className="space-y-2">
                    {huevosFiltrados
                      .filter((h) => form.huevos_seleccionados.includes(h.id_huevo))
                      .map((h) => (
                        <div key={h.id_huevo} className="flex justify-between items-center text-sm">
                          <span>
                            {h.jaula?.descripcion || `Jaula ${h.id_jaula}`} - {h.fecha_recoleccion}
                          </span>
                          <span className="font-medium">{h.cantidad_disponible} disponibles</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No hay huevos suficientes del tipo seleccionado</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cantidadDisponible < cantidadMinima}
                  className="px-6 py-2 text-sm font-medium text-white bg-yellow-500 border border-transparent rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <span>🧺</span>
                  <span>Armar Bandeja</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalArmarBandeja

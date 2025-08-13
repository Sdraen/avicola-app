"use client"
import type React from "react"
import { useState } from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (payload: { fecha_nacimiento: string; sexo?: string | null; observaciones?: string | null }) => void
}

const ModalRegistrarNacimiento: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [fecha_nacimiento, setFecha] = useState(new Date().toISOString().split("T")[0])
  const [sexo, setSexo] = useState("")
  const [observaciones, setObs] = useState("")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Registrar Nacimiento</h3>

        <div className="mb-4">
          <label className="form-label"><span className="label-icon">📅</span>Fecha:</label>
          <input type="date" className="form-input" value={fecha_nacimiento} onChange={(e) => setFecha(e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="form-label"><span className="label-icon">⚧</span>Sexo (opcional):</label>
          <input type="text" className="form-input" value={sexo} onChange={(e) => setSexo(e.target.value)} placeholder="M/H u otro" />
        </div>

        <div className="mb-6">
          <label className="form-label"><span className="label-icon">📝</span>Observaciones:</label>
          <textarea className="form-input" rows={3} value={observaciones} onChange={(e) => setObs(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2">
          <button className="action-button secondary !px-4 !py-2" onClick={onClose}>Cancelar</button>
          <button
            className="action-button primary !px-4 !py-2"
            onClick={() => onConfirm({ fecha_nacimiento, sexo: sexo || null, observaciones: observaciones || null })}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalRegistrarNacimiento

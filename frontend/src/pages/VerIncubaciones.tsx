"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { incubacionesAPI, incubadorasAPI, nacimientosAPI } from "../services/api"
import type { Incubacion, Incubadora } from "../types"
import { showDeleteConfirmation, showErrorAlert, showLoadingAlert, showSuccessAlert, closeLoadingAlert } from "../utils/sweetAlert"

const VerIncubaciones: React.FC = () => {
  const [incubaciones, setIncubaciones] = useState<Incubacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)

  // filtros
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState("")
  const [incubadora, setIncubadora] = useState("")
  const [incubadoras, setIncubadoras] = useState<Incubadora[]>([])

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) setUserRole(JSON.parse(user).rol)
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [{ data: incs }, { data: incus }] = await Promise.all([
        incubacionesAPI.getAll(),
        incubadorasAPI.getAll(),
      ])
      setIncubaciones(incs)
      setIncubadoras(incus)
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar las incubaciones")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return incubaciones.filter((i) => {
      const matchEstado = !estado || i.estado === (estado as any)
      const matchIncubadora = !incubadora || String(i.id_incubadora) === incubadora
      const term = search.trim().toLowerCase()
      const matchText =
        !term ||
        i.lote?.toLowerCase().includes(term) ||
        i.observaciones?.toLowerCase().includes(term) ||
        i.incubadora?.nombre?.toLowerCase().includes(term)
      return matchEstado && matchIncubadora && matchText
    })
  }, [incubaciones, estado, incubadora, search])

  const onDelete = async (id: number) => {
    const ok = await showDeleteConfirmation("¿Eliminar incubación?", "Esta acción no se puede deshacer.", "Sí, eliminar")
    if (!ok) return
    try {
      showLoadingAlert("Eliminando...", "Por favor espere")
      await incubacionesAPI.delete(id)
      await fetchAll()
      closeLoadingAlert()
      await showSuccessAlert("Eliminada", "La incubación fue eliminada correctamente.")
    } catch (err) {
      closeLoadingAlert()
      await showErrorAlert("Error", "No se pudo eliminar (verifica que no tenga nacimiento asociado).")
    }
  }

  const onEstado = async (id: number, nuevo: "activo" | "completado" | "cancelado") => {
    try {
      showLoadingAlert("Actualizando estado...", "")
      await incubacionesAPI.changeEstado(id, nuevo)
      await fetchAll()
      closeLoadingAlert()
    } catch {
      closeLoadingAlert()
      await showErrorAlert("Error", "No se pudo cambiar el estado.")
    }
  }

  const onRegistrarNacimiento = async (i: Incubacion) => {
    const fecha = new Date().toISOString().split("T")[0]
    const sexo = "" // podrías abrir un modal si quieres capturar sexo/obs
    const observaciones = ""
    try {
      showLoadingAlert("Registrando nacimiento...", "")
      await nacimientosAPI.create({
        id_incubacion: i.id_incubacion,
        fecha_nacimiento: fecha,
        sexo,
        observaciones,
      })
      await fetchAll()
      closeLoadingAlert()
      await showSuccessAlert("¡Nacimiento registrado!", "La incubación se ha marcado como completada.")
    } catch (e) {
      closeLoadingAlert()
      await showErrorAlert("Error", "No se pudo registrar el nacimiento.")
    }
  }

  if (loading) return <div className="text-center py-4">Cargando incubaciones...</div>
  if (error) return <div className="text-center text-red-600 py-4">{error}</div>

  return (
    <div className="ver-aves-container">
      <div className="table-header">
        <div className="header-content">
          <div className="header-icon">🥚</div>
          <div className="header-text">
            <h1 className="table-title">Incubaciones</h1>
            <p className="table-subtitle">Total: {filtered.length}</p>
          </div>
        </div>
      </div>

      {/* filtros */}
      <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="🔍 Buscar por lote, observación o incubadora..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border rounded-md text-sm"
        />
        <select
          value={incubadora}
          onChange={(e) => setIncubadora(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">Todas las incubadoras</option>
          {incubadoras.map((x) => (
            <option key={x.id_incubadora} value={x.id_incubadora}>
              {x.nombre}
            </option>
          ))}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="table-container overflow-x-auto">
        <table className="tabla-aves text-sm w-full">
          <thead>
            <tr>
              {/* <th className="p-2 text-left">#</th>  <-- eliminada */}
              <th className="p-2 text-left">Incubadora</th>
              <th className="p-2 text-left">Inicio</th>
              <th className="p-2 text-left">Estimada</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-left">Lote</th>
              <th className="p-2 text-left">Obs</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id_incubacion} className="border-b hover:bg-gray-50">
                {/* <td className="p-2">{i.id_incubacion}</td>  <-- eliminada */}
                <td className="p-2">{i.incubadora?.nombre || i.id_incubadora}</td>
                <td className="p-2">{new Date(i.fecha_inicio).toLocaleDateString()}</td>
                <td className="p-2">{new Date(i.fecha_estimada_eclo).toLocaleDateString()}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      i.estado === "activo"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : i.estado === "completado"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {i.estado}
                  </span>
                </td>
                <td className="p-2">{i.lote || "-"}</td>
                <td className="p-2">{i.observaciones || "-"}</td>
                <td className="p-2">
                  <div className="acciones-cell">
                    {i.estado === "activo" && (
                      <>
                        <button className="btn-editar" onClick={() => onEstado(i.id_incubacion, "cancelado")}>❌ Cancelar</button>
                        <button className="btn-editar" onClick={() => onRegistrarNacimiento(i)}>🐣 Nacimiento</button>
                      </>
                    )}
                    {userRole === "admin" && (
                      <button className="btn-eliminar" onClick={() => onDelete(i.id_incubacion)}>🗑️ Eliminar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={7}>
                  No hay registros que coincidan con los filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VerIncubaciones

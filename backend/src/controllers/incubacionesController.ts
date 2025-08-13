import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import {
  createIncubacionSchema,
  updateIncubacionSchema,
  incubacionIdParamsSchema,
  changeEstadoSchema,
  filtroIncubacionesSchema,
} from "../schemas/incubacionSchema"
import type { Incubacion, Incubadora, Nacimiento } from "../models/Incubacion"

// util: sumar días a YYYY-MM-DD
const addDays = (yyyyMMdd: string, days: number) => {
  const d = new Date(yyyyMMdd + "T00:00:00")
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/* =========================  INCUBACIONES  ========================= */

/** GET /api/incubacion?estado=&id_incubadora=&desde=&hasta=&q= */
export const getIncubaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const v = filtroIncubacionesSchema.safeParse(req.query)
    if (!v.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: v.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }

    const { id_incubadora, estado, desde, hasta, q } = v.data
    let query = supabase
      .from("incubacion")
      .select("*, incubadora:incubadora(*), nacimiento:nacimiento(id_nacimiento, fecha_nacimiento, sexo)")
      .order("id_incubacion", { ascending: false })

    if (id_incubadora) query = query.eq("id_incubadora", Number(id_incubadora))
    if (estado) query = query.eq("estado", estado)
    if (desde) query = query.gte("fecha_inicio", desde)
    if (hasta) query = query.lte("fecha_inicio", hasta)
    if (q) query = query.or(`lote.ilike.%${q}%,observaciones.ilike.%${q}%`)

    const { data, error } = await query
    if (error) {
      console.error("Error listando incubaciones:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.status(200).json((data || []) as (Incubacion & { incubadora?: Incubadora; nacimiento?: Partial<Nacimiento> })[])
  } catch (err) {
    console.error("Error inesperado en getIncubaciones:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** GET /api/incubacion/:id */
export const getIncubacionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pv = incubacionIdParamsSchema.safeParse(req.params)
    if (!pv.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: pv.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }
    const { id } = pv.data
    const { data, error } = await supabase
      .from("incubacion")
      .select("*, incubadora:incubadora(*), nacimiento:nacimiento(*)")
      .eq("id_incubacion", Number(id))
      .single()

    if (error) {
      console.error("Error obteniendo incubación:", error)
      res.status(400).json({ error: error.message })
      return
    }
    if (!data) {
      res.status(404).json({ error: "Incubación no encontrada" })
      return
    }
    res.status(200).json(data as Incubacion & { incubadora?: Incubadora; nacimiento?: Nacimiento })
  } catch (err) {
    console.error("Error inesperado en getIncubacionById:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** POST /api/incubacion */
export const createIncubacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const v = createIncubacionSchema.safeParse(req.body)
    if (!v.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: v.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }

    const payload = v.data
    const fecha_estimada_eclo = addDays(payload.fecha_inicio, 21)

    // Validar incubadora
    const { data: incu, error: incuErr } = await supabase
      .from("incubadora")
      .select("id_incubadora, estado")
      .eq("id_incubadora", payload.id_incubadora)
      .single()
    if (incuErr || !incu) {
      res.status(404).json({ error: "Incubadora no encontrada" })
      return
    }

    const { data, error } = await supabase
      .from("incubacion")
      .insert([{
        id_incubadora: payload.id_incubadora,
        fecha_inicio: payload.fecha_inicio,
        fecha_estimada_eclo,
        lote: payload.lote ?? null,
        temperatura: payload.temperatura ?? null,
        cantidad_huevos: payload.cantidad_huevos ?? 1,
        observaciones: payload.observaciones ?? null,
        estado: "activo",
      }])
      .select()
      .single()

    if (error) {
      console.error("Error creando incubación:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.status(201).json(data as Incubacion)
  } catch (err) {
    console.error("Error inesperado en createIncubacion:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** PUT /api/incubacion/:id  (solo si está activa) */
export const updateIncubacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const pv = incubacionIdParamsSchema.safeParse(req.params)
    if (!pv.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: pv.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }
    const bv = updateIncubacionSchema.safeParse(req.body)
    if (!bv.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: bv.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }

    const { id } = pv.data

    // Verifica que esté activa
    const { data: current, error: curErr } = await supabase
      .from("incubacion")
      .select("estado, fecha_inicio")
      .eq("id_incubacion", Number(id))
      .maybeSingle()

    if (curErr) {
      res.status(400).json({ error: curErr.message })
      return
    }
    if (current && "estado" in current && (current as any).estado !== "activo") {
      res.status(409).json({ error: "No es posible editar: la incubación no está activa" })
      return
    }

    const updates: Partial<Incubacion> = { ...(bv.data as any) }
    if ((updates as any).fecha_inicio) {
      ;(updates as any).fecha_estimada_eclo = addDays((updates as any).fecha_inicio as string, 21)
    }

    const { data, error } = await supabase
      .from("incubacion")
      .update(updates)
      .eq("id_incubacion", Number(id))
      .select()
      .single()

    if (error) {
      console.error("Error actualizando incubación:", error)
      res.status(400).json({ error: error.message })
      return
    }
    if (!data) {
      res.status(404).json({ error: "Incubación no encontrada" })
      return
    }
    res.status(200).json(data as Incubacion)
  } catch (err) {
    console.error("Error inesperado en updateIncubacion:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** PATCH /api/incubacion/:id/estado {estado} */
export const cambiarEstadoIncubacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const pv = incubacionIdParamsSchema.safeParse(req.params)
    const bv = changeEstadoSchema.safeParse(req.body)
    if (!pv.success || !bv.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: [...(pv.success ? [] : pv.error.errors), ...(bv.success ? [] : bv.error.errors)].map((e: any) => ({
          field: e.path?.join?.(".") ?? "",
          message: e.message,
        })),
      })
      return
    }
    const { id } = pv.data
    const { estado } = bv.data

    const { data: current, error: curErr } = await supabase
      .from("incubacion")
      .select("estado")
      .eq("id_incubacion", Number(id))
      .maybeSingle()
    if (curErr) {
      res.status(400).json({ error: curErr.message })
      return
    }
    if (current && (current as any).estado !== "activo") {
      res.status(409).json({ error: "La incubación ya no está activa" })
      return
    }

    const { data, error } = await supabase
      .from("incubacion")
      .update({ estado })
      .eq("id_incubacion", Number(id))
      .select()
      .single()
    if (error) {
      console.error("Error cambiando estado:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.status(200).json(data as Incubacion)
  } catch (err) {
    console.error("Error inesperado en cambiarEstadoIncubacion:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** DELETE /api/incubacion/:id (solo admin, sin nacimiento) */
export const deleteIncubacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const pv = incubacionIdParamsSchema.safeParse(req.params)
    if (!pv.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: pv.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }
    const { id } = pv.data

    // Verificar vínculo con nacimiento
    const { count, error: usedErr } = await supabase
      .from("nacimiento")
      .select("*", { count: "exact", head: true })
      .eq("id_incubacion", Number(id))
    if (usedErr) {
      console.error("Error verificando vínculo con nacimiento:", usedErr)
      res.status(400).json({ error: usedErr.message })
      return
    }
    if ((count ?? 0) > 0) {
      res.status(409).json({ error: "No se puede eliminar: la incubación tiene nacimiento asociado" })
      return
    }

    const { error } = await supabase.from("incubacion").delete().eq("id_incubacion", Number(id))
    if (error) {
      console.error("Error eliminando incubación:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.status(200).json({ message: "Incubación eliminada exitosamente" })
  } catch (err) {
    console.error("Error inesperado en deleteIncubacion:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** GET /api/incubacion/stats */
export const getStatsIncubaciones = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data: all, error } = await supabase.from("incubacion").select("id_incubadora, estado")
    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    const por_estado: Record<string, number> = {}
    const por_incubadora: Record<string, number> = {}
    for (const r of all || []) {
      const e = (r as any).estado ?? "sin_estado"
      por_estado[e] = (por_estado[e] || 0) + 1
      const k = String((r as any).id_incubadora)
      por_incubadora[k] = (por_incubadora[k] || 0) + 1
    }

    res.status(200).json({
      por_estado: Object.entries(por_estado).map(([estado, total]) => ({ estado, total })),
      por_incubadora: Object.entries(por_incubadora).map(([id_incubadora, total]) => ({
        id_incubadora: Number(id_incubadora),
        total,
      })),
    })
  } catch (err) {
    console.error("Error inesperado en getStatsIncubaciones:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/* =========================  INCUBADORAS  ========================= */
/** GET /api/incubacion/incubadoras */
export const getIncubadoras = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("incubadora")
      .select("id_incubadora, nombre, capacidad, estado")
      .order("nombre", { ascending: true })

    if (error) {
      console.error("Error obteniendo incubadoras:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.status(200).json((data || []) as Incubadora[])
  } catch (err) {
    console.error("Error inesperado en getIncubadoras:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** POST /api/incubacion/incubadoras  {nombre, capacidad, estado?} */
export const createIncubadora = async (req: Request, res: Response): Promise<void> => {
  try {
    let { nombre, capacidad, estado } = req.body as { nombre?: string; capacidad?: number | string; estado?: string }
    nombre = (nombre ?? "").trim()
    const cap = Number(capacidad)

    if (!nombre || Number.isNaN(cap) || cap <= 0) {
      res.status(400).json({ error: "nombre y capacidad válidos son requeridos" })
      return
    }
    if (!estado) estado = "activa"

    // (opcional) evitar duplicados por nombre
    const { data: dup } = await supabase
      .from("incubadora")
      .select("id_incubadora")
      .ilike("nombre", nombre)
      .maybeSingle()
    if (dup) {
      res.status(409).json({ error: "Ya existe una incubadora con ese nombre" })
      return
    }

    const { data, error } = await supabase
      .from("incubadora")
      .insert([{ nombre, capacidad: cap, estado }])
      .select("id_incubadora, nombre, capacidad, estado")
      .single()

    if (error) {
      console.error("Error creando incubadora:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.status(201).json(data as Incubadora)
  } catch (err) {
    console.error("Error inesperado en createIncubadora:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** PUT /api/incubacion/incubadoras/:id  {nombre?, capacidad?, estado?} */
export const updateIncubadora = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "ID inválido" })
      return
    }
    const { nombre, capacidad, estado } = req.body as { nombre?: string; capacidad?: number | string; estado?: string }
    const upd: Partial<Incubadora & { capacidad: number }> = {}
    if (nombre !== undefined) upd.nombre = String(nombre).trim()
    if (capacidad !== undefined) {
      const cap = Number(capacidad)
      if (Number.isNaN(cap) || cap <= 0) {
        res.status(400).json({ error: "capacidad inválida" })
        return
      }
      upd.capacidad = cap
    }
    if (estado !== undefined) upd.estado = estado

    const { data, error } = await supabase
      .from("incubadora")
      .update(upd)
      .eq("id_incubadora", id)
      .select("id_incubadora, nombre, capacidad, estado")
      .single()

    if (error) {
      console.error("Error actualizando incubadora:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.json(data as Incubadora)
  } catch (err) {
    console.error("Error inesperado en updateIncubadora:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** DELETE /api/incubacion/incubadoras/:id  (si no tiene incubaciones asociadas) */
export const deleteIncubadora = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "ID inválido" })
      return
    }

    // bloquear si tiene incubaciones
    const { count, error: cntErr } = await supabase
      .from("incubacion")
      .select("*", { head: true, count: "exact" })
      .eq("id_incubadora", id)
    if (cntErr) {
      res.status(400).json({ error: cntErr.message })
      return
    }
    if ((count ?? 0) > 0) {
      res.status(409).json({ error: "No se puede eliminar: incubadora con incubaciones asociadas" })
      return
    }

    const { error } = await supabase.from("incubadora").delete().eq("id_incubadora", id)
    if (error) {
      console.error("Error eliminando incubadora:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.status(204).send()
  } catch (err) {
    console.error("Error inesperado en deleteIncubadora:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

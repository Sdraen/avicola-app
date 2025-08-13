import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import { createNacimientoSchema, nacimientoIdParamsSchema } from "../schemas/nacimientoSchema"
import type { Nacimiento, Incubacion, Incubadora } from "../models/Incubacion"

/** POST /api/nacimientos */
export const createNacimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const v = createNacimientoSchema.safeParse(req.body)
    if (!v.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: v.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }
    const payload = v.data

    // Validar incubación existe y está activa
    const { data: incu, error: incuErr } = await supabase
      .from("incubacion")
      .select("id_incubacion, estado")
      .eq("id_incubacion", payload.id_incubacion)
      .single()
    if (incuErr || !incu) {
      res.status(404).json({ error: "Incubación no encontrada" })
      return
    }
    if ((incu as any).estado && (incu as any).estado !== "activo") {
      res.status(409).json({ error: "No se puede registrar nacimiento: la incubación no está activa" })
      return
    }

    // Evitar duplicados
    const { count, error: usedErr } = await supabase
      .from("nacimiento")
      .select("*", { count: "exact", head: true })
      .eq("id_incubacion", payload.id_incubacion)
    if (usedErr) {
      res.status(400).json({ error: usedErr.message })
      return
    }
    if ((count ?? 0) > 0) {
      res.status(409).json({ error: "Ya existe un nacimiento para esta incubación" })
      return
    }

    const { data: nac, error: nacErr } = await supabase
      .from("nacimiento")
      .insert([
        {
          id_incubacion: payload.id_incubacion,
          fecha_nacimiento: payload.fecha_nacimiento,
          sexo: payload.sexo ?? null,
          observaciones: payload.observaciones ?? null,
        },
      ])
      .select()
      .single()
    if (nacErr) {
      console.error("Error creando nacimiento:", nacErr)
      res.status(400).json({ error: nacErr.message })
      return
    }

    // Marcar incubación como completada
    const { error: upErr } = await supabase
      .from("incubacion")
      .update({ estado: "completado" })
      .eq("id_incubacion", payload.id_incubacion)
    if (upErr) {
      console.error("Error actualizando estado de incubación:", upErr)
    }

    res.status(201).json(nac as Nacimiento)
  } catch (err) {
    console.error("Error inesperado en createNacimiento:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** GET /api/nacimientos/:id */
export const getNacimientoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pv = nacimientoIdParamsSchema.safeParse(req.params)
    if (!pv.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: pv.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }
    const { id } = pv.data
    const { data, error } = await supabase
      .from("nacimiento")
      .select("*, incubacion:incubacion(*, incubadora:incubadora(*))")
      .eq("id_nacimiento", Number(id))
      .single()

    if (error) {
      console.error("Error obteniendo nacimiento:", error)
      res.status(400).json({ error: error.message })
      return
    }
    if (!data) {
      res.status(404).json({ error: "Nacimiento no encontrado" })
      return
    }
    res
      .status(200)
      .json(data as Nacimiento & { incubacion?: Incubacion & { incubadora?: Incubadora } })
  } catch (err) {
    console.error("Error inesperado en getNacimientoById:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

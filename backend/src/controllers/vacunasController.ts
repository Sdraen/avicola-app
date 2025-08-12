import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import { createVacunaSchema, updateVacunaSchema, vacunaIdSchema } from "../schemas/vacunaSchema"

// GET /api/vacunas
export const getAllVacunas = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string)?.trim()
    let query = supabase.from("vacuna").select("*").order("id_vacuna", { ascending: true })
    if (q) query = query.ilike("nombre", `%${q}%`)

    const { data, error } = await query
    if (error) {
      console.error("Error en getAllVacunas:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.status(200).json(data || [])
  } catch (error) {
    console.error("Error al listar vacunas:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// GET /api/vacunas/:id
export const getVacunaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = vacunaIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      })
      return
    }

    const { id } = paramValidation.data
    const { data, error } = await supabase.from("vacuna").select("*").eq("id_vacuna", Number(id)).single()

    if (error) {
      console.error("Error en getVacunaById:", error)
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Vacuna no encontrada" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error obteniendo vacuna:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// POST /api/vacunas
export const createVacuna = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createVacunaSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      })
      return
    }

    const payload = validation.data

    // nombre único
    const { data: exists, error: existsErr } = await supabase
      .from("vacuna")
      .select("id_vacuna")
      .ilike("nombre", payload.nombre)
      .maybeSingle()

    if (existsErr) {
      console.error("Error verificando duplicado:", existsErr)
      res.status(500).json({ error: "Error verificando datos existentes" })
      return
    }

    if (exists) {
      res.status(409).json({ error: "Ya existe una vacuna con ese nombre" })
      return
    }

    const { data, error } = await supabase.from("vacuna").insert([payload]).select().single()

    if (error) {
      console.error("Error insertando vacuna:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Error creando vacuna:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// PUT /api/vacunas/:id
export const updateVacuna = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = vacunaIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      })
      return
    }

    const bodyValidation = updateVacunaSchema.safeParse(req.body)
    if (!bodyValidation.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: bodyValidation.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      })
      return
    }

    const { id } = paramValidation.data
    const updates = bodyValidation.data

    if (updates.nombre) {
      const { data: found, error: findErr } = await supabase
        .from("vacuna")
        .select("id_vacuna")
        .ilike("nombre", updates.nombre)
        .maybeSingle()

      if (findErr) {
        console.error("Error verificando nombre único:", findErr)
        res.status(500).json({ error: "Error verificando datos existentes" })
        return
      }

      if (found && Number(found.id_vacuna) !== Number(id)) {
        res.status(409).json({ error: "Ya existe otra vacuna con ese nombre" })
        return
      }
    }

    const { data, error } = await supabase.from("vacuna").update(updates).eq("id_vacuna", Number(id)).select().single()

    if (error) {
      console.error("Error actualizando vacuna:", error)
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Vacuna no encontrada" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error inesperado al actualizar vacuna:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// DELETE /api/vacunas/:id
export const deleteVacuna = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = vacunaIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      })
      return
    }

    const { id } = paramValidation.data

    const { count, error: usedErr } = await supabase
      .from("jaulas_vacuna")
      .select("*", { count: "exact", head: true })
      .eq("id_vacuna", Number(id))

    if (usedErr) {
      console.error("Error verificando uso de vacuna:", usedErr)
      res.status(400).json({ error: usedErr.message })
      return
    }

    if ((count ?? 0) > 0) {
      res.status(409).json({ error: "No se puede eliminar: la vacuna ya fue aplicada" })
      return
    }

    const { error } = await supabase.from("vacuna").delete().eq("id_vacuna", Number(id))
    if (error) {
      console.error("Error eliminando vacuna:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Vacuna eliminada exitosamente" })
  } catch (error) {
    console.error("Error eliminando vacuna:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import {
  createMedicamentoSchema,
  updateMedicamentoSchema,
  medicamentoIdSchema,
} from "../schemas/medicamentoSchema"

/** GET /api/medicamentos?q=amoxi */
export const getAllMedicamentos = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string)?.trim()
    let query = supabase.from("medicamento").select("*").order("id_medicamento", { ascending: true })
    if (q) query = query.ilike("nombre", `%${q}%`)

    const { data, error } = await query
    if (error) {
      console.error("Error en getAllMedicamentos:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.status(200).json(data || [])
  } catch (error) {
    console.error("Error al listar medicamentos:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** GET /api/medicamentos/:id */
export const getMedicamentoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = medicamentoIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }
    const { id } = paramValidation.data
    const { data, error } = await supabase
      .from("medicamento")
      .select("*")
      .eq("id_medicamento", Number(id))
      .single()

    if (error) {
      console.error("Error en getMedicamentoById:", error)
      res.status(400).json({ error: error.message })
      return
    }
    if (!data) {
      res.status(404).json({ error: "Medicamento no encontrado" })
      return
    }
    res.status(200).json(data)
  } catch (error) {
    console.error("Error obteniendo medicamento:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** POST /api/medicamentos */
export const createMedicamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createMedicamentoSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }
    const { nombre, dosis } = validation.data

    // nombre único
    const { data: exists, error: existsErr } = await supabase
      .from("medicamento")
      .select("id_medicamento")
      .ilike("nombre", nombre)
      .maybeSingle()
    if (existsErr) {
      console.error("Error verificando duplicado:", existsErr)
      res.status(500).json({ error: "Error verificando datos existentes" })
      return
    }
    if (exists) {
      res.status(409).json({ error: "Ya existe un medicamento con ese nombre" })
      return
    }

    const { data, error } = await supabase.from("medicamento").insert([{ nombre, dosis }]).select().single()
    if (error) {
      console.error("Error insertando medicamento:", error)
      if (error.message.includes("duplicate key value") || error.code === "23505") {
        res.status(409).json({ error: "Ya existe un medicamento con ese nombre" })
      } else {
        res.status(400).json({ error: error.message })
      }
      return
    }
    res.status(201).json(data)
  } catch (error) {
    console.error("Error creando medicamento:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** PUT /api/medicamentos/:id */
export const updateMedicamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = medicamentoIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }
    const bodyValidation = updateMedicamentoSchema.safeParse(req.body)
    if (!bodyValidation.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: bodyValidation.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }

    const { id } = paramValidation.data
    const updates = bodyValidation.data

    if (updates.nombre) {
      const { data: found, error: findErr } = await supabase
        .from("medicamento")
        .select("id_medicamento")
        .ilike("nombre", updates.nombre)
        .maybeSingle()
      if (findErr) {
        console.error("Error verificando nombre único:", findErr)
        res.status(500).json({ error: "Error verificando datos existentes" })
        return
      }
      if (found && Number(found.id_medicamento) !== Number(id)) {
        res.status(409).json({ error: "Ya existe otro medicamento con ese nombre" })
        return
      }
    }

    const { data, error } = await supabase
      .from("medicamento")
      .update(updates)
      .eq("id_medicamento", Number(id))
      .select()
      .single()

    if (error) {
      console.error("Error actualizando medicamento:", error)
      res.status(400).json({ error: error.message })
      return
    }
    if (!data) {
      res.status(404).json({ error: "Medicamento no encontrado" })
      return
    }
    res.status(200).json(data)
  } catch (error) {
    console.error("Error inesperado al actualizar medicamento:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/** DELETE /api/medicamentos/:id  (solo si no está aplicado) */
export const deleteMedicamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = medicamentoIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      })
      return
    }
    const { id } = paramValidation.data

    // Verificar uso en estanque_medicamento
    const { count, error: usedErr } = await supabase
      .from("estanque_medicamento")
      .select("*", { count: "exact", head: true })
      .eq("id_medicamento", Number(id))
    if (usedErr) {
      console.error("Error verificando uso de medicamento:", usedErr)
      res.status(400).json({ error: usedErr.message })
      return
    }
    if ((count ?? 0) > 0) {
      res.status(409).json({ error: "No se puede eliminar: el medicamento ya fue aplicado" })
      return
    }

    const { error } = await supabase.from("medicamento").delete().eq("id_medicamento", Number(id))
    if (error) {
      console.error("Error eliminando medicamento:", error)
      res.status(400).json({ error: error.message })
      return
    }
    res.status(200).json({ message: "Medicamento eliminado exitosamente" })
  } catch (error) {
    console.error("Error eliminando medicamento:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

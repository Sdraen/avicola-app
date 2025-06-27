import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import { createAveSchema, updateAveSchema, aveIdSchema, jaulaIdSchema } from "../schemas/aveSchema"

// Obtener todas las aves
export const getAllAves = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from("ave").select(`
        *,
        jaula:jaula(*)
      `)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error al obtener las aves:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtiene una ave por su ID
export const getAveById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar parámetros
    const paramValidation = aveIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { id } = paramValidation.data
    const { data, error } = await supabase
      .from("ave")
      .select(`
        *,
        jaula:jaula(*)
      `)
      .eq("id_ave", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Gallina no encontrada" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error obteniendo la ave:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Crea una nueva ave
export const createAve = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar con schema
    const validation = createAveSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { id_jaula, id_anillo, color_anillo, edad, estado_puesta, raza } = validation.data

    // Intentar insertar en Supabase
    const { data, error } = await supabase
      .from("ave")
      .insert([
        {
          id_jaula,
          id_anillo,
          color_anillo,
          edad,
          estado_puesta,
          raza,
          fecha_registro: new Date().toISOString().split("T")[0],
        },
      ])
      .select()
      .single()

    // Captura de error por duplicado (único)
    if (error) {
      if (error.message.includes("duplicate key value") || error.code === "23505") {
        res.status(409).json({ error: "Ya existe una gallina con ese id_anillo" })
      } else {
        res.status(400).json({ error: error.message })
      }
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Error creando la ave:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Actualiza una ave existente
export const updateAve = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar parámetros
    const paramValidation = aveIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    // Validar datos de actualización
    const validation = updateAveSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { id } = paramValidation.data
    const updates = validation.data

    // Log para depuración
    console.log("ID:", id)
    console.log("Payload validado:", updates)

    // Campos que no deben enviarse al update (ya filtrados por el schema)
    const forbiddenFields = ["id_ave", "fecha_registro", "jaula"]
    const cleanUpdates = { ...updates }
    for (const field of forbiddenFields) {
      delete cleanUpdates[field as keyof typeof cleanUpdates]
    }

    const { data, error } = await supabase.from("ave").update(cleanUpdates).eq("id_ave", Number(id)).select().single()

    if (error) {
      if (error.message.includes("duplicate key value") || error.code === "23505") {
        res.status(409).json({ error: "Ya existe otra gallina con ese id_anillo" })
      } else {
        console.error("Error de Supabase:", error)
        res.status(400).json({ error: error.message })
      }
      return
    }

    if (!data) {
      res.status(404).json({ error: "Gallina no encontrada" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error inesperado al actualizar ave:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteAve = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar parámetros
    const paramValidation = aveIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { id } = paramValidation.data

    const { error } = await supabase.from("ave").delete().eq("id_ave", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Gallina eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting bird:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getAvesByJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar parámetros
    const paramValidation = jaulaIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { id_jaula } = paramValidation.data
    const { data, error } = await supabase.from("ave").select("*").eq("id_jaula", id_jaula)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching birds by cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getAvesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { count: totalBirds } = await supabase.from("ave").select("*", { count: "exact", head: true })

    const { data: layingStats } = await supabase.from("ave").select("estado_puesta").neq("estado_puesta", null)
    const { data: breedStats } = await supabase.from("ave").select("raza").neq("raza", null)

    const currentMonth = new Date().toISOString().slice(0, 7)
    const { count: deceasedThisMonth } = await supabase
      .from("aves_fallecidas")
      .select("*", { count: "exact", head: true })
      .gte("fecha", `${currentMonth}-01`)

    res.status(200).json({
      totalBirds: totalBirds || 0,
      deceasedThisMonth: deceasedThisMonth || 0,
      layingStats: layingStats || [],
      breedStats: breedStats || [],
    })
  } catch (error) {
    console.error("Error fetching bird statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

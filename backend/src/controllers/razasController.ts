import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

// ✅ CRUD para razas configurables (solo admin)
export const getAllRazas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from("razas_permitidas").select("*").order("nombre")

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching breeds:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createRaza = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion } = req.body

    if (!nombre) {
      res.status(400).json({ error: "nombre is required" })
      return
    }

    // Verificar que no existe
    const { data: existing } = await supabase.from("razas_permitidas").select("id_raza").eq("nombre", nombre).single()

    if (existing) {
      res.status(400).json({ error: "Breed already exists" })
      return
    }

    const { data, error } = await supabase
      .from("razas_permitidas")
      .insert([
        {
          nombre,
          descripcion,
          activa: true,
          fecha_creacion: new Date().toISOString().split("T")[0],
          creado_por: 1, // TODO: obtener del token
        },
      ])
      .select()
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Error creating breed:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateRaza = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase.from("razas_permitidas").update(updates).eq("id_raza", id).select().single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Breed not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating breed:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteRaza = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Verificar si está en uso
    const { count } = await supabase.from("ave").select("*", { count: "exact", head: true }).eq("raza", id)

    if (count && count > 0) {
      res.status(400).json({
        error: "Cannot delete breed that is in use. Deactivate instead.",
      })
      return
    }

    const { error } = await supabase.from("razas_permitidas").delete().eq("id_raza", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Breed deleted successfully" })
  } catch (error) {
    console.error("Error deleting breed:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

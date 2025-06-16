import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getAllVacunas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from("vacuna").select("*").order("nombre")

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching vaccines:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getVacunaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("vacuna")
      .select(`
        *,
        jaulas:jaulas_vacuna(
          id_jauvacu,
          id_jaula,
          jaula:jaula(*)
        )
      `)
      .eq("id_vacuna", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Vaccine not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching vaccine:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createVacuna = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, dosis, fecha_adminstracion } = req.body

    if (!nombre) {
      res.status(400).json({ error: "nombre is required" })
      return
    }

    const { data, error } = await supabase
      .from("vacuna")
      .insert([
        {
          nombre,
          dosis,
          fecha_adminstracion: fecha_adminstracion || new Date().toISOString().split("T")[0],
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
    console.error("Error creating vaccine:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateVacuna = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase.from("vacuna").update(updates).eq("id_vacuna", id).select().single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Vaccine not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating vaccine:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteVacuna = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Check if vaccine is in use
    const { count: usageCount } = await supabase
      .from("jaulas_vacuna")
      .select("*", { count: "exact", head: true })
      .eq("id_vacuna", id)

    if (usageCount && usageCount > 0) {
      res.status(400).json({
        error: "Cannot delete vaccine that has been used. Consider deactivating instead.",
      })
      return
    }

    const { error } = await supabase.from("vacuna").delete().eq("id_vacuna", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Vaccine deleted successfully" })
  } catch (error) {
    console.error("Error deleting vaccine:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const aplicarVacuna = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_vacuna, id_jaula } = req.body

    if (!id_vacuna || !id_jaula) {
      res.status(400).json({
        error: "id_vacuna and id_jaula are required",
      })
      return
    }

    const { data, error } = await supabase
      .from("jaulas_vacuna")
      .insert([
        {
          id_vacuna,
          id_jaula,
        },
      ])
      .select()
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    // Update vaccine administration date
    await supabase
      .from("vacuna")
      .update({
        fecha_adminstracion: new Date().toISOString().split("T")[0],
      })
      .eq("id_vacuna", id_vacuna)

    res.status(201).json(data)
  } catch (error) {
    console.error("Error applying vaccine:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getVacunaAplicaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_vacuna } = req.params
    const { data, error } = await supabase
      .from("jaulas_vacuna")
      .select(`
        *,
        jaula:jaula(*),
        vacuna:vacuna(*)
      `)
      .eq("id_vacuna", id_vacuna)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching vaccine applications:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const searchVacunas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.params
    const { data, error } = await supabase.from("vacuna").select("*").ilike("nombre", `%${query}%`).order("nombre")

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error searching vaccines:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

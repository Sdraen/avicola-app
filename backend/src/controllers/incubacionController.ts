import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getAllIncubaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("incubacion")
      .select(`
        *,
        incubadora:incubadora(*),
        huevo:huevo(*),
        nacimiento:nacimiento(*)
      `)
      .order("fecha_inicio", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching incubations:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getIncubacionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("incubacion")
      .select(`
        *,
        incubadora:incubadora(*),
        huevo:huevo(*),
        nacimiento:nacimiento(*)
      `)
      .eq("id_incubacion", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Incubation not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching incubation:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createIncubacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_incubadora, id_huevo, fecha_inicio, fecha_fin, estado } = req.body

    if (!id_incubadora || !id_huevo || !fecha_inicio || !estado) {
      res.status(400).json({
        error: "id_incubadora, id_huevo, fecha_inicio, and estado are required",
      })
      return
    }

    const { data, error } = await supabase
      .from("incubacion")
      .insert([
        {
          id_incubadora,
          id_huevo,
          fecha_inicio,
          fecha_fin,
          estado,
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
    console.error("Error creating incubation:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateIncubacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase.from("incubacion").update(updates).eq("id_incubacion", id).select().single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Incubation not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating incubation:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteIncubacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const { error } = await supabase.from("incubacion").delete().eq("id_incubacion", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Incubation deleted successfully" })
  } catch (error) {
    console.error("Error deleting incubation:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getActiveIncubaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("incubacion")
      .select(`
        *,
        incubadora:incubadora(*),
        huevo:huevo(*)
      `)
      .eq("estado", "activo")
      .order("fecha_inicio", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching active incubations:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getIncubacionesByIncubadora = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_incubadora } = req.params
    const { data, error } = await supabase
      .from("incubacion")
      .select(`
        *,
        huevo:huevo(*),
        nacimiento:nacimiento(*)
      `)
      .eq("id_incubadora", id_incubadora)
      .order("fecha_inicio", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching incubations by incubator:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getIncubacionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total incubations
    const { count: totalIncubations } = await supabase.from("incubacion").select("*", { count: "exact", head: true })

    // Active incubations
    const { count: activeIncubations } = await supabase
      .from("incubacion")
      .select("*", { count: "exact", head: true })
      .eq("estado", "activo")

    // Completed incubations
    const { count: completedIncubations } = await supabase
      .from("incubacion")
      .select("*", { count: "exact", head: true })
      .eq("estado", "completado")

    // Success rate (births vs incubations)
    const { count: totalBirths } = await supabase.from("nacimiento").select("*", { count: "exact", head: true })

    const successRate =
      totalIncubations && totalIncubations > 0 ? Math.round(((totalBirths || 0) / totalIncubations) * 100) : 0

    res.status(200).json({
      totalIncubations: totalIncubations || 0,
      activeIncubations: activeIncubations || 0,
      completedIncubations: completedIncubations || 0,
      totalBirths: totalBirths || 0,
      successRate,
    })
  } catch (error) {
    console.error("Error fetching incubation statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

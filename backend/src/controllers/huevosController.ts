import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getAllHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("huevo")
      .select(`
        *,
        ave:ave(*)
      `)
      .order("fecha_recoleccion", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching eggs:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getHuevoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("huevo")
      .select(`
        *,
        ave:ave(*)
      `)
      .eq("id_huevo", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Egg not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching egg:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_ave, tipo_huevo } = req.body

    if (!id_ave || !tipo_huevo) {
      res.status(400).json({ error: "id_ave and tipo_huevo are required" })
      return
    }

    const { data, error } = await supabase
      .from("huevo")
      .insert([
        {
          id_ave,
          tipo_huevo,
          fecha_recoleccion: new Date().toISOString().split("T")[0],
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
    console.error("Error creating egg record:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createBulkHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eggs } = req.body

    if (!Array.isArray(eggs) || eggs.length === 0) {
      res.status(400).json({ error: "Eggs array is required" })
      return
    }

    const eggsWithDate = eggs.map((egg) => ({
      ...egg,
      fecha_recoleccion: egg.fecha_recoleccion || new Date().toISOString().split("T")[0],
    }))

    const { data, error } = await supabase.from("huevo").insert(eggsWithDate).select()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Error creating bulk egg records:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase.from("huevo").update(updates).eq("id_huevo", id).select().single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Egg not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating egg:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const { error } = await supabase.from("huevo").delete().eq("id_huevo", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Egg deleted successfully" })
  } catch (error) {
    console.error("Error deleting egg:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getHuevosByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.params
    const { data, error } = await supabase
      .from("huevo")
      .select(`
        *,
        ave:ave(*)
      `)
      .gte("fecha_recoleccion", start)
      .lte("fecha_recoleccion", end)
      .order("fecha_recoleccion", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching eggs by date range:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getHuevosStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total eggs
    const { count: totalEggs } = await supabase.from("huevo").select("*", { count: "exact", head: true })

    // Eggs today
    const today = new Date().toISOString().split("T")[0]
    const { count: eggsToday } = await supabase
      .from("huevo")
      .select("*", { count: "exact", head: true })
      .eq("fecha_recoleccion", today)

    // Eggs this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { count: eggsThisWeek } = await supabase
      .from("huevo")
      .select("*", { count: "exact", head: true })
      .gte("fecha_recoleccion", weekAgo.toISOString().split("T")[0])

    // Eggs by type
    const { data: eggsByType } = await supabase.from("huevo").select("tipo_huevo").neq("tipo_huevo", null)

    res.status(200).json({
      totalEggs: totalEggs || 0,
      eggsToday: eggsToday || 0,
      eggsThisWeek: eggsThisWeek || 0,
      eggsByType: eggsByType || [],
    })
  } catch (error) {
    console.error("Error fetching egg statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

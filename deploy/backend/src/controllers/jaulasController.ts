import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getAllJaulas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from("jaula").select(`
        *,
        estanque:estanque(*),
        aves:ave(*)
      `)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching cages:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getJaulaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("jaula")
      .select(`
        *,
        estanque:estanque(*),
        aves:ave(*),
        servicios_higiene:servicio_higiene(*)
      `)
      .eq("id_jaula", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Cage not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_estanque, descripcion } = req.body

    if (!id_estanque) {
      res.status(400).json({ error: "id_estanque is required" })
      return
    }

    const { data, error } = await supabase
      .from("jaula")
      .insert([
        {
          id_estanque,
          descripcion,
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
    console.error("Error creating cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase.from("jaula").update(updates).eq("id_jaula", id).select().single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Cage not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Check if cage has birds
    const { count: birdCount } = await supabase
      .from("ave")
      .select("*", { count: "exact", head: true })
      .eq("id_jaula", id)

    if (birdCount && birdCount > 0) {
      res.status(400).json({ error: "Cannot delete cage with birds. Move birds first." })
      return
    }

    const { error } = await supabase.from("jaula").delete().eq("id_jaula", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Cage deleted successfully" })
  } catch (error) {
    console.error("Error deleting cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getJaulasByEstanque = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_estanque } = req.params
    const { data, error } = await supabase
      .from("jaula")
      .select(`
        *,
        aves:ave(*)
      `)
      .eq("id_estanque", id_estanque)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching cages by estanque:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getJaulasStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total cages
    const { count: totalCages } = await supabase.from("jaula").select("*", { count: "exact", head: true })

    // Total birds in cages
    const { data: cagesWithBirds } = await supabase.from("jaula").select(`
        id_jaula,
        aves:ave(id_ave)
      `)

    const cageStats = cagesWithBirds?.map((cage) => ({
      id_jaula: cage.id_jaula,
      birdCount: cage.aves ? cage.aves.length : 0,
    }))

    // Empty cages
    const emptyCages = cageStats?.filter((cage) => cage.birdCount === 0).length || 0

    // Cages with hygiene services this month
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: hygieneServices } = await supabase
      .from("servicio_higiene")
      .select("id_jaula")
      .gte("fecha", `${currentMonth}-01`)
      .order("fecha", { ascending: false })

    // Get unique cage IDs with hygiene services
    const uniqueCagesWithHygiene = new Set(hygieneServices?.map((service) => service.id_jaula))

    res.status(200).json({
      totalCages: totalCages || 0,
      emptyCages,
      cagesWithBirds: totalCages ? totalCages - emptyCages : 0,
      cagesWithHygieneThisMonth: uniqueCagesWithHygiene.size,
      cageStats,
    })
  } catch (error) {
    console.error("Error fetching cage statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const addHygieneService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { tipo } = req.body

    if (!tipo) {
      res.status(400).json({ error: "tipo is required" })
      return
    }

    // Check if cage exists
    const { data: cage, error: cageError } = await supabase.from("jaula").select("*").eq("id_jaula", id).single()

    if (cageError || !cage) {
      res.status(404).json({ error: "Cage not found" })
      return
    }

    const { data, error } = await supabase
      .from("servicio_higiene")
      .insert([
        {
          id_jaula: id,
          tipo,
          fecha: new Date().toISOString().split("T")[0],
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
    console.error("Error adding hygiene service:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

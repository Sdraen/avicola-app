import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getAllImplementos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("implementos")
      .select(`
        *,
        compra:compras(*)
      `)
      .order("nombre")

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching supplies:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getImplementoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("implementos")
      .select(`
        *,
        compra:compras(*)
      `)
      .eq("id_implementos", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Supply not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching supply:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createImplemento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_compras, nombre, cantidad, costo_unitario } = req.body

    if (!nombre || !cantidad) {
      res.status(400).json({ error: "nombre and cantidad are required" })
      return
    }

    const { data, error } = await supabase
      .from("implementos")
      .insert([
        {
          id_compras,
          nombre,
          cantidad,
          costo_unitario,
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
    console.error("Error creating supply:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateImplemento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from("implementos")
      .update(updates)
      .eq("id_implementos", id)
      .select()
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Supply not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating supply:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteImplemento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const { error } = await supabase.from("implementos").delete().eq("id_implementos", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Supply deleted successfully" })
  } catch (error) {
    console.error("Error deleting supply:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getImplementosByCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_compras } = req.params
    const { data, error } = await supabase.from("implementos").select("*").eq("id_compras", id_compras).order("nombre")

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching supplies by purchase:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const searchImplementos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.params
    const { data, error } = await supabase.from("implementos").select("*").ilike("nombre", `%${query}%`).order("nombre")

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error searching supplies:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getImplementosStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total supplies
    const { count: totalSupplies } = await supabase.from("implementos").select("*", { count: "exact", head: true })

    // Total value
    const { data: allSupplies } = await supabase.from("implementos").select("cantidad, costo_unitario")

    let totalValue = 0
    allSupplies?.forEach((supply) => {
      const quantity = Number.parseFloat(supply.cantidad) || 0
      const cost = Number.parseFloat(supply.costo_unitario) || 0
      totalValue += quantity * cost
    })

    // Supplies by name (for inventory overview)
    const { data: suppliesByName } = await supabase
      .from("implementos")
      .select("nombre, cantidad, costo_unitario")
      .order("nombre")

    res.status(200).json({
      totalSupplies: totalSupplies || 0,
      totalValue,
      suppliesByName: suppliesByName || [],
    })
  } catch (error) {
    console.error("Error fetching supply statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

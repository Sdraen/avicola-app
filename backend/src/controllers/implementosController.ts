import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getAllImplementos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("implementos")
      .select(`
        id_implemento,
        id_compra,
        nombre,
        cantidad,
        precio_unitario,
        categoria,
        descripcion,
        estado,
        ubicacion,
        fecha_registro,
        compras (
          id_compra,
          fecha,
          costo_total,
          proveedor
        )
      `)
      .order("nombre")

    if (error) {
      console.error("Supabase error:", error)
      res.status(400).json({ error: error.message })
      return
    }

    // Transform the data to match expected structure
    const transformedData =
      data?.map((item) => ({
        ...item,
        compra: item.compras,
      })) || []

    res.status(200).json(transformedData)
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
        id_implemento,
        id_compra,
        nombre,
        cantidad,
        precio_unitario,
        categoria,
        descripcion,
        estado,
        ubicacion,
        fecha_registro,
        compras (
          id_compra,
          fecha,
          costo_total,
          proveedor
        )
      `)
      .eq("id_implemento", id)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Supply not found" })
      return
    }

    // Transform the data to match expected structure
    const transformedData = {
      ...data,
      compra: data.compras,
    }

    res.status(200).json(transformedData)
  } catch (error) {
    console.error("Error fetching supply:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createImplemento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_compra, nombre, cantidad, precio_unitario, categoria, descripcion, estado, ubicacion } = req.body

    if (!nombre || !cantidad || !precio_unitario) {
      res.status(400).json({ error: "nombre, cantidad y precio_unitario son requeridos" })
      return
    }

    // Si se proporciona id_compra, verificar que la compra existe
    if (id_compra) {
      const { data: compraExists, error: compraError } = await supabase
        .from("compras")
        .select("id_compra, fecha")
        .eq("id_compra", id_compra)
        .single()

      if (compraError || !compraExists) {
        res.status(400).json({ error: "La compra especificada no existe" })
        return
      }
    }

    const { data, error } = await supabase
      .from("implementos")
      .insert([
        {
          id_compra: id_compra || null,
          nombre,
          cantidad: Number(cantidad),
          precio_unitario: Number(precio_unitario),
          categoria,
          descripcion,
          estado: estado || "Bueno",
          ubicacion,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
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

    const { data, error } = await supabase.from("implementos").update(updates).eq("id_implemento", id).select().single()

    if (error) {
      console.error("Supabase error:", error)
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

    const { error } = await supabase.from("implementos").delete().eq("id_implemento", id)

    if (error) {
      console.error("Supabase error:", error)
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
    const { id } = req.params
    const { data, error } = await supabase.from("implementos").select("*").eq("id_compra", id).order("nombre")

    if (error) {
      console.error("Supabase error:", error)
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
      console.error("Supabase error:", error)
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
    const { count: totalSupplies } = await supabase.from("implementos").select("*", { count: "exact", head: true })

    const { data: allSupplies } = await supabase.from("implementos").select("cantidad, precio_unitario")

    let totalValue = 0
    allSupplies?.forEach((supply) => {
      const quantity = Number.parseFloat(supply.cantidad) || 0
      const cost = Number.parseFloat(supply.precio_unitario) || 0
      totalValue += quantity * cost
    })

    const { data: suppliesByName } = await supabase
      .from("implementos")
      .select("nombre, cantidad, precio_unitario")
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

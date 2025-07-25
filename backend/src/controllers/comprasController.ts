import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import { createCompraSchema, updateCompraSchema } from "../schemas/compraSchema"

export const getAllCompras = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("compras")
      .select(`
        id_compra,
        fecha,
        costo_total,
        proveedor,
        implementos (
          id_implemento,
          nombre,
          cantidad,
          precio_unitario,
          categoria,
          descripcion,
          estado,
          ubicacion
        )
      `)
      .order("fecha", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching purchases:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getCompraById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("compras")
      .select(`
        id_compra,
        fecha,
        costo_total,
        proveedor,
        implementos (
          id_implemento,
          nombre,
          cantidad,
          precio_unitario,
          categoria,
          descripcion,
          estado,
          ubicacion
        )
      `)
      .eq("id_compra", id)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Purchase not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching purchase:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar con schema
    const validation = createCompraSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { fecha = new Date().toISOString().split("T")[0], costo_total, proveedor, implementos } = validation.data

    // Start a transaction
    const { data, error } = await supabase
      .from("compras")
      .insert([
        {
          fecha,
          costo_total,
          proveedor,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      res.status(400).json({ error: error.message })
      return
    }

    // If implementos array is provided, add them to the implementos table
    if (implementos && Array.isArray(implementos) && implementos.length > 0) {
      const implementosWithCompraId = implementos.map((item) => ({
        ...item,
        id_compra: data.id_compra,
      }))

      const { error: implementosError } = await supabase.from("implementos").insert(implementosWithCompraId)

      if (implementosError) {
        console.error("Error adding implementos:", implementosError)
        res.status(400).json({ error: implementosError.message })
        return
      }
    }

    // Get the complete purchase with implementos
    const { data: completeData, error: fetchError } = await supabase
      .from("compras")
      .select(`
        id_compra,
        fecha,
        costo_total,
        proveedor,
        implementos (
          id_implemento,
          nombre,
          cantidad,
          precio_unitario,
          categoria,
          descripcion,
          estado,
          ubicacion
        )
      `)
      .eq("id_compra", data.id_compra)
      .single()

    if (fetchError) {
      console.error("Supabase error:", fetchError)
      res.status(400).json({ error: fetchError.message })
      return
    }

    res.status(201).json(completeData)
  } catch (error) {
    console.error("Error creating purchase:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Validar con schema
    const validation = updateCompraSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const updates = validation.data

    const { data, error } = await supabase.from("compras").update(updates).eq("id_compra", id).select().single()

    if (error) {
      console.error("Supabase error:", error)
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Purchase not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating purchase:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Check if purchase has implementos
    const { count: implementosCount } = await supabase
      .from("implementos")
      .select("*", { count: "exact", head: true })
      .eq("id_compra", id)

    if (implementosCount && implementosCount > 0) {
      // Delete associated implementos first
      const { error: implementosError } = await supabase.from("implementos").delete().eq("id_compra", id)

      if (implementosError) {
        console.error("Supabase error:", implementosError)
        res.status(400).json({ error: implementosError.message })
        return
      }
    }

    // Now delete the purchase
    const { error } = await supabase.from("compras").delete().eq("id_compra", id)

    if (error) {
      console.error("Supabase error:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Purchase deleted successfully" })
  } catch (error) {
    console.error("Error deleting purchase:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getComprasByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.params
    const { data, error } = await supabase
      .from("compras")
      .select(`
        id_compra,
        fecha,
        costo_total,
        proveedor,
        implementos (
          id_implemento,
          nombre,
          cantidad,
          precio_unitario,
          categoria,
          descripcion,
          estado,
          ubicacion
        )
      `)
      .gte("fecha", start)
      .lte("fecha", end)
      .order("fecha", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching purchases by date range:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getComprasStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total purchases
    const { count: totalPurchases } = await supabase.from("compras").select("*", { count: "exact", head: true })

    // Total spent
    const { data: allPurchases } = await supabase.from("compras").select("costo_total")
    const totalSpent =
      allPurchases?.reduce((sum, purchase) => sum + Number.parseFloat(purchase.costo_total || "0"), 0) || 0

    // Purchases this month
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: purchasesThisMonth } = await supabase
      .from("compras")
      .select("costo_total")
      .gte("fecha", `${currentMonth}-01`)

    const spentThisMonth =
      purchasesThisMonth?.reduce((sum, purchase) => sum + Number.parseFloat(purchase.costo_total || "0"), 0) || 0

    // Recent purchases
    const { data: recentPurchases } = await supabase
      .from("compras")
      .select(`
        id_compra,
        fecha,
        costo_total,
        proveedor,
        implementos (nombre)
      `)
      .order("fecha", { ascending: false })
      .limit(5)

    res.status(200).json({
      totalPurchases: totalPurchases || 0,
      totalSpent,
      spentThisMonth,
      recentPurchases: recentPurchases || [],
    })
  } catch (error) {
    console.error("Error fetching purchase statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

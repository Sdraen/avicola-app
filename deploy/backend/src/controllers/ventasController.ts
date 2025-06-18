import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getAllVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("venta")
      .select(`
        *,
        cliente:cliente(*),
        bandeja:bandeja(*)
      `)
      .order("fecha_venta", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching sales:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getVentaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("venta")
      .select(`
        *,
        cliente:cliente(*),
        bandeja:bandeja(*)
      `)
      .eq("id_venta", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Sale not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching sale:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_cliente, codigo_barras, costo_total, cantidad_total } = req.body

    if (!id_cliente || !codigo_barras || !costo_total || !cantidad_total) {
      res.status(400).json({
        error: "id_cliente, codigo_barras, costo_total, and cantidad_total are required",
      })
      return
    }

    const { data, error } = await supabase
      .from("venta")
      .insert([
        {
          id_cliente,
          codigo_barras,
          costo_total,
          cantidad_total,
          fecha_venta: new Date().toISOString().split("T")[0],
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
    console.error("Error creating sale:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase.from("venta").update(updates).eq("id_venta", id).select().single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Sale not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating sale:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const { error } = await supabase.from("venta").delete().eq("id_venta", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Sale deleted successfully" })
  } catch (error) {
    console.error("Error deleting sale:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getVentasByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.params
    const { data, error } = await supabase
      .from("venta")
      .select(`
        *,
        cliente:cliente(*)
      `)
      .gte("fecha_venta", start)
      .lte("fecha_venta", end)
      .order("fecha_venta", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching sales by date range:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getVentasStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total sales
    const { count: totalSales } = await supabase.from("venta").select("*", { count: "exact", head: true })

    // Sales today
    const today = new Date().toISOString().split("T")[0]
    const { count: salesToday } = await supabase
      .from("venta")
      .select("*", { count: "exact", head: true })
      .eq("fecha_venta", today)

    // Revenue today
    const { data: revenueToday } = await supabase.from("venta").select("costo_total").eq("fecha_venta", today)

    const totalRevenueToday = revenueToday?.reduce((sum, sale) => sum + sale.costo_total, 0) || 0

    // Revenue this month
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: revenueThisMonth } = await supabase
      .from("venta")
      .select("costo_total")
      .gte("fecha_venta", `${currentMonth}-01`)

    const totalRevenueThisMonth = revenueThisMonth?.reduce((sum, sale) => sum + sale.costo_total, 0) || 0

    // Top customers
    const { data: topCustomers } = await supabase
      .from("venta")
      .select(`
        id_cliente,
        cliente:cliente(nombre),
        costo_total
      `)
      .order("costo_total", { ascending: false })
      .limit(5)

    res.status(200).json({
      totalSales: totalSales || 0,
      salesToday: salesToday || 0,
      totalRevenueToday,
      totalRevenueThisMonth,
      topCustomers: topCustomers || [],
    })
  } catch (error) {
    console.error("Error fetching sales statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

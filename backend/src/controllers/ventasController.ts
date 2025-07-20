import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getAllVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("venta")
      .select(`
        *,
        cliente:cliente(*),
        bandejas:bandeja(*)
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
        bandejas:bandeja(*)
      `)
      .eq("id_venta", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Venta no encontrada" })
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
    const { id_cliente, costo_total, cantidad_total, bandeja_ids } = req.body

    if (!id_cliente || !costo_total || !cantidad_total || !Array.isArray(bandeja_ids) || bandeja_ids.length === 0) {
      res.status(400).json({ error: "Faltan datos o bandejas inválidas" })
      return
    }

    // Verificar que las bandejas estén disponibles
    const { data: bandejasDisponibles, error: checkError } = await supabase
      .from("bandeja")
      .select("id_bandeja, estado")
      .in("id_bandeja", bandeja_ids)
      .eq("estado", "disponible")

    if (checkError) {
      res.status(400).json({ error: checkError.message })
      return
    }

    if (!bandejasDisponibles || bandejasDisponibles.length !== bandeja_ids.length) {
      res.status(400).json({ error: "Algunas bandejas no están disponibles" })
      return
    }

    // Crear la venta
    const { data: venta, error: ventaError } = await supabase
      .from("venta")
      .insert([
        {
          id_cliente,
          costo_total,
          cantidad_total,
          fecha_venta: new Date().toISOString().split("T")[0],
        },
      ])
      .select()
      .single()

    if (ventaError) {
      res.status(400).json({ error: ventaError.message })
      return
    }

    // Actualizar el estado de las bandejas a "vendida" y asociarlas con la venta
    const { error: updateError } = await supabase
      .from("bandeja")
      .update({
        estado: "vendida",
        id_venta: venta.id_venta,
      })
      .in("id_bandeja", bandeja_ids)

    if (updateError) {
      console.error("Error updating bandejas:", updateError)
      // Si falla la actualización de bandejas, eliminar la venta creada
      await supabase.from("venta").delete().eq("id_venta", venta.id_venta)
      res.status(400).json({ error: "Error al actualizar bandejas" })
      return
    }

    res.status(201).json({
      success: true,
      data: venta,
      message: "Venta registrada exitosamente",
    })
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
      res.status(404).json({ error: "Venta no encontrada" })
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

    // Liberar las bandejas asociadas (cambiar estado a "disponible")
    const { error: updateError } = await supabase
      .from("bandeja")
      .update({
        estado: "disponible",
        id_venta: null,
      })
      .eq("id_venta", id)

    if (updateError) {
      console.error("Error liberating bandejas:", updateError)
    }

    // Eliminar la venta
    const { error } = await supabase.from("venta").delete().eq("id_venta", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Venta eliminada exitosamente" })
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
    const { count: totalSales } = await supabase.from("venta").select("*", { count: "exact", head: true })

    const today = new Date().toISOString().split("T")[0]
    const { count: salesToday } = await supabase
      .from("venta")
      .select("*", { count: "exact", head: true })
      .eq("fecha_venta", today)

    const { data: revenueToday } = await supabase.from("venta").select("costo_total").eq("fecha_venta", today)

    const totalRevenueToday = revenueToday?.reduce((sum, sale) => sum + sale.costo_total, 0) || 0

    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: revenueThisMonth } = await supabase
      .from("venta")
      .select("costo_total")
      .gte("fecha_venta", `${currentMonth}-01`)

    const totalRevenueThisMonth = revenueThisMonth?.reduce((sum, sale) => sum + sale.costo_total, 0) || 0

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

export const getVentasByCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_cliente } = req.params
    const { data, error } = await supabase
      .from("venta")
      .select(`
        *,
        cliente:cliente(*),
        bandejas:bandeja(*)
      `)
      .eq("id_cliente", id_cliente)
      .order("fecha_venta", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching sales by client:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

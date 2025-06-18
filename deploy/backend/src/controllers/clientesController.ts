import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getAllClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from("cliente").select("*").order("nombre")

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching clients:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getClienteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("cliente")
      .select(`
        *,
        ventas:venta(*)
      `)
      .eq("id_cliente", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Client not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching client:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, direccion, telefono, tipo_cliente } = req.body

    if (!nombre) {
      res.status(400).json({ error: "nombre is required" })
      return
    }

    const { data, error } = await supabase
      .from("cliente")
      .insert([
        {
          nombre,
          direccion,
          telefono,
          tipo_cliente,
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
    console.error("Error creating client:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase.from("cliente").update(updates).eq("id_cliente", id).select().single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Client not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating client:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Check if client has sales
    const { count: salesCount } = await supabase
      .from("venta")
      .select("*", { count: "exact", head: true })
      .eq("id_cliente", id)

    if (salesCount && salesCount > 0) {
      res.status(400).json({
        error: "Cannot delete client with sales history. Consider deactivating instead.",
      })
      return
    }

    const { error } = await supabase.from("cliente").delete().eq("id_cliente", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Error deleting client:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getClienteVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("venta")
      .select(`
        *,
        bandeja:bandeja(*)
      `)
      .eq("id_cliente", id)
      .order("fecha_venta", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching client sales:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const searchClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.params
    const { data, error } = await supabase
      .from("cliente")
      .select("*")
      .or(`nombre.ilike.%${query}%, direccion.ilike.%${query}%`)
      .order("nombre")

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error searching clients:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getClientesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total clients
    const { count: totalClients } = await supabase.from("cliente").select("*", { count: "exact", head: true })

    // Clients by type
    const { data: clientsByType } = await supabase.from("cliente").select("tipo_cliente").neq("tipo_cliente", null)

    // Top clients by sales
    const { data: topClients } = await supabase
      .from("cliente")
      .select(`
        id_cliente,
        nombre,
        ventas:venta(costo_total)
      `)
      .order("nombre")

    // Calculate total sales per client
    const clientsWithSales = topClients?.map((client) => {
      const totalSales = client.ventas ? client.ventas.reduce((sum, sale) => sum + sale.costo_total, 0) : 0
      return {
        id_cliente: client.id_cliente,
        nombre: client.nombre,
        totalSales,
      }
    })

    // Sort by total sales
    clientsWithSales?.sort((a, b) => b.totalSales - a.totalSales)

    res.status(200).json({
      totalClients: totalClients || 0,
      clientsByType: clientsByType || [],
      topClients: clientsWithSales?.slice(0, 5) || [],
    })
  } catch (error) {
    console.error("Error fetching client statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import {
  createClienteSchema,
  updateClienteSchema,
  clienteIdSchema,
  searchClienteSchema,
  type CreateClienteInput,
  type UpdateClienteInput,
} from "../schemas/clienteSchema"

export const getAllClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from("cliente").select("*").order("nombre")

    if (error) {
      console.error("Error fetching clients:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching clients:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

export const getClienteById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar parámetros
    const paramValidation = clienteIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { id } = paramValidation.data

    const { data, error } = await supabase
      .from("cliente")
      .select(`
        *,
        ventas:venta(*)
      `)
      .eq("id_cliente", id)
      .single()

    if (error) {
      console.error("Error fetching client:", error)
      if (error.code === "PGRST116") {
        res.status(404).json({ error: "Cliente no encontrado" })
        return
      }
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching client:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

export const createCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar datos de entrada
    const validation = createClienteSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const clienteData: CreateClienteInput = validation.data

    // Verificar si ya existe un cliente con el mismo nombre
    const { data: existingCliente } = await supabase
      .from("cliente")
      .select("id_cliente")
      .eq("nombre", clienteData.nombre)
      .single()

    if (existingCliente) {
      res.status(409).json({
        error: "Ya existe un cliente con este nombre",
        field: "nombre",
      })
      return
    }

    // Crear el cliente
    const { data, error } = await supabase.from("cliente").insert([clienteData]).select().single()

    if (error) {
      console.error("Error creating client:", error)
      res.status(400).json({ error: error.message })
      return
    }

    console.log("Cliente creado exitosamente:", data.id_cliente)
    res.status(201).json(data)
  } catch (error) {
    console.error("Error creating client:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

export const updateCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar parámetros
    const paramValidation = clienteIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    // Validar datos de entrada
    const bodyValidation = updateClienteSchema.safeParse(req.body)
    if (!bodyValidation.success) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: bodyValidation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { id } = paramValidation.data
    const updates: UpdateClienteInput = bodyValidation.data

    // Filtrar campos vacíos y campos que no deben actualizarse
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined && value !== "" && value !== null),
    )

    if (Object.keys(filteredUpdates).length === 0) {
      res.status(400).json({ error: "No hay datos válidos para actualizar" })
      return
    }

    // Verificar si el cliente existe
    const { data: existingCliente } = await supabase
      .from("cliente")
      .select("id_cliente, nombre")
      .eq("id_cliente", id)
      .single()

    if (!existingCliente) {
      res.status(404).json({ error: "Cliente no encontrado" })
      return
    }

    // Si se está actualizando el nombre, verificar que no exista otro cliente con el mismo nombre
    if (filteredUpdates.nombre && filteredUpdates.nombre !== existingCliente.nombre) {
      const { data: duplicateCliente } = await supabase
        .from("cliente")
        .select("id_cliente")
        .eq("nombre", filteredUpdates.nombre)
        .neq("id_cliente", id)
        .single()

      if (duplicateCliente) {
        res.status(409).json({
          error: "Ya existe otro cliente con este nombre",
          field: "nombre",
        })
        return
      }
    }

    // Actualizar el cliente
    const { data, error } = await supabase
      .from("cliente")
      .update(filteredUpdates)
      .eq("id_cliente", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating client:", error)
      res.status(400).json({ error: error.message })
      return
    }

    console.log("Cliente actualizado exitosamente:", id)
    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating client:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

export const deleteCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar parámetros
    const paramValidation = clienteIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { id } = paramValidation.data

    // Verificar si el cliente tiene ventas
    const { count: salesCount } = await supabase
      .from("venta")
      .select("*", { count: "exact", head: true })
      .eq("id_cliente", id)

    if (salesCount && salesCount > 0) {
      res.status(400).json({
        error: "No se puede eliminar un cliente con historial de ventas. Considera desactivarlo en su lugar.",
      })
      return
    }

    // Eliminar el cliente
    const { error } = await supabase.from("cliente").delete().eq("id_cliente", id)

    if (error) {
      console.error("Error deleting client:", error)
      res.status(400).json({ error: error.message })
      return
    }

    console.log("Cliente eliminado exitosamente:", id)
    res.status(200).json({ message: "Cliente eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting client:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

export const getClienteVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar parámetros
    const paramValidation = clienteIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { id } = paramValidation.data

    const { data, error } = await supabase
      .from("venta")
      .select(`
        *,
        bandeja:bandeja(*)
      `)
      .eq("id_cliente", id)
      .order("fecha_venta", { ascending: false })

    if (error) {
      console.error("Error fetching client sales:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching client sales:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

export const searchClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar parámetros
    const paramValidation = searchClienteSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: paramValidation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { query } = paramValidation.data

    const { data, error } = await supabase
      .from("cliente")
      .select("*")
      .or(`nombre.ilike.%${query}%, direccion.ilike.%${query}%`)
      .order("nombre")

    if (error) {
      console.error("Error searching clients:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error searching clients:", error)
    res.status(500).json({ error: "Error interno del servidor" })
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
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

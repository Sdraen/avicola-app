import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import { createJaulaSchema, updateJaulaSchema, createServicioHigieneSchema } from "../schemas/jaulaSchema"

// Constante para el estanque por defecto
const DEFAULT_ESTANQUE_ID = 1

export const getAllJaulas = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔍 Fetching all jaulas...")

    const { data, error } = await supabase.from("jaula").select(`
        *,
        estanque:estanque(*),
        aves:ave(*)
      `)

    if (error) {
      console.error("❌ Error fetching jaulas:", error)
      res.status(400).json({ error: error.message })
      return
    }

    console.log(`✅ Found ${data?.length || 0} jaulas`)
    res.status(200).json(data)
  } catch (error) {
    console.error("💥 Unexpected error fetching cages:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getJaulaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    console.log(`🔍 Fetching jaula with ID: ${id}`)

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
      console.error("❌ Error fetching jaula:", error)
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      console.log("❌ Jaula not found")
      res.status(404).json({ error: "Cage not found" })
      return
    }

    console.log("✅ Jaula found successfully")
    res.status(200).json(data)
  } catch (error) {
    console.error("💥 Unexpected error fetching cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🆕 Creating new jaula with data:", req.body)

    // Validar con Zod schema
    const validation = createJaulaSchema.safeParse(req.body)
    if (!validation.success) {
      console.log("❌ Validation failed:", validation.error.errors)
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { codigo_jaula, descripcion } = validation.data

    // Verificar que el código de jaula sea único (siempre en estanque 1)
    // Nota: codigo_jaula ahora es string, así que comparamos como string
    const { data: existingJaula, error: checkError } = await supabase
      .from("jaula")
      .select("id_jaula")
      .eq("id_estanque", DEFAULT_ESTANQUE_ID)
      .eq("codigo_jaula", codigo_jaula)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("❌ Error checking existing jaula:", checkError)
      res.status(500).json({ error: "Error verificando código de jaula" })
      return
    }

    if (existingJaula) {
      console.log("❌ Jaula code already exists")
      res.status(400).json({ error: "Ya existe una jaula con este código" })
      return
    }

    // Crear la jaula con estanque fijo = 1
    const { data, error } = await supabase
      .from("jaula")
      .insert([
        {
          id_estanque: DEFAULT_ESTANQUE_ID,
          codigo_jaula,
          descripcion: descripcion || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Error creating jaula:", error)
      res.status(400).json({ error: error.message })
      return
    }

    console.log("✅ Jaula created successfully:", data)
    res.status(201).json(data)
  } catch (error) {
    console.error("💥 Unexpected error creating cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    console.log(`📝 Updating jaula ${id} with data:`, req.body)

    // Validar con Zod schema
    const validation = updateJaulaSchema.safeParse(req.body)
    if (!validation.success) {
      console.log("❌ Validation failed:", validation.error.errors)
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const updates = validation.data

    // Si se está actualizando el código, verificar unicidad
    if (updates.codigo_jaula) {
      const { data: existingJaula } = await supabase
        .from("jaula")
        .select("id_jaula")
        .eq("id_estanque", DEFAULT_ESTANQUE_ID)
        .eq("codigo_jaula", updates.codigo_jaula)
        .neq("id_jaula", id)
        .single()

      if (existingJaula) {
        console.log("❌ Jaula code already exists")
        res.status(400).json({ error: "Ya existe una jaula con este código" })
        return
      }
    }

    const { data, error } = await supabase.from("jaula").update(updates).eq("id_jaula", id).select().single()

    if (error) {
      console.error("❌ Error updating jaula:", error)
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      console.log("❌ Jaula not found")
      res.status(404).json({ error: "Cage not found" })
      return
    }

    console.log("✅ Jaula updated successfully:", data)
    res.status(200).json(data)
  } catch (error) {
    console.error("💥 Unexpected error updating cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    console.log(`🗑️ Deleting jaula ${id}`)

    // Check if cage has birds
    const { count: birdCount } = await supabase
      .from("ave")
      .select("*", { count: "exact", head: true })
      .eq("id_jaula", id)

    if (birdCount && birdCount > 0) {
      console.log(`❌ Cannot delete jaula with ${birdCount} birds`)
      res.status(400).json({ error: "Cannot delete cage with birds. Move birds first." })
      return
    }

    const { error } = await supabase.from("jaula").delete().eq("id_jaula", id)

    if (error) {
      console.error("❌ Error deleting jaula:", error)
      res.status(400).json({ error: error.message })
      return
    }

    console.log("✅ Jaula deleted successfully")
    res.status(200).json({ message: "Cage deleted successfully" })
  } catch (error) {
    console.error("💥 Unexpected error deleting cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getJaulasByEstanque = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_estanque } = req.params
    console.log(`🔍 Fetching jaulas for estanque: ${id_estanque}`)

    const { data, error } = await supabase
      .from("jaula")
      .select(`
        *,
        aves:ave(*)
      `)
      .eq("id_estanque", id_estanque)

    if (error) {
      console.error("❌ Error fetching jaulas by estanque:", error)
      res.status(400).json({ error: error.message })
      return
    }

    console.log(`✅ Found ${data?.length || 0} jaulas for estanque`)
    res.status(200).json(data)
  } catch (error) {
    console.error("💥 Unexpected error fetching cages by estanque:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getJaulasStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📊 Calculating jaulas statistics...")

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

    const stats = {
      totalCages: totalCages || 0,
      emptyCages,
      cagesWithBirds: totalCages ? totalCages - emptyCages : 0,
      cagesWithHygieneThisMonth: uniqueCagesWithHygiene.size,
      cageStats,
    }

    console.log("✅ Statistics calculated:", stats)
    res.status(200).json(stats)
  } catch (error) {
    console.error("💥 Unexpected error fetching cage statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const addHygieneService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    console.log(`🧽 Adding hygiene service to jaula ${id}:`, req.body)

    // Validar con Zod schema
    const validation = createServicioHigieneSchema.safeParse(req.body)
    if (!validation.success) {
      console.log("❌ Validation failed:", validation.error.errors)
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { tipo, fecha, descripcion } = validation.data

    // Check if cage exists
    const { data: cage, error: cageError } = await supabase.from("jaula").select("*").eq("id_jaula", id).single()

    if (cageError || !cage) {
      console.log("❌ Jaula not found")
      res.status(404).json({ error: "Cage not found" })
      return
    }

    const { data, error } = await supabase
      .from("servicio_higiene")
      .insert([
        {
          id_jaula: Number.parseInt(id),
          tipo,
          fecha: fecha || new Date().toISOString().split("T")[0],
          descripcion: descripcion || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Error adding hygiene service:", error)
      res.status(400).json({ error: error.message })
      return
    }

    console.log("✅ Hygiene service added successfully:", data)
    res.status(201).json(data)
  } catch (error) {
    console.error("💥 Unexpected error adding hygiene service:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

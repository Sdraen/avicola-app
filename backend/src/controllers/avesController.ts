import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import { createAveSchema, updateAveSchema, aveIdSchema, jaulaIdSchema } from "../schemas/aveSchema"
import { calcularEdad } from "../models/Ave"

// Helper function para añadir edad calculada a las aves
const addCalculatedAge = (aves: any[]) => {
  return aves.map((ave) => {
    if (ave.fecha_nacimiento) {
      const edadCalculada = calcularEdad(ave.fecha_nacimiento)
      return {
        ...ave,
        edad_calculada_dias: edadCalculada.dias,
        edad_calculada_semanas: edadCalculada.semanas,
        edad_calculada_meses: edadCalculada.meses,
        edad_calculada_anos: edadCalculada.anos,
        edad_texto: `${edadCalculada.semanas} semanas (${edadCalculada.meses} meses)`,
      }
    }
    return ave
  })
}

// Obtener todas las aves activas
export const getAllAves = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from("ave").select(`*, jaula:jaula(*)`).eq("activo", true)

    if (error) {
      console.error("Error en getAllAves:", error)
      res.status(400).json({ error: error.message })
      return
    }

    // Añadir edad calculada a cada ave
    const avesConEdad = addCalculatedAge(data || [])

    res.status(200).json(avesConEdad)
  } catch (error) {
    console.error("Error al obtener las aves:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtener ave por ID (solo si está activa)
export const getAveById = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = aveIdSchema.safeParse(req.params)
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
      .from("ave")
      .select(`*, jaula:jaula(*)`)
      .eq("id_ave", id)
      .eq("activo", true)
      .single()

    if (error) {
      console.error("Error en getAveById:", error)
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Gallina no encontrada" })
      return
    }

    // Añadir edad calculada
    const aveConEdad = addCalculatedAge([data])[0]

    res.status(200).json(aveConEdad)
  } catch (error) {
    console.error("Error obteniendo la ave:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Crear una nueva ave
export const createAve = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Datos recibidos en createAve:", req.body) // Debug log

    const validation = createAveSchema.safeParse(req.body)
    if (!validation.success) {
      console.error("Error de validación:", validation.error.errors)
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      })
      return
    }

    const { id_jaula, id_anillo, color_anillo, estado_puesta, raza, fecha_nacimiento } = validation.data

    console.log("Datos validados:", { id_jaula, id_anillo, color_anillo, estado_puesta, raza, fecha_nacimiento })

    // Verificar que la jaula existe
    const { data: jaulaExists, error: jaulaError } = await supabase
      .from("jaula")
      .select("id_jaula")
      .eq("id_jaula", id_jaula)
      .single()

    if (jaulaError || !jaulaExists) {
      console.error("Jaula no encontrada:", jaulaError)
      res.status(400).json({ error: "La jaula especificada no existe" })
      return
    }

    // Verificar que no existe un ave con el mismo id_anillo
    const { data: existingAve, error: checkError } = await supabase
      .from("ave")
      .select("id_ave")
      .eq("id_anillo", id_anillo)
      .eq("activo", true)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error verificando ave existente:", checkError)
      res.status(500).json({ error: "Error verificando datos existentes" })
      return
    }

    if (existingAve) {
      res.status(409).json({ error: "Ya existe una gallina activa con ese id_anillo" })
      return
    }

    const aveData = {
      id_jaula,
      id_anillo,
      color_anillo,
      estado_puesta,
      raza,
      fecha_nacimiento,
      fecha_registro: new Date().toISOString().split("T")[0],
      activo: true,
    }

    console.log("Insertando ave con datos:", aveData)

    const { data, error } = await supabase.from("ave").insert([aveData]).select().single()

    if (error) {
      console.error("Error insertando ave:", error)
      if (error.message.includes("duplicate key value") || error.code === "23505") {
        res.status(409).json({ error: "Ya existe una gallina con ese id_anillo" })
      } else {
        res.status(400).json({
          error: error.message,
          details: error.details || "Error desconocido al crear el ave",
        })
      }
      return
    }

    console.log("Ave creada exitosamente:", data)

    // Añadir edad calculada a la respuesta
    const aveConEdad = addCalculatedAge([data])[0]

    res.status(201).json(aveConEdad)
  } catch (error) {
    console.error("Error inesperado creando la ave:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Actualizar ave existente
export const updateAve = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = aveIdSchema.safeParse(req.params)
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

    const validation = updateAveSchema.safeParse(req.body)
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

    const { id } = paramValidation.data
    const updates = validation.data

    const forbiddenFields = ["id_ave", "fecha_registro", "jaula"]
    const cleanUpdates = { ...updates }
    for (const field of forbiddenFields) {
      delete cleanUpdates[field as keyof typeof cleanUpdates]
    }

    const { data, error } = await supabase
      .from("ave")
      .update(cleanUpdates)
      .eq("id_ave", Number(id))
      .eq("activo", true)
      .select()
      .single()

    if (error) {
      console.error("Error actualizando ave:", error)
      if (error.message.includes("duplicate key value") || error.code === "23505") {
        res.status(409).json({ error: "Ya existe otra gallina con ese id_anillo" })
      } else {
        res.status(400).json({ error: error.message })
      }
      return
    }

    if (!data) {
      res.status(404).json({ error: "Gallina no encontrada o inactiva" })
      return
    }

    // Añadir edad calculada a la respuesta
    const aveConEdad = addCalculatedAge([data])[0]

    res.status(200).json(aveConEdad)
  } catch (error) {
    console.error("Error inesperado al actualizar ave:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Eliminar ave físicamente (opcional, normalmente no se usará con soft delete)
export const deleteAve = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = aveIdSchema.safeParse(req.params)
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

    const { error } = await supabase.from("ave").delete().eq("id_ave", id)

    if (error) {
      console.error("Error eliminando ave:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Gallina eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting bird:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtener aves por jaula (solo activas)
export const getAvesByJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = jaulaIdSchema.safeParse(req.params)
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

    const { id_jaula } = paramValidation.data

    const { data, error } = await supabase.from("ave").select("*").eq("id_jaula", id_jaula).eq("activo", true)

    if (error) {
      console.error("Error obteniendo aves por jaula:", error)
      res.status(400).json({ error: error.message })
      return
    }

    // Añadir edad calculada a cada ave
    const avesConEdad = addCalculatedAge(data || [])

    res.status(200).json(avesConEdad)
  } catch (error) {
    console.error("Error fetching birds by cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtener estadísticas (considera solo aves activas)
export const getAvesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { count: totalBirds } = await supabase
      .from("ave")
      .select("*", { count: "exact", head: true })
      .eq("activo", true)

    const { data: layingStats } = await supabase
      .from("ave")
      .select("estado_puesta")
      .eq("activo", true)
      .neq("estado_puesta", null)

    const { data: breedStats } = await supabase.from("ave").select("raza").eq("activo", true).neq("raza", null)

    // Obtener estadísticas de edad
    const { data: ageStats } = await supabase
      .from("ave")
      .select("fecha_nacimiento")
      .eq("activo", true)
      .not("fecha_nacimiento", "is", null)

    const currentMonth = new Date().toISOString().slice(0, 7)
    const { count: deceasedThisMonth } = await supabase
      .from("aves_fallecidas")
      .select("*", { count: "exact", head: true })
      .gte("fecha", `${currentMonth}-01`)

    // Calcular estadísticas de edad
    const edadPromedio =
      ageStats && ageStats.length > 0
        ? ageStats.reduce((acc, ave) => {
            const edad = calcularEdad(ave.fecha_nacimiento)
            return acc + edad.semanas
          }, 0) / ageStats.length
        : 0

    res.status(200).json({
      totalBirds: totalBirds || 0,
      deceasedThisMonth: deceasedThisMonth || 0,
      layingStats: layingStats || [],
      breedStats: breedStats || [],
      edadPromedio: Math.round(edadPromedio),
      avesConFechaNacimiento: ageStats?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching bird statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Reactivar un ave previamente desactivada (por fallecimiento)
export const reactivarAve = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = aveIdSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({
        error: "Parámetro inválido",
        details: paramValidation.error.errors,
      })
      return
    }

    const { id } = paramValidation.data

    const { data, error } = await supabase.from("ave").update({ activo: true }).eq("id_ave", id).select().single()

    if (error) {
      console.error("Error reactivando ave:", error)
      res.status(400).json({ error: error.message })
      return
    }

    // Añadir edad calculada a la respuesta
    const aveConEdad = addCalculatedAge([data])[0]

    res.status(200).json(aveConEdad)
  } catch (error) {
    console.error("Error al reactivar ave:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

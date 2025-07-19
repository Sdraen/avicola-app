import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import {
  createAveClinicaSchema,
  updateAveClinicaSchema,
  createAveFallecidaSchema,
  aveIdParamSchema,
} from "../schemas/aveClinicaSchema"

// Obtener historial clínico de un ave
export const getHistorialClinico = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = aveIdParamSchema.safeParse(req.params)
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

    // Obtener registros clínicos
    const { data: historialClinico, error: clinicaError } = await supabase
      .from("ave_clinica")
      .select(`
        *,
        ave:ave(id_ave, id_anillo, raza),
        jaula:jaula(id_jaula, descripcion, codigo_jaula)
      `)
      .eq("id_ave", id)
      .order("fecha_inicio", { ascending: false })

    if (clinicaError) {
      console.error("Error fetching historial clínico:", clinicaError)
      res.status(400).json({ error: clinicaError.message })
      return
    }

    // Verificar si el ave está fallecida
    const { data: aveFallecida, error: fallecidaError } = await supabase
      .from("aves_fallecidas")
      .select("*")
      .eq("id_ave", id)
      .single()

    if (fallecidaError && fallecidaError.code !== "PGRST116") {
      console.error("Error checking ave fallecida:", fallecidaError)
      res.status(400).json({ error: fallecidaError.message })
      return
    }

    res.status(200).json({
      historial_clinico: historialClinico || [],
      ave_fallecida: aveFallecida || null,
      esta_fallecida: !!aveFallecida,
    })
  } catch (error) {
    console.error("Error getting historial clínico:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Crear nuevo registro clínico
export const createRegistroClinico = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createAveClinicaSchema.safeParse(req.body)
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

    const { id_ave, id_jaula, fecha_inicio, fecha_fin, descripcion } = validation.data

    // Verificar que el ave no esté fallecida
    const { data: aveFallecida, error: fallecidaError } = await supabase
      .from("aves_fallecidas")
      .select("*")
      .eq("id_ave", id_ave)
      .single()

    if (fallecidaError && fallecidaError.code !== "PGRST116") {
      console.error("Error checking ave fallecida:", fallecidaError)
      res.status(400).json({ error: fallecidaError.message })
      return
    }

    if (aveFallecida) {
      res.status(400).json({
        error: "No se puede registrar un tratamiento para un ave fallecida",
        details: `El ave falleció el ${aveFallecida.fecha} por: ${aveFallecida.motivo}`,
      })
      return
    }

    // Verificar que el ave existe
    const { data: ave, error: aveError } = await supabase
      .from("ave")
      .select("id_ave, id_anillo, raza")
      .eq("id_ave", id_ave)
      .single()

    if (aveError) {
      console.error("Error fetching ave:", aveError)
      res.status(400).json({ error: "Ave no encontrada" })
      return
    }

    // Verificar que la jaula existe
    const { data: jaula, error: jaulaError } = await supabase
      .from("jaula")
      .select("id_jaula, descripcion")
      .eq("id_jaula", id_jaula)
      .single()

    if (jaulaError) {
      console.error("Error fetching jaula:", jaulaError)
      res.status(400).json({ error: "Jaula no encontrada" })
      return
    }

    // Crear el registro clínico
    const { data, error } = await supabase
      .from("ave_clinica")
      .insert([
        {
          id_ave,
          id_jaula,
          fecha_inicio,
          fecha_fin: fecha_fin || null,
          descripcion,
        },
      ])
      .select(`
        *,
        ave:ave(id_ave, id_anillo, raza),
        jaula:jaula(id_jaula, descripcion, codigo_jaula)
      `)
      .single()

    if (error) {
      console.error("Error creating registro clínico:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Error creating registro clínico:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Actualizar registro clínico
export const updateRegistroClinico = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = aveIdParamSchema.safeParse(req.params)
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

    const validation = updateAveClinicaSchema.safeParse(req.body)
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

    const { data, error } = await supabase
      .from("ave_clinica")
      .update(updates)
      .eq("id_ave", id)
      .select(`
        *,
        ave:ave(id_ave, id_anillo, raza),
        jaula:jaula(id_jaula, descripcion, codigo_jaula)
      `)
      .single()

    if (error) {
      console.error("Error updating registro clínico:", error)
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Registro clínico no encontrado" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating registro clínico:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Registrar fallecimiento de ave
export const registrarFallecimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createAveFallecidaSchema.safeParse(req.body)
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

    const { id_ave, fecha, motivo } = validation.data

    // Verificar que el ave existe
    const { data: ave, error: aveError } = await supabase
      .from("ave")
      .select("id_ave, id_anillo, raza")
      .eq("id_ave", id_ave)
      .single()

    if (aveError) {
      console.error("Error fetching ave:", aveError)
      res.status(400).json({ error: "Ave no encontrada" })
      return
    }

    // Verificar que el ave no esté ya registrada como fallecida
    const { data: yaFallecida, error: fallecidaError } = await supabase
      .from("aves_fallecidas")
      .select("*")
      .eq("id_ave", id_ave)
      .single()

    if (fallecidaError && fallecidaError.code !== "PGRST116") {
      console.error("Error checking ave fallecida:", fallecidaError)
      res.status(400).json({ error: fallecidaError.message })
      return
    }

    if (yaFallecida) {
      res.status(400).json({
        error: "El ave ya está registrada como fallecida",
        details: `Fecha de fallecimiento: ${yaFallecida.fecha}`,
      })
      return
    }

    // Registrar el fallecimiento
    const { data, error } = await supabase
      .from("aves_fallecidas")
      .insert([
        {
          id_ave,
          fecha,
          motivo,
        },
      ])
      .select("*")
      .single()

    if (error) {
      console.error("Error registering fallecimiento:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Error registering fallecimiento:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtener todas las aves fallecidas
export const getAvesFallecidas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("aves_fallecidas")
      .select(`
        *,
        ave:ave(id_ave, id_anillo, raza, color_anillo)
      `)
      .order("fecha", { ascending: false })

    if (error) {
      console.error("Error fetching aves fallecidas:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error getting aves fallecidas:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Eliminar registro de fallecimiento (en caso de error)
export const eliminarFallecimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = aveIdParamSchema.safeParse(req.params)
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

    const { error } = await supabase.from("aves_fallecidas").delete().eq("id_ave", id)

    if (error) {
      console.error("Error deleting fallecimiento:", error)
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Registro de fallecimiento eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting fallecimiento:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

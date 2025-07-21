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
      res.status(400).json({ error: "Parámetros inválidos", details: paramValidation.error.errors })
      return
    }

    const { id } = paramValidation.data

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
      res.status(400).json({ error: clinicaError.message })
      return
    }

    const { data: aveFallecida, error: fallecidaError } = await supabase
      .from("aves_fallecidas")
      .select("*")
      .eq("id_ave", id)
      .single()

    if (fallecidaError && fallecidaError.code !== "PGRST116") {
      res.status(400).json({ error: fallecidaError.message })
      return
    }

    res.status(200).json({
      historial_clinico: historialClinico || [],
      ave_fallecida: aveFallecida || null,
      esta_fallecida: !!aveFallecida,
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}

// Crear registro clínico
export const createRegistroClinico = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createAveClinicaSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({ error: "Datos de entrada inválidos", details: validation.error.errors })
      return
    }

    const { id_ave, id_jaula, fecha_inicio, fecha_fin, descripcion } = validation.data

    const { data: aveFallecida } = await supabase
      .from("aves_fallecidas")
      .select("*")
      .eq("id_ave", id_ave)
      .single()

    if (aveFallecida) {
      res.status(400).json({
        error: "No se puede registrar un tratamiento para un ave fallecida",
        details: `El ave falleció el ${aveFallecida.fecha} por: ${aveFallecida.motivo}`,
      })
      return
    }

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
      res.status(400).json({ error: error.message })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}

// Actualizar registro clínico
export const updateRegistroClinico = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = aveIdParamSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({ error: "Parámetros inválidos", details: paramValidation.error.errors })
      return
    }

    const validation = updateAveClinicaSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({ error: "Datos de entrada inválidos", details: validation.error.errors })
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
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}

// Eliminar registro clínico
export const eliminarRegistroClinico = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = aveIdParamSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({ error: "Parámetros inválidos", details: paramValidation.error.errors })
      return
    }

    const { id } = paramValidation.data

    const { error } = await supabase.from("ave_clinica").delete().eq("id_ave", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Registro clínico eliminado exitosamente" })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}

// Registrar fallecimiento
export const registrarFallecimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createAveFallecidaSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({ error: "Datos de entrada inválidos", details: validation.error.errors })
      return
    }

    const { id_ave, fecha, motivo } = validation.data

    const { data: yaFallecida } = await supabase
      .from("aves_fallecidas")
      .select("*")
      .eq("id_ave", id_ave)
      .single()

    if (yaFallecida) {
      res.status(400).json({
        error: "El ave ya está registrada como fallecida",
        details: `Fecha de fallecimiento: ${yaFallecida.fecha}`,
      })
      return
    }

    const { error: insertError } = await supabase
      .from("aves_fallecidas")
      .insert([{ id_ave, fecha, motivo }])

    if (insertError) {
      res.status(400).json({ error: insertError.message })
      return
    }

    const { error: updateError } = await supabase
      .from("ave")
      .update({ activo: false })
      .eq("id_ave", id_ave)

    if (updateError) {
      res.status(400).json({ error: updateError.message })
      return
    }

    res.status(201).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtener aves fallecidas
export const getAvesFallecidas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("aves_fallecidas")
      .select(`*, ave:ave(id_ave, id_anillo, raza, color_anillo)`)
      .order("fecha", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}

// Eliminar registro de fallecimiento y reactivar ave
export const eliminarFallecimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramValidation = aveIdParamSchema.safeParse(req.params)
    if (!paramValidation.success) {
      res.status(400).json({ error: "Parámetros inválidos", details: paramValidation.error.errors })
      return
    }

    const { id } = paramValidation.data

    const { error: deleteError } = await supabase.from("aves_fallecidas").delete().eq("id_ave", id)

    if (deleteError) {
      res.status(400).json({ error: deleteError.message })
      return
    }

    const { error: reactivarError } = await supabase.from("ave").update({ activo: true }).eq("id_ave", id)

    if (reactivarError) {
      res.status(400).json({ error: reactivarError.message })
      return
    }

    res.status(200).json({
      success: true,
      message: "Registro de fallecimiento eliminado y ave reactivada",
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}

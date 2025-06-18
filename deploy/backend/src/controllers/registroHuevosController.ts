import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

// ✅ CRUD para registro diario de huevos
export const getAllRegistrosHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("registro_huevos_diario")
      .select("*")
      .order("fecha_recoleccion", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching egg records:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createRegistroHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fecha_recoleccion,
      cantidad_total,
      huevos_cafe_chico = 0,
      huevos_cafe_mediano = 0,
      huevos_cafe_grande = 0,
      huevos_cafe_jumbo = 0,
      huevos_blanco_chico = 0,
      huevos_blanco_mediano = 0,
      huevos_blanco_grande = 0,
      huevos_blanco_jumbo = 0,
      observaciones,
    } = req.body

    if (!fecha_recoleccion || !cantidad_total) {
      res.status(400).json({ error: "fecha_recoleccion and cantidad_total are required" })
      return
    }

    // ✅ Validar máximo 1000 huevos por día
    if (cantidad_total > 1000) {
      res.status(400).json({ error: "Maximum 1000 eggs per day allowed" })
      return
    }

    // ✅ Validar que la suma no exceda el total
    const totalClasificado =
      huevos_cafe_chico +
      huevos_cafe_mediano +
      huevos_cafe_grande +
      huevos_cafe_jumbo +
      huevos_blanco_chico +
      huevos_blanco_mediano +
      huevos_blanco_grande +
      huevos_blanco_jumbo

    if (totalClasificado > cantidad_total) {
      res.status(400).json({
        error: `Classified eggs (${totalClasificado}) cannot exceed total (${cantidad_total})`,
      })
      return
    }

    // ✅ Verificar que no existe registro para esa fecha
    const { data: existing } = await supabase
      .from("registro_huevos_diario")
      .select("id")
      .eq("fecha_recoleccion", fecha_recoleccion)
      .single()

    if (existing) {
      res.status(400).json({ error: "Record already exists for this date" })
      return
    }

    const { data, error } = await supabase
      .from("registro_huevos_diario")
      .insert([
        {
          fecha_recoleccion,
          cantidad_total,
          huevos_cafe_chico,
          huevos_cafe_mediano,
          huevos_cafe_grande,
          huevos_cafe_jumbo,
          huevos_blanco_chico,
          huevos_blanco_mediano,
          huevos_blanco_grande,
          huevos_blanco_jumbo,
          observaciones,
          registrado_por: 1, // TODO: obtener del token
          fecha_registro: new Date().toISOString(),
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
    console.error("Error creating egg record:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getRegistroHuevosByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.params
    const { data, error } = await supabase
      .from("registro_huevos_diario")
      .select("*")
      .gte("fecha_recoleccion", start)
      .lte("fecha_recoleccion", end)
      .order("fecha_recoleccion", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching egg records by date range:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getEstadisticasHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total huevos este mes
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: huevosEsteMes } = await supabase
      .from("registro_huevos_diario")
      .select("cantidad_total")
      .gte("fecha_recoleccion", `${currentMonth}-01`)

    const totalEsteMes = huevosEsteMes?.reduce((sum, record) => sum + record.cantidad_total, 0) || 0

    // Promedio diario
    const diasConRegistro = huevosEsteMes?.length || 1
    const promedioDiario = Math.round(totalEsteMes / diasConRegistro)

    // Distribución por tipo y tamaño
    const { data: distribucion } = await supabase
      .from("registro_huevos_diario")
      .select(`
        huevos_cafe_chico, huevos_cafe_mediano, huevos_cafe_grande, huevos_cafe_jumbo,
        huevos_blanco_chico, huevos_blanco_mediano, huevos_blanco_grande, huevos_blanco_jumbo
      `)
      .gte("fecha_recoleccion", `${currentMonth}-01`)

    res.status(200).json({
      totalEsteMes,
      promedioDiario,
      diasConRegistro,
      distribucion: distribucion || [],
    })
  } catch (error) {
    console.error("Error fetching egg statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

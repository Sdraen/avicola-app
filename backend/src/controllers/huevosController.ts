import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

// Obtener todos los huevos
export const getAllHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🥚 getAllHuevos called")

    // Simplificar la consulta primero para identificar el problema
    const { data, error } = await supabase.from("huevo").select("*").order("fecha_recoleccion", { ascending: false })

    if (error) {
      console.error("❌ Supabase error in getAllHuevos:", error)
      res.status(500).json({ error: "Error al obtener los huevos" })
      return
    }

    console.log(`✅ Found ${data?.length || 0} huevos`)
    console.log("📋 Sample data:", JSON.stringify(data?.[0], null, 2))

    res.status(200).json({ success: true, data, message: "Huevos obtenidos exitosamente" })
  } catch (error) {
    console.error("❌ Error in getAllHuevos:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener huevo por ID
export const getHuevoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    console.log(`🥚 getHuevoById called with ID: ${id}`)

    const { data, error } = await supabase.from("huevo").select("*").eq("id_huevo", id).single()

    if (error) {
      console.error("❌ Supabase error in getHuevoById:", error)
      res.status(500).json({ error: "Error al obtener el huevo" })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Huevo no encontrado" })
      return
    }

    console.log(`✅ Found huevo: ${data.id_huevo}`)
    res.status(200).json({ success: true, data, message: "Huevo obtenido exitosamente" })
  } catch (error) {
    console.error("❌ Error in getHuevoById:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Crear nuevo huevo
export const createHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🥚 createHuevo called with data:", JSON.stringify(req.body, null, 2))

    const {
      id_jaula,
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
      observaciones = "",
    } = req.body

    // Validaciones básicas
    if (!id_jaula || !fecha_recoleccion || cantidad_total === undefined) {
      console.log("❌ Missing required fields")
      res.status(400).json({ error: "Faltan campos requeridos: id_jaula, fecha_recoleccion, cantidad_total" })
      return
    }

    // Verificar que la jaula existe
    console.log(`🔍 Checking if jaula ${id_jaula} exists...`)
    const { data: jaulaExists, error: jaulaError } = await supabase
      .from("jaula")
      .select("id_jaula")
      .eq("id_jaula", id_jaula)
      .single()

    if (jaulaError || !jaulaExists) {
      console.log(`❌ Jaula ${id_jaula} not found:`, jaulaError)
      res.status(400).json({ error: "La jaula especificada no existe" })
      return
    }

    console.log(`✅ Jaula ${id_jaula} exists`)

    // Crear el registro de huevos
    const huevoData = {
      id_jaula: Number.parseInt(id_jaula),
      fecha_recoleccion,
      cantidad_total: Number.parseInt(cantidad_total),
      huevos_cafe_chico: Number.parseInt(huevos_cafe_chico),
      huevos_cafe_mediano: Number.parseInt(huevos_cafe_mediano),
      huevos_cafe_grande: Number.parseInt(huevos_cafe_grande),
      huevos_cafe_jumbo: Number.parseInt(huevos_cafe_jumbo),
      huevos_blanco_chico: Number.parseInt(huevos_blanco_chico),
      huevos_blanco_mediano: Number.parseInt(huevos_blanco_mediano),
      huevos_blanco_grande: Number.parseInt(huevos_blanco_grande),
      huevos_blanco_jumbo: Number.parseInt(huevos_blanco_jumbo),
      observaciones: observaciones || null,
      registrado_por: 1, // TODO: get from auth context
      fecha_registro: new Date().toISOString(),
    }

    console.log("🥚 Inserting huevo data:", JSON.stringify(huevoData, null, 2))

    const { data, error } = await supabase.from("huevo").insert([huevoData]).select("*").single()

    if (error) {
      console.error("❌ Supabase error creating huevo:", error)
      res.status(500).json({ error: `Error al crear el registro de huevos: ${error.message}` })
      return
    }

    console.log("✅ Huevo created successfully:", JSON.stringify(data, null, 2))
    res.status(201).json({ success: true, data, message: "Registro de huevos creado exitosamente" })
  } catch (error) {
    console.error("❌ Error in createHuevo:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Crear múltiples huevos (bulk)
export const createBulkHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { records } = req.body

    if (!records || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({ error: "Se requiere un array de registros" })
      return
    }

    const { data, error } = await supabase.from("huevo").insert(records).select()

    if (error) {
      console.error("Error creating bulk huevos:", error)
      res.status(500).json({ error: "Error al crear los registros de huevos" })
      return
    }

    res.status(201).json({
      success: true,
      data,
      message: `${data.length} registros de huevos creados exitosamente`,
    })
  } catch (error) {
    console.error("Error in createBulkHuevos:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Actualizar huevo
export const updateHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Verificar que el huevo existe
    const { data: existingHuevo, error: fetchError } = await supabase
      .from("huevo")
      .select("id_huevo")
      .eq("id_huevo", id)
      .single()

    if (fetchError || !existingHuevo) {
      res.status(404).json({ error: "Huevo no encontrado" })
      return
    }

    // Si se está actualizando la jaula, verificar que existe
    if (updateData.id_jaula) {
      const { data: jaulaExists, error: jaulaError } = await supabase
        .from("jaula")
        .select("id_jaula")
        .eq("id_jaula", updateData.id_jaula)
        .single()

      if (jaulaError || !jaulaExists) {
        res.status(400).json({ error: "La jaula especificada no existe" })
        return
      }
    }

    const { data, error } = await supabase.from("huevo").update(updateData).eq("id_huevo", id).select("*").single()

    if (error) {
      console.error("Error updating huevo:", error)
      res.status(500).json({ error: "Error al actualizar el huevo" })
      return
    }

    res.status(200).json({ success: true, data, message: "Huevo actualizado exitosamente" })
  } catch (error) {
    console.error("Error in updateHuevo:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Eliminar huevo
export const deleteHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Verificar que el huevo existe
    const { data: existingHuevo, error: fetchError } = await supabase
      .from("huevo")
      .select("id_huevo")
      .eq("id_huevo", id)
      .single()

    if (fetchError || !existingHuevo) {
      res.status(404).json({ error: "Huevo no encontrado" })
      return
    }

    const { error } = await supabase.from("huevo").delete().eq("id_huevo", id)

    if (error) {
      console.error("Error deleting huevo:", error)
      res.status(500).json({ error: "Error al eliminar el huevo" })
      return
    }

    res.status(200).json({ success: true, message: "Huevo eliminado exitosamente" })
  } catch (error) {
    console.error("Error in deleteHuevo:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener huevos por rango de fechas
export const getHuevosByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.params

    const { data, error } = await supabase
      .from("huevo")
      .select("*")
      .gte("fecha_recoleccion", start)
      .lte("fecha_recoleccion", end)
      .order("fecha_recoleccion", { ascending: false })

    if (error) {
      console.error("Error fetching huevos by date range:", error)
      res.status(500).json({ error: "Error al obtener los huevos por fecha" })
      return
    }

    res.status(200).json({ success: true, data, message: "Huevos obtenidos exitosamente" })
  } catch (error) {
    console.error("Error in getHuevosByDateRange:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener huevos por jaula
export const getHuevosByJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_jaula } = req.params

    const { data, error } = await supabase
      .from("huevo")
      .select("*")
      .eq("id_jaula", id_jaula)
      .order("fecha_recoleccion", { ascending: false })

    if (error) {
      console.error("Error fetching huevos by jaula:", error)
      res.status(500).json({ error: "Error al obtener los huevos por jaula" })
      return
    }

    res.status(200).json({ success: true, data, message: "Huevos obtenidos exitosamente" })
  } catch (error) {
    console.error("Error in getHuevosByJaula:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener estadísticas de huevos - CORREGIDA
export const getHuevosStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📊 getHuevosStats called")

    const { data: allHuevos, error: totalError } = await supabase.from("huevo").select("*")

    if (totalError) {
      console.error("❌ Error fetching total huevos:", totalError)
      res.status(500).json({ error: "Error al obtener estadísticas" })
      return
    }

    console.log(`📊 Total huevos records found: ${allHuevos?.length || 0}`)

    // Calcular totales
    const totalEggs = allHuevos?.length || 0
    const totalEggsCollected = allHuevos?.reduce((sum, record) => sum + (record.cantidad_total || 0), 0) || 0

    // Huevos de hoy
    const today = new Date().toISOString().split("T")[0]
    const todayEggs = allHuevos?.filter((record) => record.fecha_recoleccion === today) || []
    const totalEggsToday = todayEggs.reduce((sum, record) => sum + (record.cantidad_total || 0), 0)

    // Huevos de este mes
    const currentMonth = new Date().toISOString().slice(0, 7)
    const thisMonthEggs = allHuevos?.filter((record) => record.fecha_recoleccion?.startsWith(currentMonth)) || []
    const totalEggsThisMonth = thisMonthEggs.reduce((sum, record) => sum + (record.cantidad_total || 0), 0)

    console.log(`📊 Stats calculated:`)
    console.log(`   - Total records: ${totalEggs}`)
    console.log(`   - Total eggs collected: ${totalEggsCollected}`)
    console.log(`   - Today's eggs: ${totalEggsToday}`)
    console.log(`   - This month's eggs: ${totalEggsThisMonth}`)

    const stats = {
      totalEggs: totalEggsCollected,
      totalEggsToday: totalEggsToday,
      totalEggsThisMonth: totalEggsThisMonth,
      totalRecords: totalEggs,
    }

    // ✅ SOLUCIÓN: Asegurar formato consistente
    res.status(200).json({
      success: true,
      data: stats,
      message: "Estadísticas obtenidas exitosamente",
    })
  } catch (error) {
    console.error("❌ Error in getHuevosStats:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

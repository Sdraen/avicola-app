import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

// ✅ ACTUALIZAR controlador para nueva estructura con jaulas
export const getAllHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("huevo")
      .select(`
        *,
        jaula:jaula(
          id_jaula,
          descripcion,
          estanque:estanque(id_estanque)
        )
      `)
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

export const getHuevoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("huevo")
      .select(`
        *,
        jaula:jaula(
          id_jaula,
          descripcion,
          estanque:estanque(id_estanque)
        )
      `)
      .eq("id_huevo", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Egg record not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching egg record:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id_jaula, // ✅ Cambiado de id_ave a id_jaula
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

    if (!id_jaula || !fecha_recoleccion || !cantidad_total) {
      res.status(400).json({ error: "id_jaula, fecha_recoleccion and cantidad_total are required" })
      return
    }

    // ✅ Validar máximo 500 huevos por jaula por día
    if (cantidad_total > 500) {
      res.status(400).json({ error: "Maximum 500 eggs per cage per day allowed" })
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

    // ✅ Verificar que no existe registro para esa jaula en esa fecha
    const { data: existing } = await supabase
      .from("huevo")
      .select("id_huevo")
      .eq("id_jaula", id_jaula)
      .eq("fecha_recoleccion", fecha_recoleccion)
      .single()

    if (existing) {
      res.status(400).json({ error: "Record already exists for this cage on this date" })
      return
    }

    const { data, error } = await supabase
      .from("huevo")
      .insert([
        {
          id_jaula,
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
          registrado_por: 1, // TODO: obtener del token de auth
        },
      ])
      .select(`
        *,
        jaula:jaula(
          id_jaula,
          descripcion,
          estanque:estanque(id_estanque)
        )
      `)
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

export const updateHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    // ✅ Validar suma si se están actualizando cantidades
    if (updates.cantidad_total) {
      const totalClasificado =
        (updates.huevos_cafe_chico || 0) +
        (updates.huevos_cafe_mediano || 0) +
        (updates.huevos_cafe_grande || 0) +
        (updates.huevos_cafe_jumbo || 0) +
        (updates.huevos_blanco_chico || 0) +
        (updates.huevos_blanco_mediano || 0) +
        (updates.huevos_blanco_grande || 0) +
        (updates.huevos_blanco_jumbo || 0)

      if (totalClasificado > updates.cantidad_total) {
        res.status(400).json({
          error: `Classified eggs (${totalClasificado}) cannot exceed total (${updates.cantidad_total})`,
        })
        return
      }
    }

    const { data, error } = await supabase
      .from("huevo")
      .update(updates)
      .eq("id_huevo", id)
      .select(`
        *,
        jaula:jaula(
          id_jaula,
          descripcion,
          estanque:estanque(id_estanque)
        )
      `)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Egg record not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating egg record:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const { error } = await supabase.from("huevo").delete().eq("id_huevo", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Egg record deleted successfully" })
  } catch (error) {
    console.error("Error deleting egg record:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getHuevosByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.params
    const { data, error } = await supabase
      .from("huevo")
      .select(`
        *,
        jaula:jaula(
          id_jaula,
          descripcion,
          estanque:estanque(id_estanque)
        )
      `)
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

// ✅ NUEVO: Obtener huevos por jaula
export const getHuevosByJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_jaula } = req.params
    const { data, error } = await supabase
      .from("huevo")
      .select(`
        *,
        jaula:jaula(
          id_jaula,
          descripcion,
          estanque:estanque(id_estanque)
        )
      `)
      .eq("id_jaula", id_jaula)
      .order("fecha_recoleccion", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching egg records by cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getHuevosStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total huevos este mes
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: huevosEsteMes } = await supabase
      .from("huevo")
      .select(`
        *,
        jaula:jaula(descripcion)
      `)
      .gte("fecha_recoleccion", `${currentMonth}-01`)

    const totalEsteMes = huevosEsteMes?.reduce((sum, record) => sum + record.cantidad_total, 0) || 0

    // Huevos hoy
    const today = new Date().toISOString().split("T")[0]
    const { data: huevosHoy } = await supabase
      .from("huevo")
      .select("cantidad_total, jaula:jaula(descripcion)")
      .eq("fecha_recoleccion", today)

    const totalHoy = huevosHoy?.reduce((sum, record) => sum + record.cantidad_total, 0) || 0

    // Promedio diario este mes
    const diasConRegistro = new Set(huevosEsteMes?.map((record) => record.fecha_recoleccion)).size || 1
    const promedioDiario = Math.round(totalEsteMes / diasConRegistro)

    // ✅ Jaulas productivas (que han registrado huevos este mes)
    const jaulasProductivas = new Set(huevosEsteMes?.map((record) => record.id_jaula)).size

    // ✅ Mejor jaula del mes
    const produccionPorJaula = huevosEsteMes?.reduce((acc, record) => {
      const jaulaId = record.id_jaula
      if (!acc[jaulaId]) {
        acc[jaulaId] = {
          id_jaula: jaulaId,
          descripcion: record.jaula?.descripcion || `Jaula ${jaulaId}`,
          produccion: 0,
        }
      }
      acc[jaulaId].produccion += record.cantidad_total
      return acc
    }, {} as any)

    const mejorJaula = Object.values(produccionPorJaula || {}).reduce(
      (best: any, current: any) => (current.produccion > best.produccion ? current : best),
      { id_jaula: 0, descripcion: "N/A", produccion: 0 },
    )

    // Distribución por tipo y tamaño este mes
    const distribucionTipo = huevosEsteMes?.reduce(
      (acc, record) => {
        acc.cafe +=
          record.huevos_cafe_chico + record.huevos_cafe_mediano + record.huevos_cafe_grande + record.huevos_cafe_jumbo
        acc.blanco +=
          record.huevos_blanco_chico +
          record.huevos_blanco_mediano +
          record.huevos_blanco_grande +
          record.huevos_blanco_jumbo
        return acc
      },
      { cafe: 0, blanco: 0 },
    ) || { cafe: 0, blanco: 0 }

    const distribucionTamano = huevosEsteMes?.reduce(
      (acc, record) => {
        acc.chico += record.huevos_cafe_chico + record.huevos_blanco_chico
        acc.mediano += record.huevos_cafe_mediano + record.huevos_blanco_mediano
        acc.grande += record.huevos_cafe_grande + record.huevos_blanco_grande
        acc.jumbo += record.huevos_cafe_jumbo + record.huevos_blanco_jumbo
        return acc
      },
      { chico: 0, mediano: 0, grande: 0, jumbo: 0 },
    ) || { chico: 0, mediano: 0, grande: 0, jumbo: 0 }

    res.status(200).json({
      totalHoy,
      totalEsteMes,
      promedioDiario,
      diasConRegistro,
      jaulasProductivas,
      mejorJaula,
      distribucionTipo,
      distribucionTamano,
    })
  } catch (error) {
    console.error("Error fetching egg statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// ✅ NUEVO: Crear registro masivo para múltiples jaulas
export const createBulkHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_recoleccion, registros } = req.body

    if (!fecha_recoleccion || !registros || !Array.isArray(registros)) {
      res.status(400).json({ error: "fecha_recoleccion and registros array are required" })
      return
    }

    // Validar cada registro
    for (const registro of registros) {
      if (!registro.id_jaula || !registro.cantidad_total) {
        res.status(400).json({ error: "Each record must have id_jaula and cantidad_total" })
        return
      }
    }

    // Preparar datos para inserción
    const huevosData = registros.map((registro: any) => ({
      ...registro,
      fecha_recoleccion,
      registrado_por: 1, // TODO: obtener del token
    }))

    const { data, error } = await supabase
      .from("huevo")
      .insert(huevosData)
      .select(`
        *,
        jaula:jaula(
          id_jaula,
          descripcion,
          estanque:estanque(id_estanque)
        )
      `)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Error creating bulk egg records:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

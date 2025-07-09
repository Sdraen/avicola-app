import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

// Función auxiliar: cantidad mínima según tamaño
const getCantidadMinima = (tamaño: string): number => {
  return tamaño === "jumbo" ? 24 : 30
}

// Función auxiliar: verificar huevos ya asignados
const verificarHuevosAsignados = async (id_huevos: number[]) => {
  return await supabase.from("huevo_bandeja").select("id_huevo").in("id_huevo", id_huevos)
}

// Obtener huevos disponibles por tipo y tamaño
export const obtenerHuevosDisponibles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo, tamaño } = req.params

    if (!tipo || !tamaño) {
      res.status(400).json({ error: "Tipo y tamaño son requeridos" })
      return
    }

    console.log(`🔍 Buscando huevos disponibles: ${tipo} ${tamaño}`)

    // Obtener todos los huevos con información de jaula
    const { data: huevos, error: huevosError } = await supabase
      .from("huevo")
      .select(`
        id_huevo,
        id_jaula,
        fecha_recoleccion,
        huevos_cafe_chico,
        huevos_cafe_mediano,
        huevos_cafe_grande,
        huevos_cafe_jumbo,
        huevos_blanco_chico,
        huevos_blanco_mediano,
        huevos_blanco_grande,
        huevos_blanco_jumbo,
        jaula:id_jaula (
          id_jaula,
          descripcion
        )
      `)
      .order("fecha_recoleccion", { ascending: false })

    if (huevosError) {
      console.error("❌ Error fetching huevos:", huevosError)
      res.status(500).json({ error: "Error al obtener huevos" })
      return
    }

    // Obtener huevos ya asignados a bandejas
    const { data: huevosAsignados, error: asignacionError } = await supabase.from("huevo_bandeja").select("id_huevo")

    if (asignacionError) {
      console.error("❌ Error fetching assigned eggs:", asignacionError)
      res.status(500).json({ error: "Error al verificar huevos asignados" })
      return
    }

    const idsAsignados = huevosAsignados?.map((h) => h.id_huevo) || []

    // Filtrar huevos disponibles del tipo y tamaño solicitado
    const huevosDisponibles =
      huevos
        ?.filter((huevo) => {
          // No incluir huevos ya asignados
          if (idsAsignados.includes(huevo.id_huevo)) return false

          // Obtener la cantidad del tipo y tamaño específico
          const campo = `huevos_${tipo}_${tamaño}`
          const cantidad = (huevo[campo as keyof typeof huevo] as number) || 0

          return cantidad > 0
        })
        .map((huevo) => {
          const campo = `huevos_${tipo}_${tamaño}`
          const cantidad = (huevo[campo as keyof typeof huevo] as number) || 0

          return {
            id_huevo: huevo.id_huevo,
            id_jaula: huevo.id_jaula,
            fecha_recoleccion: huevo.fecha_recoleccion,
            cantidad_disponible: cantidad,
            jaula: huevo.jaula,
            tipo,
            tamaño,
          }
        }) || []

    console.log(`✅ Found ${huevosDisponibles.length} available eggs of type ${tipo} ${tamaño}`)

    res.status(200).json({
      success: true,
      data: huevosDisponibles,
      total: huevosDisponibles.length,
      cantidadMinima: getCantidadMinima(tamaño),
    })
  } catch (error) {
    console.error("❌ Error en obtenerHuevosDisponibles:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Crear nueva bandeja
export const crearBandeja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo, tamaño, id_huevos } = req.body

    if (!tipo || !tamaño || !Array.isArray(id_huevos)) {
      res.status(400).json({ error: "Faltan campos obligatorios" })
      return
    }

    const cantidadMinima = getCantidadMinima(tamaño)
    if (id_huevos.length < cantidadMinima) {
      res.status(400).json({
        error: `Se requieren al menos ${cantidadMinima} huevos para una bandeja de tamaño ${tamaño}`,
      })
      return
    }

    // Verificar que los huevos no estén ya asignados
    const { data: asignados, error: errorAsignados } = await verificarHuevosAsignados(id_huevos)
    if (errorAsignados) {
      res.status(500).json({ error: "Error al verificar huevos asignados" })
      return
    }

    if (asignados && asignados.length > 0) {
      const idsAsignados = asignados.map((h) => h.id_huevo)
      res.status(400).json({
        error: `Los siguientes huevos ya están asignados a una bandeja: ${idsAsignados.join(", ")}`,
      })
      return
    }

    // Crear la bandeja
    const { data: nuevaBandeja, error: errorBandeja } = await supabase
      .from("bandeja")
      .insert([
        {
          tipo_huevo: tipo,
          tamaño_huevo: tamaño,
          cantidad_huevos: id_huevos.length,
          fecha_creacion: new Date().toISOString(),
          estado: "disponible",
        },
      ])
      .select()
      .single()

    if (errorBandeja || !nuevaBandeja) {
      console.error("❌ Error creating bandeja:", errorBandeja)
      res.status(500).json({ error: "Error al crear la bandeja" })
      return
    }

    // Asignar huevos a la bandeja
    const insertData = id_huevos.map((id_huevo: number) => ({
      id_bandeja: nuevaBandeja.id_bandeja,
      id_huevo,
    }))

    const { error: errorAsignacion } = await supabase.from("huevo_bandeja").insert(insertData)

    if (errorAsignacion) {
      console.error("❌ Error assigning eggs:", errorAsignacion)
      res.status(500).json({ error: "Error al asignar huevos a la bandeja" })
      return
    }

    console.log(`✅ Bandeja created successfully: ${nuevaBandeja.id_bandeja}`)

    res.status(201).json({
      success: true,
      message: "Bandeja creada y huevos asignados correctamente",
      data: nuevaBandeja,
    })
  } catch (error) {
    console.error("❌ Error en crearBandeja:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener todas las bandejas
export const obtenerBandejas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("bandeja")
      .select(`
        *,
        huevo_bandeja (
          id_huevo,
          huevo:id_huevo (
            id_huevo,
            id_jaula,
            fecha_recoleccion,
            jaula:id_jaula (
              descripcion
            )
          )
        )
      `)
      .order("fecha_creacion", { ascending: false })

    if (error) {
      console.error("❌ Error fetching bandejas:", error)
      res.status(500).json({ error: "Error al obtener bandejas" })
      return
    }

    res.status(200).json({
      success: true,
      data: data || [],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error("❌ Error en obtenerBandejas:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener una bandeja por ID
export const obtenerBandejaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ error: "Falta el ID de la bandeja" })
      return
    }

    const { data, error } = await supabase
      .from("bandeja")
      .select(`
        *,
        huevo_bandeja (
          id_huevo,
          huevo:id_huevo (
            id_huevo,
            id_jaula,
            fecha_recoleccion,
            jaula:id_jaula (
              descripcion
            )
          )
        )
      `)
      .eq("id_bandeja", id)
      .single()

    if (error) {
      console.error("❌ Error fetching bandeja:", error)
      res.status(500).json({ error: "Error al obtener la bandeja" })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Bandeja no encontrada" })
      return
    }

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("❌ Error en obtenerBandejaPorId:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Eliminar bandeja
export const eliminarBandeja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ error: "Falta el ID de la bandeja" })
      return
    }

    // Primero eliminar las relaciones huevo_bandeja
    const { error: errorRelaciones } = await supabase.from("huevo_bandeja").delete().eq("id_bandeja", id)

    if (errorRelaciones) {
      console.error("❌ Error deleting egg relations:", errorRelaciones)
      res.status(500).json({ error: "Error al eliminar relaciones de huevos" })
      return
    }

    // Luego eliminar la bandeja
    const { error } = await supabase.from("bandeja").delete().eq("id_bandeja", id)

    if (error) {
      console.error("❌ Error deleting bandeja:", error)
      res.status(500).json({ error: "Error al eliminar la bandeja" })
      return
    }

    res.status(200).json({
      success: true,
      message: "Bandeja eliminada correctamente",
    })
  } catch (error) {
    console.error("❌ Error en eliminarBandeja:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Actualizar bandeja
export const actualizarBandeja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { tipo_huevo, tamaño_huevo, estado } = req.body

    if (!id) {
      res.status(400).json({ error: "Falta el ID de la bandeja" })
      return
    }

    const updateData: any = {}
    if (tipo_huevo) updateData.tipo_huevo = tipo_huevo
    if (tamaño_huevo) updateData.tamaño_huevo = tamaño_huevo
    if (estado) updateData.estado = estado

    const { data, error } = await supabase.from("bandeja").update(updateData).eq("id_bandeja", id).select().single()

    if (error) {
      console.error("❌ Error updating bandeja:", error)
      res.status(500).json({ error: "Error al actualizar la bandeja" })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Bandeja no encontrada" })
      return
    }

    res.status(200).json({
      success: true,
      data,
      message: "Bandeja actualizada correctamente",
    })
  } catch (error) {
    console.error("❌ Error en actualizarBandeja:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Asignar huevos a una bandeja existente
export const asignarHuevosABandeja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { id_huevos } = req.body

    if (!id || !Array.isArray(id_huevos)) {
      res.status(400).json({ error: "Faltan campos obligatorios" })
      return
    }

    const { data: bandeja, error: errorBandeja } = await supabase
      .from("bandeja")
      .select("*")
      .eq("id_bandeja", id)
      .single()

    if (errorBandeja || !bandeja) {
      res.status(404).json({ error: "Bandeja no encontrada" })
      return
    }

    const { data: asignados, error: errorAsignados } = await verificarHuevosAsignados(id_huevos)
    if (errorAsignados) {
      res.status(500).json({ error: "Error al verificar huevos asignados" })
      return
    }

    if (asignados && asignados.length > 0) {
      const idsAsignados = asignados.map((h) => h.id_huevo)
      res.status(400).json({
        error: `Los siguientes huevos ya están asignados a una bandeja: ${idsAsignados.join(", ")}`,
      })
      return
    }

    const insertData = id_huevos.map((id_huevo: number) => ({
      id_bandeja: bandeja.id_bandeja,
      id_huevo,
    }))

    const { error: errorAsignacion } = await supabase.from("huevo_bandeja").insert(insertData)

    if (errorAsignacion) {
      console.error("❌ Error assigning eggs:", errorAsignacion)
      res.status(500).json({ error: "Error al asignar huevos a la bandeja" })
      return
    }

    // Actualizar cantidad de huevos en la bandeja
    const { error: errorUpdate } = await supabase
      .from("bandeja")
      .update({
        cantidad_huevos: bandeja.cantidad_huevos + id_huevos.length,
      })
      .eq("id_bandeja", id)

    if (errorUpdate) {
      console.error("❌ Error updating bandeja count:", errorUpdate)
    }

    res.status(200).json({
      success: true,
      message: "Huevos asignados a la bandeja correctamente",
      data: bandeja,
    })
  } catch (error) {
    console.error("❌ Error en asignarHuevosABandeja:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Eliminar huevos de una bandeja
export const eliminarHuevosDeBandeja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { id_huevos } = req.body

    if (!id || !Array.isArray(id_huevos)) {
      res.status(400).json({ error: "Faltan campos obligatorios" })
      return
    }

    const { error } = await supabase.from("huevo_bandeja").delete().eq("id_bandeja", id).in("id_huevo", id_huevos)

    if (error) {
      console.error("❌ Error removing eggs from bandeja:", error)
      res.status(500).json({ error: "Error al eliminar huevos de la bandeja" })
      return
    }

    // Actualizar cantidad de huevos en la bandeja
    const { data: bandeja } = await supabase.from("bandeja").select("cantidad_huevos").eq("id_bandeja", id).single()

    if (bandeja) {
      await supabase
        .from("bandeja")
        .update({
          cantidad_huevos: Math.max(0, bandeja.cantidad_huevos - id_huevos.length),
        })
        .eq("id_bandeja", id)
    }

    res.status(200).json({
      success: true,
      message: "Huevos eliminados de la bandeja correctamente",
    })
  } catch (error) {
    console.error("❌ Error en eliminarHuevosDeBandeja:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// backend/src/controllers/bandejaController.ts
import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

// ---------------------------------------------------------------------------
// Tipos auxiliares (evitan ParserError por la columna con ñ)
type TipoHuevo = "cafe" | "blanco"
type TamanoHuevo = "chico" | "mediano" | "grande" | "jumbo"

type BandejaCore = {
  id_bandeja: number
  id_venta: number | null
  tipo_huevo: TipoHuevo
  "tamaño_huevo": TamanoHuevo // ¡clave con ñ! -> acceder siempre con brackets
  cantidad_huevos: number
  estado?: "disponible" | "vendida"
}

type RelHuevoBandeja = {
  id_huevo: number
  id_bandeja: number
  cantidad_usada: number
}
// ---------------------------------------------------------------------------

const getCantidadMinima = (tamaño: TamanoHuevo): number => (tamaño === "jumbo" ? 24 : 30)
const getCampoCantidad = (tipo: TipoHuevo, tamaño: TamanoHuevo) => `huevos_${tipo}_${tamaño}`

// ===========================================================================
// Huevos disponibles por tipo/tamaño (permite uso parcial: saldo > 0)
// ===========================================================================
export const obtenerHuevosDisponibles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo, tamaño } = req.params as { tipo: TipoHuevo; tamaño: TamanoHuevo }
    if (!tipo || !tamaño) {
      res.status(400).json({ error: "Tipo y tamaño son requeridos" })
      return
    }

    const campo = getCampoCantidad(tipo, tamaño)

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
        jaula:id_jaula ( id_jaula, descripcion )
      `)
      .order("fecha_recoleccion", { ascending: true })

    if (huevosError) {
      res.status(500).json({ error: "Error al obtener huevos" })
      return
    }

    // ✔️ Sin excluir por huevo_bandeja: si aún tiene saldo en el campo => utilizable
    const disponibles =
      huevos
        ?.filter((h) => Number((h as any)[campo] || 0) > 0)
        .map((h) => ({
          id_huevo: h.id_huevo,
          id_jaula: h.id_jaula,
          fecha_recoleccion: h.fecha_recoleccion,
          cantidad_disponible: Number((h as any)[campo] || 0),
          jaula: (h as any).jaula,
          tipo,
          tamaño,
        })) || []

    res.status(200).json({
      success: true,
      data: disponibles,
      total: disponibles.length,
      cantidadMinima: getCantidadMinima(tamaño),
    })
  } catch (error) {
    console.error("❌ obtenerHuevosDisponibles:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// ===========================================================================
// Crear bandeja (parcial): descuenta stock y registra cantidad_usada
// ===========================================================================
export const crearBandeja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo, tamaño, id_huevos } = req.body as {
      tipo: TipoHuevo
      tamaño: TamanoHuevo
      id_huevos: number[]
    }

    if (!tipo || !tamaño || !Array.isArray(id_huevos) || id_huevos.length === 0) {
      res.status(400).json({ error: "Faltan campos obligatorios o la lista de huevos está vacía" })
      return
    }

    const cantidadMinima = getCantidadMinima(tamaño)
    const campoCantidad = getCampoCantidad(tipo, tamaño)

    // Traer sólo los huevos solicitados
    const { data: huevosSeleccionados, error: errorHuevos } = await supabase
      .from("huevo")
      .select("*")
      .in("id_huevo", id_huevos)

    if (errorHuevos || !huevosSeleccionados) {
      res.status(500).json({ error: "Error al obtener huevos seleccionados" })
      return
    }

    // Validar disponibilidad total actual (saldo en el campo correspondiente)
    let totalDisponible = 0
    for (const h of huevosSeleccionados) {
      const val = Number((h as any)[campoCantidad] ?? 0)
      if (Number.isNaN(val)) {
        res.status(500).json({ error: `Campo ${campoCantidad} inválido en huevo ${h.id_huevo}` })
        return
      }
      totalDisponible += val
    }
    if (totalDisponible < cantidadMinima) {
      res.status(400).json({ error: `Se requieren al menos ${cantidadMinima} huevos` })
      return
    }

    // Crear bandeja
    const { data: nuevaBandeja, error: errorBandeja } = await supabase
      .from("bandeja")
      .insert([
        {
          tipo_huevo: tipo,
          "tamaño_huevo": tamaño, // clave con ñ
          cantidad_huevos: cantidadMinima,
          estado: "disponible",
        } as any,
      ])
      .select()
      .single()

    if (errorBandeja || !nuevaBandeja) {
      res.status(500).json({ error: "Error al crear la bandeja" })
      return
    }

    // Repartir cantidades y actualizar stock (modo parcial)
    let restante = cantidadMinima
    const relaciones: RelHuevoBandeja[] = []

    for (const h of huevosSeleccionados) {
      if (restante <= 0) break
      const disponibles = Number((h as any)[campoCantidad] ?? 0)
      if (disponibles <= 0) continue

      const usar = Math.min(disponibles, restante)
      const nuevoValor = disponibles - usar

      if (usar > 0) {
        relaciones.push({
          id_huevo: (h as any).id_huevo,
          id_bandeja: (nuevaBandeja as any).id_bandeja,
          cantidad_usada: usar,
        })

        const { error: updErr } = await supabase
          .from("huevo")
          .update({ [campoCantidad]: nuevoValor })
          .eq("id_huevo", (h as any).id_huevo)
        if (updErr) {
          console.error("❌ update huevo:", updErr)
          res.status(500).json({ error: "Error al actualizar stock de huevo" })
          return
        }

        restante -= usar
      }
    }

    if (relaciones.length > 0) {
      const { error: relErr } = await supabase.from("huevo_bandeja").insert(relaciones)
      if (relErr) {
        console.error("❌ insert relaciones:", relErr)
        res.status(500).json({ error: "Error al asignar huevos a la bandeja" })
        return
      }
    }

    res.status(201).json({
      success: true,
      message: "Bandeja creada y huevos asignados correctamente",
      data: nuevaBandeja,
    })
  } catch (error) {
    console.error("❌ crearBandeja:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// ===========================================================================
// Listar bandejas (con relaciones)
// ===========================================================================
export const obtenerBandejas = async (req: Request, res: Response): Promise<void> => {
  try {
    // No incluimos tamaño_huevo en el select string (usamos *), así evitamos ParserError
    const { data, error } = await supabase
      .from("bandeja")
      .select(`
        *,
        huevo_bandeja (
          id_huevo,
          cantidad_usada,
          huevo:id_huevo (
            id_huevo,
            id_jaula,
            fecha_recoleccion,
            jaula:id_jaula ( descripcion )
          )
        )
      `)
      .order("fecha_creacion", { ascending: false })
      .returns<any>() // blindamos tipos

    if (error) {
      console.error("❌ obtenerBandejas:", error)
      res.status(500).json({ error: "Error al obtener bandejas" })
      return
    }

    res.status(200).json({ success: true, data: data || [], total: data?.length || 0 })
  } catch (error) {
    console.error("❌ obtenerBandejas:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// ===========================================================================
// Obtener una bandeja por ID
// ===========================================================================
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
          cantidad_usada,
          huevo:id_huevo (
            id_huevo,
            id_jaula,
            fecha_recoleccion,
            jaula:id_jaula ( descripcion )
          )
        )
      `)
      .eq("id_bandeja", id)
      .single()
      .returns<any>()

    if (error) {
      console.error("❌ obtenerBandejaPorId:", error)
      res.status(500).json({ error: "Error al obtener la bandeja" })
      return
    }
    if (!data) {
      res.status(404).json({ error: "Bandeja no encontrada" })
      return
    }

    res.status(200).json({ success: true, data })
  } catch (error) {
    console.error("❌ obtenerBandejaPorId:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// ===========================================================================
// Eliminar bandeja (restituye stock)
// ===========================================================================
export const eliminarBandeja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    if (!id) {
      res.status(400).json({ error: "Falta el ID de la bandeja" })
      return
    }

    // Selección tipada con columna entre comillas y .returns<...>()
    const { data: bandeja, error: errB } = await supabase
      .from("bandeja")
      .select('id_bandeja, id_venta, tipo_huevo, "tamaño_huevo", cantidad_huevos')
      .eq("id_bandeja", id)
      .single()
      .returns<BandejaCore>()

    if (errB) {
      console.error("❌ verificar bandeja:", errB)
      res.status(500).json({ error: "Error al verificar la bandeja" })
      return
    }
    if (!bandeja) {
      res.status(404).json({ error: "Bandeja no encontrada" })
      return
    }
    if (bandeja.id_venta) {
      res.status(400).json({ error: "No se puede eliminar la bandeja porque está asociada a una venta." })
      return
    }

    const campoCantidad = getCampoCantidad(bandeja.tipo_huevo, bandeja["tamaño_huevo"])

    // Traer relaciones con cantidad_usada
    const { data: rels, error: errR } = await supabase
      .from("huevo_bandeja")
      .select("id_huevo, cantidad_usada")
      .eq("id_bandeja", id)

    if (errR) {
      console.error("❌ leer relaciones:", errR)
      res.status(500).json({ error: "Error al leer relaciones de huevos" })
      return
    }

    // Restituir stock en cada huevo
    for (const rel of (rels || []) as { id_huevo: number; cantidad_usada: number }[]) {
      const { data: row, error: eGet } = await supabase
        .from("huevo")
        .select(campoCantidad)
        .eq("id_huevo", rel.id_huevo)
        .single()
      if (eGet) {
        console.error("❌ leer huevo para restitución:", eGet)
        res.status(500).json({ error: "Error al leer huevo para restitución" })
        return
      }
      const actual = Number((row as any)?.[campoCantidad] || 0)
      const nuevo = actual + Number(rel.cantidad_usada || 0)

      const { error: eUpd } = await supabase
        .from("huevo")
        .update({ [campoCantidad]: nuevo })
        .eq("id_huevo", rel.id_huevo)
      if (eUpd) {
        console.error("❌ restituir stock:", eUpd)
        res.status(500).json({ error: "Error al restituir stock de huevo" })
        return
      }
    }

    // Borrar relaciones y bandeja
    const { error: eDelRel } = await supabase.from("huevo_bandeja").delete().eq("id_bandeja", id)
    if (eDelRel) {
      console.error("❌ eliminar relaciones:", eDelRel)
      res.status(500).json({ error: "Error al eliminar relaciones de huevos" })
      return
    }

    const { error: eDelBan } = await supabase.from("bandeja").delete().eq("id_bandeja", id)
    if (eDelBan) {
      console.error("❌ eliminar bandeja:", eDelBan)
      res.status(500).json({ error: "Error al eliminar la bandeja" })
      return
    }

    res.status(200).json({ success: true, message: "Bandeja eliminada correctamente" })
  } catch (error) {
    console.error("❌ eliminarBandeja:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// ===========================================================================
// Actualizar bandeja (campos básicos)
// ===========================================================================
export const actualizarBandeja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { tipo_huevo, tamaño_huevo, estado } = req.body as {
      tipo_huevo?: TipoHuevo
      tamaño_huevo?: TamanoHuevo
      estado?: "disponible" | "vendida"
    }

    if (!id) {
      res.status(400).json({ error: "Falta el ID de la bandeja" })
      return
    }

    const updateData: any = {}
    if (tipo_huevo) updateData.tipo_huevo = tipo_huevo
    if (tamaño_huevo) updateData["tamaño_huevo"] = tamaño_huevo // usar brackets
    if (estado) updateData.estado = estado

    const { data, error } = await supabase.from("bandeja").update(updateData).eq("id_bandeja", id).select().single()
    if (error) {
      console.error("❌ actualizarBandeja:", error)
      res.status(500).json({ error: "Error al actualizar la bandeja" })
      return
    }
    if (!data) {
      res.status(404).json({ error: "Bandeja no encontrada" })
      return
    }

    res.status(200).json({ success: true, data, message: "Bandeja actualizada correctamente" })
  } catch (error) {
    console.error("❌ actualizarBandeja:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// ===========================================================================
// Agregar huevos a una bandeja existente (parcial, usa todo el saldo disponible)
// ===========================================================================
export const asignarHuevosABandeja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { id_huevos } = req.body as { id_huevos: number[] }

    if (!id || !Array.isArray(id_huevos) || id_huevos.length === 0) {
      res.status(400).json({ error: "Faltan campos obligatorios" })
      return
    }

    const { data: bandeja, error: eB } = await supabase
      .from("bandeja")
      .select('id_bandeja, tipo_huevo, "tamaño_huevo", cantidad_huevos')
      .eq("id_bandeja", id)
      .single()
      .returns<BandejaCore>()
    if (eB || !bandeja) {
      res.status(404).json({ error: "Bandeja no encontrada" })
      return
    }

    const campoCantidad = getCampoCantidad(bandeja.tipo_huevo, bandeja["tamaño_huevo"])

    const { data: huevos, error: eH } = await supabase.from("huevo").select("*").in("id_huevo", id_huevos)
    if (eH || !huevos) {
      res.status(500).json({ error: "Error al obtener huevos" })
      return
    }

    let sumUsada = 0
    const relaciones: RelHuevoBandeja[] = []

    for (const h of huevos) {
      const disp = Number((h as any)[campoCantidad] || 0)
      if (disp <= 0) continue

      const usar = disp // usa todo el saldo disponible
      const nuevo = Math.max(0, disp - usar)

      const { error: eUpd } = await supabase.from("huevo").update({ [campoCantidad]: nuevo }).eq("id_huevo", h.id_huevo)
      if (eUpd) {
        res.status(500).json({ error: "Error al actualizar stock de huevo" })
        return
      }

      relaciones.push({ id_huevo: h.id_huevo, id_bandeja: bandeja.id_bandeja, cantidad_usada: usar })
      sumUsada += usar
    }

    if (relaciones.length > 0) {
      const { error: eRel } = await supabase.from("huevo_bandeja").insert(relaciones)
      if (eRel) {
        res.status(500).json({ error: "Error al asignar huevos a la bandeja" })
        return
      }

      await supabase
        .from("bandeja")
        .update({ cantidad_huevos: Number(bandeja.cantidad_huevos) + sumUsada })
        .eq("id_bandeja", id)
    }

    res.status(200).json({ success: true, message: "Huevos asignados a la bandeja correctamente" })
  } catch (error) {
    console.error("❌ asignarHuevosABandeja:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// ===========================================================================
// Quitar huevos de una bandeja (parcial, restituye stock)
// ===========================================================================
export const eliminarHuevosDeBandeja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { id_huevos } = req.body as { id_huevos: number[] }

    if (!id || !Array.isArray(id_huevos) || id_huevos.length === 0) {
      res.status(400).json({ error: "Faltan campos obligatorios" })
      return
    }

    const { data: bandeja, error: eB } = await supabase
      .from("bandeja")
      .select('id_bandeja, tipo_huevo, "tamaño_huevo", cantidad_huevos')
      .eq("id_bandeja", id)
      .single()
      .returns<BandejaCore>()
    if (eB || !bandeja) {
      res.status(404).json({ error: "Bandeja no encontrada" })
      return
    }

    const campoCantidad = getCampoCantidad(bandeja.tipo_huevo, bandeja["tamaño_huevo"])

    const { data: rels, error: eRel } = await supabase
      .from("huevo_bandeja")
      .select("id_huevo, cantidad_usada")
      .eq("id_bandeja", id)
      .in("id_huevo", id_huevos)
    if (eRel) {
      res.status(500).json({ error: "Error al obtener relaciones" })
      return
    }

    let restituirTotal = 0
    for (const rel of (rels || []) as { id_huevo: number; cantidad_usada: number }[]) {
      const { data: row, error: eGet } = await supabase
        .from("huevo")
        .select(campoCantidad)
        .eq("id_huevo", rel.id_huevo)
        .single()
      if (eGet) {
        res.status(500).json({ error: "Error al leer huevo" })
        return
      }

      const actual = Number((row as any)?.[campoCantidad] || 0)
      const nuevo = actual + Number(rel.cantidad_usada || 0)
      const { error: eUpd } = await supabase
        .from("huevo")
        .update({ [campoCantidad]: nuevo })
        .eq("id_huevo", rel.id_huevo)
      if (eUpd) {
        res.status(500).json({ error: "Error al restituir stock" })
        return
      }

      restituirTotal += Number(rel.cantidad_usada || 0)
    }

    const { error: eDel } = await supabase.from("huevo_bandeja").delete().eq("id_bandeja", id).in("id_huevo", id_huevos)
    if (eDel) {
      res.status(500).json({ error: "Error al eliminar relaciones" })
      return
    }

    if (restituirTotal > 0) {
      await supabase
        .from("bandeja")
        .update({ cantidad_huevos: Math.max(0, Number(bandeja.cantidad_huevos) - restituirTotal) })
        .eq("id_bandeja", id)
    }

    res.status(200).json({ success: true, message: "Huevos eliminados de la bandeja correctamente" })
  } catch (error) {
    console.error("❌ eliminarHuevosDeBandeja:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

/* =========================
 * Helpers
 * ========================= */
const daysBetweenInclusive = (startISO?: string | string[], endISO?: string | string[]) => {
  const s = typeof startISO === "string" ? startISO : Array.isArray(startISO) ? startISO[0] : undefined
  const e = typeof endISO === "string" ? endISO : Array.isArray(endISO) ? endISO[0] : undefined
  if (!s || !e) return 1
  const start = new Date(`${s}T00:00:00`)
  const end = new Date(`${e}T00:00:00`)
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff) + 1
}

/* =========================
 * VENTAS MENSUALES
 * ========================= */
export const getVentasMensuales = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query

    console.log("🔍 Parámetros recibidos:", { startDate, endDate, id_jaula })

    let query = supabase
      .from("venta")
      .select(`
        fecha_venta,
        costo_total,
        cantidad_total,
        cliente:cliente(nombre),
        bandejas:bandeja(
          id_bandeja,
          huevo:huevo_bandeja(
            huevo:huevo(
              id_jaula
            )
          )
        )
      `)
      .order("fecha_venta", { ascending: true })

    if (startDate && typeof startDate === "string") query = query.gte("fecha_venta", startDate)
    if (endDate && typeof endDate === "string") query = query.lte("fecha_venta", endDate)

    const { data: ventas, error } = await query
    if (error) {
      console.error("❌ Error en consulta de ventas:", error)
      throw error
    }

    if (!ventas || ventas.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        meta: { tipo: "sin_datos", total_registros: 0, rango_dias: 0 },
      })
    }

    let ventasFiltradas = ventas
    if (id_jaula && typeof id_jaula === "string") {
      const jaulaId = Number.parseInt(id_jaula)
      if (!Number.isNaN(jaulaId)) {
        ventasFiltradas = ventas.filter((venta) =>
          venta.bandejas?.some((b: any) => b.huevo?.some((hb: any) => hb.huevo?.id_jaula === jaulaId)),
        )
      }
    }

    let mostrarPorDias = false
    let diferenciaDias = 0
    if (startDate && endDate && typeof startDate === "string" && typeof endDate === "string") {
      const fi = new Date(startDate)
      const ff = new Date(endDate)
      if (!isNaN(fi.getTime()) && !isNaN(ff.getTime())) {
        diferenciaDias = Math.ceil((ff.getTime() - fi.getTime()) / (1000 * 3600 * 24))
        mostrarPorDias = diferenciaDias <= 31
      }
    }

    let resultado: any[] = []

    if (mostrarPorDias && startDate && endDate) {
      const fi = new Date(startDate as string)
      const ff = new Date(endDate as string)
      const diasMap: Record<string, { fecha: string; ventas: number; cantidad: number; pedidos: number }> = {}

      const it = new Date(fi)
      while (it <= ff) {
        const key = it.toISOString().split("T")[0]
        diasMap[key] = {
          fecha: it.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
          ventas: 0,
          cantidad: 0,
          pedidos: 0,
        }
        it.setDate(it.getDate() + 1)
      }

      ventasFiltradas.forEach((v) => {
        const key = String(v.fecha_venta).split("T")[0]
        if (diasMap[key]) {
          diasMap[key].ventas += Number(v.costo_total) || 0
          diasMap[key].cantidad += Number(v.cantidad_total) || 0
          diasMap[key].pedidos += 1
        }
      })

      resultado = Object.keys(diasMap)
        .sort()
        .map((k) => ({
          periodo: diasMap[k].fecha,
          ventas: diasMap[k].ventas,
          cantidad: diasMap[k].cantidad,
          pedidos: diasMap[k].pedidos,
          tipo: "dia",
        }))
    } else {
      const añoActual = new Date().getFullYear()
      const mesesMap: Record<string, { mes: string; ventas: number; cantidad: number; pedidos: number }> = {}

      for (let m = 0; m < 12; m++) {
        const f = new Date(añoActual, m, 1)
        const key = `${añoActual}-${String(m + 1).padStart(2, "0")}`
        mesesMap[key] = {
          mes: f.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
          ventas: 0,
          cantidad: 0,
          pedidos: 0,
        }
      }

      ventasFiltradas.forEach((v) => {
        const f = new Date(v.fecha_venta)
        const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}`
        if (mesesMap[key]) {
          mesesMap[key].ventas += Number(v.costo_total) || 0
          mesesMap[key].cantidad += Number(v.cantidad_total) || 0
          mesesMap[key].pedidos += 1
        }
      })

      resultado = Object.keys(mesesMap)
        .sort()
        .map((k) => ({
          periodo: mesesMap[k].mes,
          ventas: mesesMap[k].ventas,
          cantidad: mesesMap[k].cantidad,
          pedidos: mesesMap[k].pedidos,
          tipo: "mes",
        }))
    }

    return res.status(200).json({
      success: true,
      data: resultado,
      meta: { tipo: mostrarPorDias ? "dias" : "meses", total_registros: resultado.length, rango_dias: diferenciaDias, ventas_procesadas: ventasFiltradas.length },
    })
  } catch (error) {
    console.error("❌ Error en getVentasMensuales:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor", error: error instanceof Error ? error.message : "Error desconocido" })
  }
}

/* =========================
 * PRODUCCIÓN HUEVOS
 * ========================= */
export const getProduccionHuevos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query

    let query = supabase.from("huevo").select("*")
    if (startDate) query = query.gte("fecha_recoleccion", startDate as string)
    if (endDate) query = query.lte("fecha_recoleccion", endDate as string)
    if (id_jaula) query = query.eq("id_jaula", id_jaula as string)

    const { data: huevos, error } = await query
    if (error) throw error

    const totales = huevos?.reduce(
      (acc: any, h: any) => {
        acc.cafe_chico += h.huevos_cafe_chico || 0
        acc.cafe_mediano += h.huevos_cafe_mediano || 0
        acc.cafe_grande += h.huevos_cafe_grande || 0
        acc.cafe_jumbo += h.huevos_cafe_jumbo || 0
        acc.blanco_chico += h.huevos_blanco_chico || 0
        acc.blanco_mediano += h.huevos_blanco_mediano || 0
        acc.blanco_grande += h.huevos_blanco_grande || 0
        acc.blanco_jumbo += h.huevos_blanco_jumbo || 0
        return acc
      },
      {
        cafe_chico: 0,
        cafe_mediano: 0,
        cafe_grande: 0,
        cafe_jumbo: 0,
        blanco_chico: 0,
        blanco_mediano: 0,
        blanco_grande: 0,
        blanco_jumbo: 0,
      },
    )

    const resultado = [
      { tipo: "Café Chico", cantidad: totales?.cafe_chico || 0 },
      { tipo: "Café Mediano", cantidad: totales?.cafe_mediano || 0 },
      { tipo: "Café Grande", cantidad: totales?.cafe_grande || 0 },
      { tipo: "Café Jumbo", cantidad: totales?.cafe_jumbo || 0 },
      { tipo: "Blanco Chico", cantidad: totales?.blanco_chico || 0 },
      { tipo: "Blanco Mediano", cantidad: totales?.blanco_mediano || 0 },
      { tipo: "Blanco Grande", cantidad: totales?.blanco_grande || 0 },
      { tipo: "Blanco Jumbo", cantidad: totales?.blanco_jumbo || 0 },
    ]

    return res.status(200).json({ success: true, data: resultado })
  } catch (error) {
    console.error("Error en getProduccionHuevos:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}

/* =========================
 * PRODUCCIÓN POR JAULA (EFICIENCIA REAL)
 * ========================= */
export const getProduccionPorJaula = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query

    // Traer registros de huevos en el rango
    let qHuevos = supabase.from("huevo").select("id_jaula, cantidad_total, fecha_recoleccion")
    if (startDate) qHuevos = qHuevos.gte("fecha_recoleccion", startDate as string)
    if (endDate) qHuevos = qHuevos.lte("fecha_recoleccion", endDate as string)
    if (id_jaula) qHuevos = qHuevos.eq("id_jaula", id_jaula as string)

    const { data: huevos, error: errHuevos } = await qHuevos
    if (errHuevos) throw errHuevos

    // Agrupar producción por jaula
    const prodByJaula: Record<
      string,
      { jaulaId: number; huevos: number; registros: number }
    > = {}

    for (const r of huevos || []) {
      const jid = Number(r.id_jaula)
      if (!prodByJaula[jid]) prodByJaula[jid] = { jaulaId: jid, huevos: 0, registros: 0 }
      prodByJaula[jid].huevos += Number(r.cantidad_total || 0)
      prodByJaula[jid].registros += 1
    }

    const jaulasIds = Object.keys(prodByJaula).map((k) => Number(k))

    // Contar aves por jaula
    let avesPorJaula: Record<string, number> = {}
    if (jaulasIds.length > 0) {
      const { data: aves, error: errAves } = await supabase
                .from("ave")
                .select("id_jaula")
                .in("id_jaula", jaulasIds)
              if (errAves) throw errAves

              const tmp: Record<string, number> = {}
              for (const a of aves || []) {
                const key = String(a.id_jaula)
                tmp[key] = (tmp[key] || 0) + 1
              }
              avesPorJaula = tmp
            }

    const dias = daysBetweenInclusive(startDate as string | string[] | undefined, endDate as string | string[] | undefined)
    const resultado = Object.values(prodByJaula).map((j) => {
      const aves = Math.max(1, Number(avesPorJaula[String(j.jaulaId)] || 0))
      const eficiencia = Math.min(120, Math.max(0, Math.round((j.huevos / (aves * dias)) * 100)))
      return {
        jaula: `Jaula ${j.jaulaId}`,
        produccion: j.huevos,
        registros: j.registros,
        aves,
        eficiencia,
      }
    })

    return res.status(200).json({ success: true, data: resultado })
  } catch (error) {
    console.error("Error en getProduccionPorJaula:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}

export const getEstadisticasAves = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query
    console.log("🔍 Estadísticas de aves (postura):", { startDate, endDate, id_jaula })

    // 1) EN POSTURA (ponen huevos)
    let qActivas = supabase
      .from("ave")
      .select("*", { count: "exact", head: true })
      .eq("estado_puesta", "activa")
    if (id_jaula) qActivas = qActivas.eq("id_jaula", id_jaula as string)
    const { count: enPostura } = await qActivas

    // 2) EN DESARROLLO
    let qEnDesarrollo = supabase
      .from("ave")
      .select("*", { count: "exact", head: true })
      .eq("estado_puesta", "en_desarrollo")
    if (id_jaula) qEnDesarrollo = qEnDesarrollo.eq("id_jaula", id_jaula as string)
    const { count: enDesarrollo } = await qEnDesarrollo

    // 3) SIN POSTURA (inactivas reales): 'inactiva' + NULL + ""
    let qInactivas1 = supabase
      .from("ave")
      .select("*", { count: "exact", head: true })
      .eq("estado_puesta", "inactiva")
    if (id_jaula) qInactivas1 = qInactivas1.eq("id_jaula", id_jaula as string)
    const { count: inactivaMarcada } = await qInactivas1

    let qInactivasNull = supabase
      .from("ave")
      .select("*", { count: "exact", head: true })
      .is("estado_puesta", null)
    if (id_jaula) qInactivasNull = qInactivasNull.eq("id_jaula", id_jaula as string)
    const { count: sinEstadoNull } = await qInactivasNull

    let qInactivasVacia = supabase
      .from("ave")
      .select("*", { count: "exact", head: true })
      .eq("estado_puesta", "")
    if (id_jaula) qInactivasVacia = qInactivasVacia.eq("id_jaula", id_jaula as string)
    const { count: sinEstadoVacio } = await qInactivasVacia

    const sinPostura = (inactivaMarcada || 0) + (sinEstadoNull || 0) + (sinEstadoVacio || 0)

    // 4) Muertes en rango
    let qMuertes = supabase.from("aves_fallecidas").select(
      `
      *,
      ave:ave!inner(id_jaula)
    `,
      { count: "exact", head: true },
    )
    if (startDate) qMuertes = qMuertes.gte("fecha", startDate as string)
    if (endDate) qMuertes = qMuertes.lte("fecha", endDate as string)
    if (id_jaula) qMuertes = qMuertes.eq("ave.id_jaula", id_jaula as string)
    const { count: muertes } = await qMuertes

    // 5) EN TRATAMIENTO **VIGENTES EN EL RANGO**:
    // Solapamiento entre [fecha_inicio, COALESCE(fecha_fin, +∞)] y [startDate, endDate].
    // Condición: fecha_inicio <= endDate AND (fecha_fin IS NULL OR fecha_fin >= startDate)
    // Si no se entrega start/end desde el front, usamos límites amplios por defecto.
    const fi = (typeof startDate === "string" && startDate) ? startDate : "0001-01-01"
    const ff = (typeof endDate === "string" && endDate) ? endDate : "9999-12-31"

    let qTrat = supabase
      .from("ave_clinica")
      .select("id_ave, id_jaula, fecha_inicio, fecha_fin, descripcion", { count: "exact" })
      .lte("fecha_inicio", ff) // comenzó antes o durante el fin del rango
      .or(`fecha_fin.is.null,fecha_fin.gte.${fi}`) // no ha terminado o terminó después/igual al inicio del rango

    if (id_jaula) qTrat = qTrat.eq("id_jaula", id_jaula as string)

    const { data: tratRows, count: tratamientosVigentes, error: tratErr } = await qTrat
    if (tratErr) throw tratErr

    // (Opcional) lista para el front si quieres mostrar el detalle:
    const avesEnTratamiento = (tratRows || []).map((r: any) => ({
      id_ave: r.id_ave,
      id_jaula: r.id_jaula,
      fecha_inicio: r.fecha_inicio,
      fecha_fin: r.fecha_fin,
      descripcion: r.descripcion,
    }))

    // 6) Nacimientos por fecha_nacimiento (fallback a fecha_registro)
    let qNac = supabase.from("ave").select("fecha_nacimiento, fecha_registro, id_jaula")
    if (id_jaula) qNac = qNac.eq("id_jaula", id_jaula as string)
    if (startDate) qNac = qNac.gte("fecha_nacimiento", startDate as string)
    if (endDate) qNac = qNac.lte("fecha_nacimiento", endDate as string)
    const { data: nacRows } = await qNac

    let nacimientos = 0
    if (nacRows?.length) {
      const sd = startDate ? new Date(startDate as string) : null
      const ed = endDate ? new Date(endDate as string) : null
      nacRows.forEach((r: any) => {
        const cand = r.fecha_nacimiento ?? r.fecha_registro
        if (!cand) return
        const f = new Date(cand)
        if ((sd ? f >= sd : true) && (ed ? f <= ed : true)) nacimientos += 1
      })
    }

    const resultado = [
      { categoria: "Aves Activas",        cantidad: enPostura || 0,            color: "#10B981" },
      { categoria: "Aves en Desarrollo",  cantidad: enDesarrollo || 0,         color: "#3B82F6" },
      { categoria: "Aves Inactivas",      cantidad: sinPostura || 0,           color: "#ebe84bff" },
      { categoria: "Nacimientos",         cantidad: nacimientos || 0,          color: "#2c3abdff" },
      { categoria: "Muertes",             cantidad: muertes || 0,              color: "#EF4444" },
      { categoria: "En Tratamiento",      cantidad: tratamientosVigentes || 0, color: "#F59E0B" },
    ]

    return res
      .status(200)
      .json({ success: true, data: resultado, extras: { avesEnTratamiento } })
  } catch (error) {
    console.error("❌ Error en getEstadisticasAves:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}

/* =========================
 * USO DE INSUMOS (CATEGORÍAS + DETALLE)
 * ========================= */
export const getUsoInsumos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate } = req.query

    // 1) Traer implementos del rango (usa tu campo fecha_registro)
    let qImpl = supabase
      .from("implementos")
      .select(`
        id_implemento,
        nombre,
        categoria,
        descripcion,
        cantidad,
        precio_unitario,
        estado,
        ubicacion,
        id_compra,
        fecha_registro
      `)

    if (startDate) qImpl = qImpl.gte("fecha_registro", startDate as string)
    if (endDate) qImpl = qImpl.lte("fecha_registro", endDate as string)

    const { data: implementos, error: errImpl } = await qImpl
    if (errImpl) throw errImpl

    // 2) Traer compras para obtener proveedor y fecha de compra
    const compraIds = Array.from(new Set((implementos || []).map((r: any) => r.id_compra).filter(Boolean)))
    let comprasById: Record<string, { proveedor?: string; fecha?: string }> = {}
    if (compraIds.length > 0) {
      const { data: compras, error: errCompras } = await supabase
        .from("compras")
        .select("id_compra, proveedor, fecha")
        .in("id_compra", compraIds)
      if (errCompras) throw errCompras
      comprasById = Object.fromEntries(
        (compras || []).map((c: any) => [String(c.id_compra), { proveedor: c.proveedor, fecha: c.fecha }]),
      )
    }

    // 3) Armar detalle y resumen por categoría
    const detalle = (implementos || []).map((r: any) => {
      const comp = r.id_compra ? comprasById[String(r.id_compra)] || {} : {}
      const cantidad = Number(r.cantidad || 0)
      const precioUnit = Number(r.precio_unitario || 0)
      const costo_total = cantidad * precioUnit

      return {
        id_implemento: r.id_implemento,
        nombre: r.nombre,
        categoria: r.categoria || "Sin categoría",
        cantidad: isNaN(cantidad) ? 0 : cantidad,
        costo_total: isNaN(costo_total) ? 0 : costo_total,
        caracteristicas: r.descripcion || "",
        ubicacion: r.ubicacion || "",
        proveedor: comp.proveedor || "",
        compra: r.id_compra ? `#${r.id_compra}` : null,
        fecha: comp.fecha || r.fecha_registro || null,
        estado: r.estado || "",
      }
    })

    const consumoPorCategoria: { [cat: string]: { insumo: string; consumo: number; costo: number; items: number } } =
      {}
    for (const d of detalle) {
      const cat = d.categoria || "Sin categoría"
      if (!consumoPorCategoria[cat]) consumoPorCategoria[cat] = { insumo: cat, consumo: 0, costo: 0, items: 0 }
      consumoPorCategoria[cat].consumo += Number(d.cantidad || 0)
      consumoPorCategoria[cat].costo += Number(d.costo_total || 0)
      consumoPorCategoria[cat].items += 1
    }

    return res.status(200).json({
      success: true,
      data: {
        consumoPorCategoria: Object.values(consumoPorCategoria),
        detalle,
      },
    })
  } catch (error) {
    console.error("Error en getUsoInsumos:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}

/* =========================
 * VENTAS POR CLIENTE
 * ========================= */
export const getVentasPorCliente = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query
    console.log("🔍 Ventas por cliente:", { startDate, endDate, id_jaula })

    let query = supabase.from("venta").select(`
      *,
      cliente:cliente(nombre),
      bandejas:bandeja(
        id_bandeja,
        huevo:huevo_bandeja(
          huevo:huevo(
            id_jaula
          )
        )
      )
    `)

    if (startDate) query = query.gte("fecha_venta", startDate as string)
    if (endDate) query = query.lte("fecha_venta", endDate as string)

    const { data: ventas, error } = await query
    if (error) throw error

    if (!ventas || ventas.length === 0) return res.status(200).json({ success: true, data: [] })

    let ventasFiltradas = ventas
    if (id_jaula) {
      const jaulaId = Number.parseInt(id_jaula as string)
      if (!Number.isNaN(jaulaId)) {
        ventasFiltradas = ventas.filter((v) =>
          v.bandejas?.some((b: any) => b.huevo?.some((hb: any) => hb.huevo?.id_jaula === jaulaId)),
        )
      }
    }

    const ventasPorCliente = ventasFiltradas.reduce((acc: any, v: any) => {
      const cliente = v.cliente?.nombre || "Cliente desconocido"
      if (!acc[cliente]) acc[cliente] = { cliente, ventas: 0, pedidos: 0, cantidad: 0 }
      acc[cliente].ventas += Number(v.costo_total) || 0
      acc[cliente].pedidos += 1
      acc[cliente].cantidad += Number(v.cantidad_total) || 0
      return acc
    }, {})

    const resultado = Object.values(ventasPorCliente).sort((a: any, b: any) => b.ventas - a.ventas)
    return res.status(200).json({ success: true, data: resultado })
  } catch (error) {
    console.error("❌ Error en getVentasPorCliente:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor", error: error instanceof Error ? error.message : "Error desconocido" })
  }
}

/* =========================
 * EVOLUCIÓN AVES (CORREGIDO)
 * ========================= */
export const getEvolucionAves = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query

    // Nacimientos: usar fecha_nacimiento; si es null, caer a fecha_registro
    let qNac = supabase.from("ave").select("fecha_nacimiento, fecha_registro, id_jaula")
    if (id_jaula) qNac = qNac.eq("id_jaula", id_jaula as string)

    if (startDate) qNac = qNac.gte("fecha_nacimiento", startDate as string)
    if (endDate) qNac = qNac.lte("fecha_nacimiento", endDate as string)

    const { data: nacimientos } = await qNac

    // Muertes
    let qMuertes = supabase.from("aves_fallecidas").select(`fecha, ave:ave!inner(id_jaula)`)
    if (startDate) qMuertes = qMuertes.gte("fecha", startDate as string)
    if (endDate) qMuertes = qMuertes.lte("fecha", endDate as string)
    if (id_jaula) qMuertes = qMuertes.eq("ave.id_jaula", id_jaula as string)
    const { data: muertes } = await qMuertes

    const fi = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1)
    const ff = endDate ? new Date(endDate as string) : new Date()

    const mesesMap: Record<string, { mes: string; nacimientos: number; muertes: number }> = {}
    const it = new Date(fi.getFullYear(), fi.getMonth(), 1)
    while (it <= ff) {
      const key = `${it.getFullYear()}-${String(it.getMonth() + 1).padStart(2, "0")}`
      mesesMap[key] = {
        mes: it.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
        nacimientos: 0,
        muertes: 0,
      }
      it.setMonth(it.getMonth() + 1)
    }

    nacimientos?.forEach((a: any) => {
      const cand = a.fecha_nacimiento ?? a.fecha_registro
      if (!cand) return
      const f = new Date(cand)
      const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}`
      if (mesesMap[key]) mesesMap[key].nacimientos += 1
    })

    muertes?.forEach((m: any) => {
      const f = new Date(m.fecha)
      const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}`
      if (mesesMap[key]) mesesMap[key].muertes += 1
    })

    const resultado = Object.keys(mesesMap)
      .sort()
      .map((k) => mesesMap[k])

    return res.status(200).json({ success: true, data: resultado })
  } catch (error) {
    console.error("Error en getEvolucionAves:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}

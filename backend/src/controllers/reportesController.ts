import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getVentasMensuales = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query

    console.log("🔍 Parámetros recibidos:", { startDate, endDate, id_jaula })

    // Construir query base - usar la estructura correcta con bandejas
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

    // Aplicar filtros de fecha si existen
    if (startDate && typeof startDate === "string") {
      query = query.gte("fecha_venta", startDate)
    }
    if (endDate && typeof endDate === "string") {
      query = query.lte("fecha_venta", endDate)
    }

    const { data: ventas, error } = await query
    if (error) {
      console.error("❌ Error en consulta de ventas:", error)
      throw error
    }

    console.log("📊 Ventas obtenidas:", ventas?.length || 0)

    // Si no hay ventas, retornar estructura vacía
    if (!ventas || ventas.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        meta: {
          tipo: "sin_datos",
          total_registros: 0,
          rango_dias: 0,
        },
      })
    }

    // Filtrar por jaula si se especifica
    let ventasFiltradas = ventas
    if (id_jaula && typeof id_jaula === "string") {
      try {
        const jaulaId = Number.parseInt(id_jaula)
        ventasFiltradas = ventas.filter((venta) =>
          venta.bandejas?.some((bandeja: any) =>
            bandeja.huevo?.some((huevoBandeja: any) => huevoBandeja.huevo?.id_jaula === jaulaId),
          ),
        )
        console.log("🏠 Ventas filtradas por jaula:", ventasFiltradas.length)
      } catch (error) {
        console.error("❌ Error filtrando por jaula:", error)
        // Continuar sin filtrar si hay error
      }
    }

    // Resto de la lógica permanece igual...
    // Determinar el tipo de agrupación basado en el rango de fechas
    let mostrarPorDias = false
    let diferenciaDias = 0

    if (startDate && endDate && typeof startDate === "string" && typeof endDate === "string") {
      try {
        const fechaInicio = new Date(startDate)
        const fechaFin = new Date(endDate)

        if (!isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime())) {
          diferenciaDias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 3600 * 24))
          mostrarPorDias = diferenciaDias <= 31
        }
      } catch (error) {
        console.error("❌ Error calculando diferencia de días:", error)
      }
    }

    console.log("📅 Configuración:", { diferenciaDias, mostrarPorDias })

    let resultado: any[] = []

    if (mostrarPorDias && startDate && endDate) {
      // Vista por días
      console.log("📊 Generando vista por días...")

      const fechaInicio = new Date(startDate as string)
      const fechaFin = new Date(endDate as string)
      const diasMap: Record<string, { fecha: string; ventas: number; cantidad: number; pedidos: number }> = {}

      // Generar todos los días en el rango
      const iterador = new Date(fechaInicio)
      while (iterador <= fechaFin) {
        const key = iterador.toISOString().split("T")[0]
        diasMap[key] = {
          fecha: iterador.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
          ventas: 0,
          cantidad: 0,
          pedidos: 0,
        }
        iterador.setDate(iterador.getDate() + 1)
      }

      // Completar con ventas reales
      ventasFiltradas.forEach((venta) => {
        try {
          const fechaKey = venta.fecha_venta.split("T")[0]
          if (diasMap[fechaKey]) {
            diasMap[fechaKey].ventas += Number(venta.costo_total) || 0
            diasMap[fechaKey].cantidad += Number(venta.cantidad_total) || 0
            diasMap[fechaKey].pedidos += 1
          }
        } catch (error) {
          console.error("❌ Error procesando venta:", error, venta)
        }
      })

      resultado = Object.keys(diasMap)
        .sort()
        .map((key) => ({
          periodo: diasMap[key].fecha,
          ventas: diasMap[key].ventas,
          cantidad: diasMap[key].cantidad,
          pedidos: diasMap[key].pedidos,
          tipo: "dia",
        }))
    } else {
      // Vista por meses (todos los 12 meses del año actual)
      console.log("📊 Generando vista por meses...")

      const añoActual = new Date().getFullYear()
      const mesesMap: Record<string, { mes: string; ventas: number; cantidad: number; pedidos: number }> = {}

      // Generar todos los 12 meses del año
      for (let mes = 0; mes < 12; mes++) {
        const fecha = new Date(añoActual, mes, 1)
        const key = `${añoActual}-${String(mes + 1).padStart(2, "0")}`
        mesesMap[key] = {
          mes: fecha.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
          ventas: 0,
          cantidad: 0,
          pedidos: 0,
        }
      }

      // Completar con ventas reales
      ventasFiltradas.forEach((venta) => {
        try {
          const fecha = new Date(venta.fecha_venta)
          const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
          if (mesesMap[key]) {
            mesesMap[key].ventas += Number(venta.costo_total) || 0
            mesesMap[key].cantidad += Number(venta.cantidad_total) || 0
            mesesMap[key].pedidos += 1
          }
        } catch (error) {
          console.error("❌ Error procesando venta:", error, venta)
        }
      })

      resultado = Object.keys(mesesMap)
        .sort()
        .map((key) => ({
          periodo: mesesMap[key].mes,
          ventas: mesesMap[key].ventas,
          cantidad: mesesMap[key].cantidad,
          pedidos: mesesMap[key].pedidos,
          tipo: "mes",
        }))
    }

    console.log("📈 Resultado final:", resultado.length, "elementos")
    console.log("📈 Primeros 3 elementos:", resultado.slice(0, 3))

    return res.status(200).json({
      success: true,
      data: resultado,
      meta: {
        tipo: mostrarPorDias ? "dias" : "meses",
        total_registros: resultado.length,
        rango_dias: diferenciaDias,
        ventas_procesadas: ventasFiltradas.length,
      },
    })
  } catch (error) {
    console.error("❌ Error en getVentasMensuales:", error)
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

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

export const getProduccionPorJaula = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query

    let query = supabase.from("huevo").select(`
      *,
      jaula:id_jaula (
        id_jaula,
        codigo_jaula,
        descripcion
      )
    `)

    if (startDate) query = query.gte("fecha_recoleccion", startDate as string)
    if (endDate) query = query.lte("fecha_recoleccion", endDate as string)
    if (id_jaula) query = query.eq("id_jaula", id_jaula as string)

    const { data: huevos, error } = await query
    if (error) throw error

    const produccionPorJaula = huevos?.reduce((acc: any, registro: any) => {
      const jaulaId = registro.id_jaula
      const jaulaNombre = registro.jaula?.codigo_jaula || `Jaula ${jaulaId}`

      if (!acc[jaulaId]) {
        acc[jaulaId] = {
          jaula: jaulaNombre,
          produccion: 0,
          registros: 0,
        }
      }

      acc[jaulaId].produccion += registro.cantidad_total || 0
      acc[jaulaId].registros += 1

      return acc
    }, {})

    const resultado = Object.values(produccionPorJaula || {}).map((jaula: any) => ({
      ...jaula,
      // Colocar el promedio de huevos por las gallinas que posee la jaula (terminar de definir)
      eficiencia: Math.round((jaula.produccion / Math.max(jaula.registros, 1)) * 10), // Simulación de eficiencia
    }))

    return res.status(200).json({ success: true, data: resultado })
  } catch (error) {
    console.error("Error en getProduccionPorJaula:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}

export const getEstadisticasAves = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query

    console.log("🔍 Obteniendo estadísticas de aves con filtros:", { startDate, endDate, id_jaula })

    // 1. Total de aves activas (filtradas por jaula si aplica)
    let queryTotalAves = supabase.from("ave").select("*", { count: "exact", head: true }).eq("activo", true)

    if (id_jaula) {
      queryTotalAves = queryTotalAves.eq("id_jaula", id_jaula as string)
    }

    const { count: totalAves } = await queryTotalAves

    console.log("📊 Total aves activas:", totalAves)

    // 2. Aves fallecidas en el rango de fechas (filtradas por jaula si aplica)
    let queryFallecidas = supabase.from("aves_fallecidas").select(
      `
      *,
      ave:ave!inner(id_jaula, activo)
    `,
      { count: "exact", head: true },
    )

    if (startDate) queryFallecidas = queryFallecidas.gte("fecha", startDate as string)
    if (endDate) queryFallecidas = queryFallecidas.lte("fecha", endDate as string)
    if (id_jaula) queryFallecidas = queryFallecidas.eq("ave.id_jaula", id_jaula as string)

    const { count: avesFallecidas } = await queryFallecidas
    console.log("💀 Aves fallecidas en el período:", avesFallecidas)

    // 3. Aves en tratamiento clínico activo (filtradas por jaula si aplica)
    let queryTratamiento = supabase
      .from("ave_clinica")
      .select(`
        id_ave,
        fecha_inicio,
        fecha_fin,
        descripcion,
        ave:ave!inner(id_ave, activo, id_jaula)
      `)
      .is("fecha_fin", null) // Tratamientos sin fecha de fin (activos)
      .eq("ave.activo", true) // Solo aves que están activas

    if (id_jaula) {
      queryTratamiento = queryTratamiento.eq("ave.id_jaula", id_jaula as string)
    }

    const { data: avesEnTratamiento, error: errorTratamiento } = await queryTratamiento

    if (errorTratamiento) {
      console.error("❌ Error obteniendo aves en tratamiento:", errorTratamiento)
    }

    console.log("🏥 Aves en tratamiento activo:", avesEnTratamiento?.length || 0)

    // 4. Nacimientos en el rango de fechas (filtrados por jaula si aplica)
    let queryNacimientos = supabase.from("ave").select("*", { count: "exact", head: true }).eq("activo", true)

    if (startDate) queryNacimientos = queryNacimientos.gte("fecha_registro", startDate as string)
    if (endDate) queryNacimientos = queryNacimientos.lte("fecha_registro", endDate as string)
    if (id_jaula) queryNacimientos = queryNacimientos.eq("id_jaula", id_jaula as string)

    const { count: nacimientos } = await queryNacimientos
    console.log("🐣 Nacimientos en el período:", nacimientos)

    // 5. Calcular aves activas (total - fallecidas)
    const avesActivas = (totalAves || 0) - (avesFallecidas || 0)

    const resultado = [
      {
        categoria: "Aves Activas",
        cantidad: avesActivas,
        color: "#3B82F6",
      },
      {
        categoria: "Nacimientos",
        cantidad: nacimientos || 0,
        color: "#10B981",
      },
      {
        categoria: "Muertes",
        cantidad: avesFallecidas || 0,
        color: "#EF4444",
      },
      {
        categoria: "En Tratamiento",
        cantidad: avesEnTratamiento?.length || 0,
        color: "#F59E0B",
      },
    ]

    console.log("📈 Resultado final:", resultado)

    return res.status(200).json({ success: true, data: resultado })
  } catch (error) {
    console.error("❌ Error en getEstadisticasAves:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}

export const getUsoInsumos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query

    let query = supabase.from("implementos").select(`
      *,
      compras:id_compra (
        fecha,
        proveedor
      )
    `)

    if (startDate || endDate) {
      const { data: comprasEnRango } = await supabase
        .from("compras")
        .select("id_compra")
        .gte("fecha", startDate as string)
        .lte("fecha", endDate as string)

      const compraIds = comprasEnRango?.map((c) => c.id_compra) || []

      if (compraIds.length > 0) {
        query = query.in("id_compra", compraIds)
      } else {
        return res.status(200).json({ success: true, data: [] })
      }
    }

    const { data: implementos, error } = await query
    if (error) throw error

    const usoInsumos = implementos?.reduce((acc: any, i: any) => {
      const categoria = i.categoria || "Sin categoría"
      if (!acc[categoria]) acc[categoria] = { insumo: categoria, consumo: 0, costo: 0, items: 0 }
      acc[categoria].consumo += i.cantidad || 0
      acc[categoria].costo += (i.cantidad || 0) * (i.precio_unitario || 0)
      acc[categoria].items += 1
      return acc
    }, {})

    return res.status(200).json({ success: true, data: Object.values(usoInsumos || {}) })
  } catch (error) {
    console.error("Error en getUsoInsumos:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}

export const getVentasPorCliente = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query

    console.log("🔍 Obteniendo ventas por cliente con filtros:", { startDate, endDate, id_jaula })

    // Usar la estructura correcta con bandejas
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

    if (error) {
      console.error("❌ Error en consulta de ventas:", error)
      throw error
    }

    console.log("📊 Ventas obtenidas:", ventas?.length || 0)

    // Si no hay ventas, retornar array vacío
    if (!ventas || ventas.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      })
    }

    // Filtrar por jaula si se especifica
    let ventasFiltradas = ventas
    if (id_jaula) {
      try {
        const jaulaId = Number.parseInt(id_jaula as string)
        ventasFiltradas = ventas.filter((venta) =>
          venta.bandejas?.some((bandeja: any) =>
            bandeja.huevo?.some((huevoBandeja: any) => huevoBandeja.huevo?.id_jaula === jaulaId),
          ),
        )
        console.log("🏠 Ventas filtradas por jaula:", ventasFiltradas.length)
      } catch (filterError) {
        console.error("❌ Error filtrando por jaula:", filterError)
        // Continuar sin filtrar si hay error
      }
    }

    // Agrupar por cliente
    const ventasPorCliente = ventasFiltradas.reduce((acc: any, venta: any) => {
      const cliente = venta.cliente?.nombre || "Cliente desconocido"

      if (!acc[cliente]) {
        acc[cliente] = {
          cliente,
          ventas: 0,
          pedidos: 0,
          cantidad: 0,
        }
      }

      acc[cliente].ventas += Number(venta.costo_total) || 0
      acc[cliente].pedidos += 1
      acc[cliente].cantidad += Number(venta.cantidad_total) || 0

      return acc
    }, {})

    const resultado = Object.values(ventasPorCliente).sort((a: any, b: any) => b.ventas - a.ventas)

    console.log("📈 Resultado ventas por cliente:", resultado.length)

    return res.status(200).json({
      success: true,
      data: resultado,
    })
  } catch (error) {
    console.error("❌ Error en getVentasPorCliente:", error)
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const getEvolucionAves = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, id_jaula } = req.query

    // Consulta de nacimientos filtrada por jaula si aplica
    let queryNacimientos = supabase.from("ave").select("fecha_registro")
    if (startDate) queryNacimientos = queryNacimientos.gte("fecha_registro", startDate as string)
    if (endDate) queryNacimientos = queryNacimientos.lte("fecha_registro", endDate as string)
    if (id_jaula) queryNacimientos = queryNacimientos.eq("id_jaula", id_jaula as string)

    const { data: nacimientos } = await queryNacimientos

    // Consulta de muertes filtrada por jaula si aplica
    let queryMuertes = supabase.from("aves_fallecidas").select(`
      fecha,
      ave:ave!inner(id_jaula)
    `)
    if (startDate) queryMuertes = queryMuertes.gte("fecha", startDate as string)
    if (endDate) queryMuertes = queryMuertes.lte("fecha", endDate as string)
    if (id_jaula) queryMuertes = queryMuertes.eq("ave.id_jaula", id_jaula as string)

    const { data: muertes } = await queryMuertes

    // Crear estructura para todos los meses del año
    const fechaInicio = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1)
    const fechaFin = endDate ? new Date(endDate as string) : new Date()

    const mesesMap: Record<string, { mes: string; nacimientos: number; muertes: number }> = {}

    // Generar todos los meses en el rango
    const iterador = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1)
    while (iterador <= fechaFin) {
      const key = `${iterador.getFullYear()}-${String(iterador.getMonth() + 1).padStart(2, "0")}`
      mesesMap[key] = {
        mes: iterador.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
        nacimientos: 0,
        muertes: 0,
      }
      iterador.setMonth(iterador.getMonth() + 1)
    }

    // Completar con datos reales de nacimientos
    nacimientos?.forEach((a: any) => {
      const fecha = new Date(a.fecha_registro)
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
      if (mesesMap[key]) {
        mesesMap[key].nacimientos += 1
      }
    })

    // Completar con datos reales de muertes
    muertes?.forEach((a: any) => {
      const fecha = new Date(a.fecha)
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
      if (mesesMap[key]) {
        mesesMap[key].muertes += 1
      }
    })

    // Convertir a array ordenado
    const resultado = Object.keys(mesesMap)
      .sort()
      .map((key) => mesesMap[key])

    return res.status(200).json({ success: true, data: resultado })
  } catch (error) {
    console.error("Error en getEvolucionAves:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}

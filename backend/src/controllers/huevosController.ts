import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import {
  bulkHuevosSchema,
  huevoIdSchema,
  huevoDateRangeSchema,
  huevoJaulaIdSchema,
  huevoQuerySchema,
  huevoStatsSchema,
  validateHuevo,
  validateHuevoUpdate,
  type CreateHuevoInput,
  type UpdateHuevoInput,
} from "../schemas/huevoSchema"

// Función helper para normalizar fechas (evitar problemas de zona horaria)
const normalizeDateForStorage = (dateString: string): string => {
  // Asegurar que la fecha se guarde como YYYY-MM-DD sin conversión de zona horaria
  const date = new Date(dateString + "T00:00:00.000Z")
  return date.toISOString().split("T")[0]
}

const normalizeDateForDisplay = (dateString: string): string => {
  // Para mostrar la fecha correctamente sin conversión de zona horaria
  if (!dateString) return ""
  return dateString.split("T")[0]
}

// Obtener todos los huevos con validación de query parameters
export const getAllHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🥚 getAllHuevos called")

    // Validar query parameters
    const queryValidation = huevoQuerySchema.safeParse(req.query)
    if (!queryValidation.success) {
      console.log("❌ Invalid query parameters:", queryValidation.error.errors)
      res.status(400).json({
        error: "Parámetros de consulta inválidos",
        details: queryValidation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      })
      return
    }

    const { page = 1, limit = 50, id_jaula, fecha_inicio, fecha_fin } = queryValidation.data

    // Construir consulta base
    let query = supabase
      .from("huevo")
      .select(`
      *,
      jaula:id_jaula (
        id_jaula,
        descripcion
      )
    `)
      .order("fecha_recoleccion", { ascending: false })

    // Aplicar filtros si existen
    if (id_jaula) {
      query = query.eq("id_jaula", id_jaula)
    }

    if (fecha_inicio) {
      query = query.gte("fecha_recoleccion", normalizeDateForStorage(fecha_inicio))
    }

    if (fecha_fin) {
      query = query.lte("fecha_recoleccion", normalizeDateForStorage(fecha_fin))
    }

    // Aplicar paginación
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error("❌ Supabase error in getAllHuevos:", error)
      res.status(500).json({ error: "Error al obtener los huevos" })
      return
    }

    // Normalizar fechas para display
    const normalizedData = data?.map((huevo) => ({
      ...huevo,
      fecha_recoleccion: normalizeDateForDisplay(huevo.fecha_recoleccion),
      fecha_registro: normalizeDateForDisplay(huevo.fecha_registro),
    }))

    console.log(`✅ Found ${normalizedData?.length || 0} huevos`)

    res.status(200).json({
      success: true,
      data: normalizedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      message: "Huevos obtenidos exitosamente",
    })
  } catch (error) {
    console.error("❌ Error in getAllHuevos:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener huevo por ID con validación
export const getHuevoById = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`🥚 getHuevoById called with params:`, req.params)

    // Validar ID del huevo
    const idValidation = huevoIdSchema.safeParse(req.params)
    if (!idValidation.success) {
      console.log("❌ Invalid huevo ID:", idValidation.error.errors)
      res.status(400).json({
        error: "ID de huevo inválido",
        details: idValidation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      })
      return
    }

    const { id } = idValidation.data

    const { data, error } = await supabase
      .from("huevo")
      .select(`
      *,
      jaula:id_jaula (
        id_jaula,
        descripcion
      )
    `)
      .eq("id_huevo", id)
      .single()

    if (error) {
      console.error("❌ Supabase error in getHuevoById:", error)
      if (error.code === "PGRST116") {
        res.status(404).json({ error: "Huevo no encontrado" })
        return
      }
      res.status(500).json({ error: "Error al obtener el huevo" })
      return
    }

    // Normalizar fechas para display
    const normalizedData = {
      ...data,
      fecha_recoleccion: normalizeDateForDisplay(data.fecha_recoleccion),
      fecha_registro: normalizeDateForDisplay(data.fecha_registro),
    }

    console.log(`✅ Found huevo: ${normalizedData.id_huevo}`)
    res.status(200).json({ success: true, data: normalizedData, message: "Huevo obtenido exitosamente" })
  } catch (error) {
    console.error("❌ Error in getHuevoById:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Crear un nuevo huevo
export const createHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🥚 createHuevo called with data:", JSON.stringify(req.body, null, 2))

    const validation = validateHuevo(req.body)
    if (!validation.isValid) {
      console.log("❌ Validation failed:", validation.errors)
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: validation.errors,
      })
      return
    }

    const validatedData = validation.data as CreateHuevoInput

    const { data: jaulaExists, error: jaulaError } = await supabase
      .from("jaula")
      .select("id_jaula")
      .eq("id_jaula", validatedData.id_jaula)
      .single()

    if (jaulaError || !jaulaExists) {
      res.status(400).json({ error: "La jaula especificada no existe" })
      return
    }

    const normalizedFechaRecoleccion = normalizeDateForStorage(validatedData.fecha_recoleccion)

    const huevoData = {
      ...validatedData,
      fecha_recoleccion: normalizedFechaRecoleccion,
      registrado_por: 1, // TODO: get from auth context
      fecha_registro: new Date().toISOString().split("T")[0],
    }

    const { data, error } = await supabase
      .from("huevo")
      .insert([huevoData])
      .select(`
        *,
        jaula:id_jaula (
          id_jaula,
          descripcion
        )
      `)
      .single()

    if (error) {
      console.error("❌ Supabase error creating huevo:", error)
      res.status(500).json({ error: `Error al crear el registro de huevos: ${error.message}` })
      return
    }

    const normalizedResponse = {
      ...data,
      fecha_recoleccion: normalizeDateForDisplay(data.fecha_recoleccion),
      fecha_registro: normalizeDateForDisplay(data.fecha_registro),
    }

    console.log("✅ Huevo created successfully:", JSON.stringify(normalizedResponse, null, 2))
    res.status(201).json({ success: true, data: normalizedResponse, message: "Registro de huevos creado exitosamente" })
  } catch (error) {
    console.error("❌ Error in createHuevo:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Crear múltiples huevos (bulk) con validación
export const createBulkHuevos = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🥚 createBulkHuevos called")

    // Validar datos de entrada
    const validation = bulkHuevosSchema.safeParse(req.body)
    if (!validation.success) {
      console.log("❌ Bulk validation failed:", validation.error.errors)
      res.status(400).json({
        error: "Datos de entrada inválidos",
        details: validation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      })
      return
    }

    const { records } = validation.data

    // Validar cada registro individualmente
    const validatedRecords: CreateHuevoInput[] = []
    const validationErrors: string[] = []

    for (let i = 0; i < records.length; i++) {
      const recordValidation = validateHuevo(records[i])
      if (!recordValidation.isValid) {
        validationErrors.push(`Registro ${i + 1}: ${recordValidation.errors.join(", ")}`)
      } else {
        validatedRecords.push(recordValidation.data as CreateHuevoInput)
      }
    }

    if (validationErrors.length > 0) {
      res.status(400).json({
        error: "Algunos registros contienen errores",
        details: validationErrors,
      })
      return
    }

    // Verificar que todas las jaulas existen
    const jaulaIds = [...new Set(validatedRecords.map((record) => record.id_jaula))]
    const { data: existingJaulas, error: jaulasError } = await supabase
      .from("jaula")
      .select("id_jaula")
      .in("id_jaula", jaulaIds)

    if (jaulasError) {
      console.error("❌ Error checking jaulas:", jaulasError)
      res.status(500).json({ error: "Error al verificar las jaulas" })
      return
    }

    const existingJaulaIds = existingJaulas?.map((j) => j.id_jaula) || []
    const missingJaulas = jaulaIds.filter((id) => !existingJaulaIds.includes(id))

    if (missingJaulas.length > 0) {
      res.status(400).json({
        error: `Las siguientes jaulas no existen: ${missingJaulas.join(", ")}`,
      })
      return
    }

    // Preparar datos para inserción con fechas normalizadas
    const insertData = validatedRecords.map((record) => ({
      ...record,
      fecha_recoleccion: normalizeDateForStorage(record.fecha_recoleccion),
      registrado_por: 1, // TODO: get from auth context
      fecha_registro: new Date().toISOString().split("T")[0],
    }))

    const { data, error } = await supabase.from("huevo").insert(insertData).select()

    if (error) {
      console.error("❌ Error creating bulk huevos:", error)
      res.status(500).json({ error: "Error al crear los registros de huevos" })
      return
    }

    // Normalizar fechas para display
    const normalizedData = data?.map((huevo) => ({
      ...huevo,
      fecha_recoleccion: normalizeDateForDisplay(huevo.fecha_recoleccion),
      fecha_registro: normalizeDateForDisplay(huevo.fecha_registro),
    }))

    res.status(201).json({
      success: true,
      data: normalizedData,
      message: `${data.length} registros de huevos creados exitosamente`,
    })
  } catch (error) {
    console.error("❌ Error in createBulkHuevos:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Actualizar huevo con validación
export const updateHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`🥚 updateHuevo called with ID: ${req.params.id}`)

    // Validar ID del huevo
    const idValidation = huevoIdSchema.safeParse(req.params)
    if (!idValidation.success) {
      res.status(400).json({
        error: "ID de huevo inválido",
        details: idValidation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      })
      return
    }

    const { id } = idValidation.data

    // Validar datos de actualización
    const validation = validateHuevoUpdate(req.body)
    if (!validation.isValid) {
      console.log("❌ Update validation failed:", validation.errors)
      res.status(400).json({
        error: "Datos de actualización inválidos",
        details: validation.errors,
      })
      return
    }

    const updateData = validation.data as UpdateHuevoInput

    // Verificar que el huevo existe
    const { data: existingHuevo, error: fetchError } = await supabase
      .from("huevo")
      .select("*")
      .eq("id_huevo", id)
      .single()

    if (fetchError || !existingHuevo) {
      res.status(404).json({ error: "Huevo no encontrado" })
      return
    }

    // Si se está actualizando la jaula, verificar que existe
    if (updateData.id_jaula && updateData.id_jaula !== existingHuevo.id_jaula) {
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

    // Normalizar fecha si se está actualizando
    if (updateData.fecha_recoleccion) {
      updateData.fecha_recoleccion = normalizeDateForStorage(updateData.fecha_recoleccion)
    }

    // Verificar duplicados si se cambia jaula o fecha
    if (updateData.id_jaula || updateData.fecha_recoleccion) {
      const checkJaula = updateData.id_jaula || existingHuevo.id_jaula
      const checkFecha = updateData.fecha_recoleccion || existingHuevo.fecha_recoleccion

      const { data: duplicateRecord } = await supabase
        .from("huevo")
        .select("id_huevo")
        .eq("id_jaula", checkJaula)
        .eq("fecha_recoleccion", checkFecha)
        .neq("id_huevo", id)
        .single()

      if (duplicateRecord) {
        res.status(400).json({
          error: "Ya existe un registro de huevos para esta jaula en la fecha especificada",
        })
        return
      }
    }

    const { data, error } = await supabase
      .from("huevo")
      .update(updateData)
      .eq("id_huevo", id)
      .select(`
      *,
      jaula:id_jaula (
        id_jaula,
        descripcion
      )
    `)
      .single()

    if (error) {
      console.error("❌ Error updating huevo:", error)
      res.status(500).json({ error: "Error al actualizar el huevo" })
      return
    }

    // Normalizar fechas para display
    const normalizedData = {
      ...data,
      fecha_recoleccion: normalizeDateForDisplay(data.fecha_recoleccion),
      fecha_registro: normalizeDateForDisplay(data.fecha_registro),
    }

    res.status(200).json({ success: true, data: normalizedData, message: "Huevo actualizado exitosamente" })
  } catch (error) {
    console.error("❌ Error in updateHuevo:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Eliminar huevo con validación
export const deleteHuevo = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`🥚 deleteHuevo called with ID: ${req.params.id}`)

    // Validar ID del huevo
    const idValidation = huevoIdSchema.safeParse(req.params)
    if (!idValidation.success) {
      res.status(400).json({
        error: "ID de huevo inválido",
        details: idValidation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      })
      return
    }

    const { id } = idValidation.data

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
      console.error("❌ Error deleting huevo:", error)
      res.status(500).json({ error: "Error al eliminar el huevo" })
      return
    }

    res.status(200).json({ success: true, message: "Huevo eliminado exitosamente" })
  } catch (error) {
    console.error("❌ Error in deleteHuevo:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener huevos por rango de fechas con validación
export const getHuevosByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🥚 getHuevosByDateRange called with params:", req.params)

    // Validar rango de fechas
    const dateValidation = huevoDateRangeSchema.safeParse(req.params)
    if (!dateValidation.success) {
      res.status(400).json({
        error: "Rango de fechas inválido",
        details: dateValidation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      })
      return
    }

    const { start, end } = dateValidation.data

    const { data, error } = await supabase
      .from("huevo")
      .select(`
        *,
        jaula:id_jaula (
          id_jaula,
          descripcion
        )
      `)
      .gte("fecha_recoleccion", normalizeDateForStorage(start))
      .lte("fecha_recoleccion", normalizeDateForStorage(end))
      .order("fecha_recoleccion", { ascending: false })

    if (error) {
      console.error("❌ Error fetching huevos by date range:", error)
      res.status(500).json({ error: "Error al obtener los huevos por fecha" })
      return
    }

    // Normalizar fechas para display
    const normalizedData = data?.map((huevo) => ({
      ...huevo,
      fecha_recoleccion: normalizeDateForDisplay(huevo.fecha_recoleccion),
      fecha_registro: normalizeDateForDisplay(huevo.fecha_registro),
    }))

    res.status(200).json({ success: true, data: normalizedData, message: "Huevos obtenidos exitosamente" })
  } catch (error) {
    console.error("❌ Error in getHuevosByDateRange:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener huevos por jaula con validación
export const getHuevosByJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🥚 getHuevosByJaula called with params:", req.params)

    // Validar ID de jaula
    const jaulaValidation = huevoJaulaIdSchema.safeParse(req.params)
    if (!jaulaValidation.success) {
      res.status(400).json({
        error: "ID de jaula inválido",
        details: jaulaValidation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      })
      return
    }

    const { id_jaula } = jaulaValidation.data

    // Verificar que la jaula existe
    const { data: jaulaExists, error: jaulaError } = await supabase
      .from("jaula")
      .select("id_jaula")
      .eq("id_jaula", id_jaula)
      .single()

    if (jaulaError || !jaulaExists) {
      res.status(404).json({ error: "Jaula no encontrada" })
      return
    }

    const { data, error } = await supabase
      .from("huevo")
      .select(`
        *,
        jaula:id_jaula (
          id_jaula,
          descripcion
        )
      `)
      .eq("id_jaula", id_jaula)
      .order("fecha_recoleccion", { ascending: false })

    if (error) {
      console.error("❌ Error fetching huevos by jaula:", error)
      res.status(500).json({ error: "Error al obtener los huevos por jaula" })
      return
    }

    // Normalizar fechas para display
    const normalizedData = data?.map((huevo) => ({
      ...huevo,
      fecha_recoleccion: normalizeDateForDisplay(huevo.fecha_recoleccion),
      fecha_registro: normalizeDateForDisplay(huevo.fecha_registro),
    }))

    res.status(200).json({ success: true, data: normalizedData, message: "Huevos obtenidos exitosamente" })
  } catch (error) {
    console.error("❌ Error in getHuevosByJaula:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener estadísticas de huevos con validación
export const getHuevosStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📊 getHuevosStats called with query:", req.query)

    // Si hay parámetros de consulta, validarlos
    if (Object.keys(req.query).length > 0) {
      const statsValidation = huevoStatsSchema.safeParse(req.query)
      if (!statsValidation.success) {
        res.status(400).json({
          error: "Parámetros de estadísticas inválidos",
          details: statsValidation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
        })
        return
      }

      const { fecha_inicio, fecha_fin, id_jaula } = statsValidation.data

      // Construir consulta con filtros
      let query = supabase
        .from("huevo")
        .select("*")
        .gte("fecha_recoleccion", normalizeDateForStorage(fecha_inicio))
        .lte("fecha_recoleccion", normalizeDateForStorage(fecha_fin))

      if (id_jaula) {
        query = query.eq("id_jaula", id_jaula)
      }

      const { data: filteredHuevos, error: filteredError } = await query

      if (filteredError) {
        console.error("❌ Error fetching filtered huevos:", filteredError)
        res.status(500).json({ error: "Error al obtener estadísticas filtradas" })
        return
      }

      // Calcular estadísticas filtradas
      const totalEggsFiltered = filteredHuevos?.reduce((sum, record) => sum + (record.cantidad_total || 0), 0) || 0
      const totalRecordsFiltered = filteredHuevos?.length || 0

      // Calcular totales por tipo
      const totalCafe =
        filteredHuevos?.reduce(
          (sum, record) =>
            sum +
            (record.huevos_cafe_chico || 0) +
            (record.huevos_cafe_mediano || 0) +
            (record.huevos_cafe_grande || 0) +
            (record.huevos_cafe_jumbo || 0),
          0,
        ) || 0

      const totalBlanco =
        filteredHuevos?.reduce(
          (sum, record) =>
            sum +
            (record.huevos_blanco_chico || 0) +
            (record.huevos_blanco_mediano || 0) +
            (record.huevos_blanco_grande || 0) +
            (record.huevos_blanco_jumbo || 0),
          0,
        ) || 0

      const stats = {
        totalEggs: totalEggsFiltered,
        totalRecords: totalRecordsFiltered,
        totalCafe,
        totalBlanco,
        averagePerDay: totalRecordsFiltered > 0 ? Math.round(totalEggsFiltered / totalRecordsFiltered) : 0,
        dateRange: { fecha_inicio, fecha_fin },
        ...(id_jaula && { id_jaula }),
      }

      res.status(200).json({
        success: true,
        data: stats,
        message: "Estadísticas filtradas obtenidas exitosamente",
      })
      return
    }

    // Estadísticas generales (sin filtros)
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

    // Huevos de hoy (usando fecha normalizada)
    const today = new Date().toISOString().split("T")[0]
    const todayEggs = allHuevos?.filter((record) => normalizeDateForDisplay(record.fecha_recoleccion) === today) || []
    const totalEggsToday = todayEggs.reduce((sum, record) => sum + (record.cantidad_total || 0), 0)

    // Huevos de este mes
    const currentMonth = new Date().toISOString().slice(0, 7)
    const thisMonthEggs =
      allHuevos?.filter((record) => normalizeDateForDisplay(record.fecha_recoleccion)?.startsWith(currentMonth)) || []
    const totalEggsThisMonth = thisMonthEggs.reduce((sum, record) => sum + (record.cantidad_total || 0), 0)

    // Estadísticas por tipo
    const totalCafe =
      allHuevos?.reduce(
        (sum, record) =>
          sum +
          (record.huevos_cafe_chico || 0) +
          (record.huevos_cafe_mediano || 0) +
          (record.huevos_cafe_grande || 0) +
          (record.huevos_cafe_jumbo || 0),
        0,
      ) || 0

    const totalBlanco =
      allHuevos?.reduce(
        (sum, record) =>
          sum +
          (record.huevos_blanco_chico || 0) +
          (record.huevos_blanco_mediano || 0) +
          (record.huevos_blanco_grande || 0) +
          (record.huevos_blanco_jumbo || 0),
        0,
      ) || 0

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
      totalCafe,
      totalBlanco,
      averagePerDay: totalEggs > 0 ? Math.round(totalEggsCollected / totalEggs) : 0,
    }

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

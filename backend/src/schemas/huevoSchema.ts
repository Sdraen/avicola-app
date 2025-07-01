import { z } from "zod"

// Schema para crear huevo
export const createHuevoSchema = z
  .object({
    id_jaula: z.number().int().positive("ID de jaula debe ser un número positivo"),
    fecha_recoleccion: z.string().refine((date) => {
      const inputDate = new Date(date)
      const today = new Date()

      // Normalizar fechas para comparar solo día, mes y año
      const inputDateOnly = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate())
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      const diffDays = Math.floor((todayOnly.getTime() - inputDateOnly.getTime()) / (1000 * 3600 * 24))

      if (diffDays > 7) return false // No más de 7 días en el pasado
      if (diffDays < 0) return false // No en el futuro
      return true
    }, "Fecha de recolección debe ser hoy o hasta 7 días en el pasado"),
    cantidad_total: z
      .number()
      .int()
      .min(1, "Cantidad total debe ser al menos 1")
      .max(500, "Cantidad total no puede exceder 500"),
    huevos_cafe_chico: z.number().int().min(0, "Cantidad no puede ser negativa").optional().default(0),
    huevos_cafe_mediano: z.number().int().min(0, "Cantidad no puede ser negativa").optional().default(0),
    huevos_cafe_grande: z.number().int().min(0, "Cantidad no puede ser negativa").optional().default(0),
    huevos_cafe_jumbo: z.number().int().min(0, "Cantidad no puede ser negativa").optional().default(0),
    huevos_blanco_chico: z.number().int().min(0, "Cantidad no puede ser negativa").optional().default(0),
    huevos_blanco_mediano: z.number().int().min(0, "Cantidad no puede ser negativa").optional().default(0),
    huevos_blanco_grande: z.number().int().min(0, "Cantidad no puede ser negativa").optional().default(0),
    huevos_blanco_jumbo: z.number().int().min(0, "Cantidad no puede ser negativa").optional().default(0),
    observaciones: z.string().max(500, "Observaciones no pueden exceder 500 caracteres").optional(),
  })
  .refine(
    (data) => {
      const totalClasificado =
        data.huevos_cafe_chico +
        data.huevos_cafe_mediano +
        data.huevos_cafe_grande +
        data.huevos_cafe_jumbo +
        data.huevos_blanco_chico +
        data.huevos_blanco_mediano +
        data.huevos_blanco_grande +
        data.huevos_blanco_jumbo

      return totalClasificado <= data.cantidad_total
    },
    {
      message: "Los huevos clasificados no pueden exceder la cantidad total",
      path: ["cantidad_total"],
    },
  )

// Schema para actualizar huevo
export const updateHuevoSchema = z
  .object({
    id_jaula: z.number().int().positive("ID de jaula debe ser un número positivo").optional(),
    fecha_recoleccion: z
      .string()
      .refine((date) => {
        const inputDate = new Date(date)
        const today = new Date()

        // Normalizar fechas para comparar solo día, mes y año
        const inputDateOnly = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate())
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const diffDays = Math.floor((todayOnly.getTime() - inputDateOnly.getTime()) / (1000 * 3600 * 24))

        if (diffDays > 7) return false // No más de 7 días en el pasado
        if (diffDays < 0) return false // No en el futuro
        return true
      }, "Fecha de recolección debe ser hoy o hasta 7 días en el pasado")
      .optional(),
    cantidad_total: z
      .number()
      .int()
      .min(1, "Cantidad total debe ser al menos 1")
      .max(500, "Cantidad total no puede exceder 500")
      .optional(),
    huevos_cafe_chico: z.number().int().min(0, "Cantidad no puede ser negativa").optional(),
    huevos_cafe_mediano: z.number().int().min(0, "Cantidad no puede ser negativa").optional(),
    huevos_cafe_grande: z.number().int().min(0, "Cantidad no puede ser negativa").optional(),
    huevos_cafe_jumbo: z.number().int().min(0, "Cantidad no puede ser negativa").optional(),
    huevos_blanco_chico: z.number().int().min(0, "Cantidad no puede ser negativa").optional(),
    huevos_blanco_mediano: z.number().int().min(0, "Cantidad no puede ser negativa").optional(),
    huevos_blanco_grande: z.number().int().min(0, "Cantidad no puede ser negativa").optional(),
    huevos_blanco_jumbo: z.number().int().min(0, "Cantidad no puede ser negativa").optional(),
    observaciones: z.string().max(500, "Observaciones no pueden exceder 500 caracteres").optional(),
  })
  .refine(
    (data) => {
      if (!data.cantidad_total) return true // Si no se actualiza cantidad_total, no validar

      const totalClasificado =
        (data.huevos_cafe_chico || 0) +
        (data.huevos_cafe_mediano || 0) +
        (data.huevos_cafe_grande || 0) +
        (data.huevos_cafe_jumbo || 0) +
        (data.huevos_blanco_chico || 0) +
        (data.huevos_blanco_mediano || 0) +
        (data.huevos_blanco_grande || 0) +
        (data.huevos_blanco_jumbo || 0)

      return totalClasificado <= data.cantidad_total
    },
    {
      message: "Los huevos clasificados no pueden exceder la cantidad total",
      path: ["cantidad_total"],
    },
  )

// Schema para bulk creation
export const bulkHuevosSchema = z.object({
  records: z
    .array(createHuevoSchema)
    .min(1, "Debe proporcionar al menos un registro")
    .max(50, "No se pueden crear más de 50 registros a la vez"),
})

// Schema para validar ID de huevo
export const huevoIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID debe ser un número válido").transform(Number),
})

// Schema para validar rango de fechas
export const huevoDateRangeSchema = z
  .object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de inicio debe tener formato YYYY-MM-DD"),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de fin debe tener formato YYYY-MM-DD"),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.start)
      const endDate = new Date(data.end)
      return startDate <= endDate
    },
    {
      message: "Fecha de inicio debe ser anterior o igual a fecha de fin",
      path: ["end"],
    },
  )

// Cambiar el huevoJaulaIdSchema para que coincida con el parámetro de la URL
export const huevoJaulaIdSchema = z.object({
  id_jaula: z.string().regex(/^\d+$/, "ID de jaula debe ser un número válido").transform(Number),
})

// Schema para query parameters de búsqueda
export const huevoQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, "Página debe ser un número").transform(Number).optional(),
  limit: z.string().regex(/^\d+$/, "Límite debe ser un número").transform(Number).optional(),
  id_jaula: z.string().regex(/^\d+$/, "ID de jaula debe ser un número").transform(Number).optional(),
  fecha_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe tener formato YYYY-MM-DD")
    .optional(),
  fecha_fin: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe tener formato YYYY-MM-DD")
    .optional(),
})

// Schema para estadísticas de huevos
export const huevoStatsSchema = z.object({
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de inicio debe tener formato YYYY-MM-DD"),
  fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de fin debe tener formato YYYY-MM-DD"),
  id_jaula: z.string().regex(/^\d+$/, "ID de jaula debe ser un número").transform(Number).optional(),
})

// Funciones de validación (manteniendo compatibilidad con el código existente)
export const validateHuevo = (data: any) => {
  try {
    const validatedData = createHuevoSchema.parse(data)
    return {
      isValid: true,
      data: validatedData,
      errors: [],
    }
  } catch (error: any) {
    return {
      isValid: false,
      data: null,
      errors: error.errors?.map((err: any) => `${err.path.join(".")}: ${err.message}`) || [error.message],
    }
  }
}

export const validateHuevoUpdate = (data: any) => {
  try {
    const validatedData = updateHuevoSchema.parse(data)
    return {
      isValid: true,
      data: validatedData,
      errors: [],
    }
  } catch (error: any) {
    return {
      isValid: false,
      data: null,
      errors: error.errors?.map((err: any) => `${err.path.join(".")}: ${err.message}`) || [error.message],
    }
  }
}

// Tipos TypeScript
export type CreateHuevoInput = z.infer<typeof createHuevoSchema>
export type UpdateHuevoInput = z.infer<typeof updateHuevoSchema>
export type BulkHuevosInput = z.infer<typeof bulkHuevosSchema>
export type HuevoQueryInput = z.infer<typeof huevoQuerySchema>
export type HuevoStatsInput = z.infer<typeof huevoStatsSchema>

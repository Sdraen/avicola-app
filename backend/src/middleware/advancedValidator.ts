import type { Request, Response, NextFunction } from "express"
import { supabase } from "../config/supabase"

export class AdvancedValidator {
  // Validar que un registro existe en otra tabla
  static async existeValidacion(table: string, field: string, value: any): Promise<boolean> {
    const { data, error } = await supabase.from(table).select(field).eq(field, value).single()

    return !error && !!data
  }

  // Validar unicidad en una tabla
  static async unicidadValidacion(table: string, field: string, value: any, excludeId?: number): Promise<boolean> {
    let query = supabase.from(table).select(field).eq(field, value)

    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query.single()
    return error?.code === "PGRST116" // No rows found = unique
  }

  // Validar reglas de negocio específicas
  static async validarReglasNegocio(entity: string, data: any): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    switch (entity) {
      case "ave":
        // No más de 20 aves por jaula
        const { count: avesEnJaula } = await supabase
          .from("ave")
          .select("*", { count: "exact", head: true })
          .eq("id_jaula", data.id_jaula)

        if (avesEnJaula && avesEnJaula >= 20) {
          errors.push("La jaula ha alcanzado su capacidad máxima (20 aves)")
        }

        // Color de anillo único por jaula
        const { data: aveConMismoColor } = await supabase
          .from("ave")
          .select("id_ave")
          .eq("id_jaula", data.id_jaula)
          .eq("color_anillo", data.color_anillo)
          .single()

        if (aveConMismoColor) {
          errors.push("Ya existe un ave con ese color de anillo en la jaula")
        }
        break

      case "huevo":
        // Máximo 1 huevo por ave por día
        const { data: huevoHoy } = await supabase
          .from("huevo")
          .select("id_huevo")
          .eq("id_ave", data.id_ave)
          .eq("fecha_recoleccion", data.fecha_recoleccion)
          .single()

        if (huevoHoy) {
          errors.push("Ya se registró un huevo para esta ave en la fecha indicada")
        }

        // Verificar que el ave esté en estado de puesta
        const { data: ave } = await supabase
          .from("ave")
          .select("estado_puesta, edad")
          .eq("id_ave", data.id_ave)
          .single()

        if (ave?.estado_puesta !== "activa") {
          errors.push("El ave no está en estado de puesta activa")
        }
        break

      case "venta":
        // Verificar stock disponible
        const { data: bandeja } = await supabase
          .from("bandeja")
          .select("cantidad_huevos")
          .eq("codigo_barras", data.codigo_barras)
          .single()

        if (!bandeja || bandeja.cantidad_huevos < data.cantidad_total) {
          errors.push("Stock insuficiente en la bandeja")
        }

        // Verificar límite de crédito del cliente
        const { data: cliente } = await supabase
          .from("cliente")
          .select("limite_credito")
          .eq("id_cliente", data.id_cliente)
          .single()

        if (cliente?.limite_credito && data.costo_total > cliente.limite_credito) {
          errors.push("La venta excede el límite de crédito del cliente")
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// Middleware para validaciones avanzadas
export const validacionAvanzada = (entity: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = await AdvancedValidator.validarReglasNegocio(entity, req.body)

      if (!validation.isValid) {
        res.status(400).json({
          error: "Validation failed",
          errors: validation.errors,
        })
        return
      }

      next()
    } catch (error) {
      res.status(500).json({ error: "Validation error" })
    }
  }
}

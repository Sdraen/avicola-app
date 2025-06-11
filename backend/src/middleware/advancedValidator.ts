import { supabase } from "../config/supabase"

export class AdvancedValidator {
  // ✅ Validar que una raza está permitida
  static async validateRazaPermitida(raza: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("razas_permitidas")
      .select("id_raza")
      .eq("nombre", raza)
      .eq("activa", true)
      .single()

    return !error && !!data
  }

  // ✅ Validar color de anillo único globalmente
  static async validateColorAnilloUnique(color_anillo: string, excludeId?: number): Promise<boolean> {
    let query = supabase.from("ave").select("id_ave").eq("color_anillo", color_anillo)

    if (excludeId) {
      query = query.neq("id_ave", excludeId)
    }

    const { data, error } = await query.single()
    return error?.code === "PGRST116" // No existe = único
  }

  // ✅ Validar registro único por fecha
  static async validateFechaUnica(fecha: string, excludeId?: number): Promise<boolean> {
    let query = supabase.from("registro_huevos_diario").select("id").eq("fecha_recoleccion", fecha)

    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query.single()
    return error?.code === "PGRST116"
  }

  static async validateBusinessRules(entity: string, data: any): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    switch (entity) {
      case "ave":
        // ✅ Color de anillo único globalmente
        const colorUnico = await this.validateColorAnilloUnique(data.color_anillo, data.id_ave)
        if (!colorUnico) {
          errors.push("El color de anillo ya está en uso por otra gallina")
        }

        // ✅ Raza debe estar permitida
        const razaValida = await this.validateRazaPermitida(data.raza)
        if (!razaValida) {
          errors.push("La raza no está permitida o está inactiva")
        }

        // Capacidad máxima por jaula (mantener)
        const { count: avesEnJaula } = await supabase
          .from("ave")
          .select("*", { count: "exact", head: true })
          .eq("id_jaula", data.id_jaula)

        if (avesEnJaula && avesEnJaula >= 20) {
          errors.push("La jaula ha alcanzado su capacidad máxima (20 aves)")
        }
        break

      case "registro_huevos":
        // ✅ Máximo 1000 huevos por día
        if (data.cantidad_total > 1000) {
          errors.push("Máximo 1000 huevos por día permitidos")
        }

        // ✅ Solo un registro por fecha
        const fechaUnica = await this.validateFechaUnica(data.fecha_recoleccion, data.id)
        if (!fechaUnica) {
          errors.push("Ya existe un registro para esta fecha")
        }

        // ✅ Suma de clasificación no debe exceder total
        const totalClasificado =
          (data.huevos_cafe_chico || 0) +
          (data.huevos_cafe_mediano || 0) +
          (data.huevos_cafe_grande || 0) +
          (data.huevos_cafe_jumbo || 0) +
          (data.huevos_blanco_chico || 0) +
          (data.huevos_blanco_mediano || 0) +
          (data.huevos_blanco_grande || 0) +
          (data.huevos_blanco_jumbo || 0)

        if (totalClasificado > data.cantidad_total) {
          errors.push(
            `Los huevos clasificados (${totalClasificado}) no pueden exceder el total (${data.cantidad_total})`,
          )
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import { validateAveNacimiento } from "../schemas/validateAveNacimiento"

// Obtener todas las incubaciones con relaciones
export const getAllIncubaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("incubacion")
      .select(`
        *,
        incubadora:incubadora(*),
        nacimiento:nacimiento(*)
      `)
      .order("fecha_inicio", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching incubations:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtener incubación por ID
export const getIncubacionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("incubacion")
      .select(`
        *,
        incubadora:incubadora(*),
        nacimiento:nacimiento(*)
      `)
      .eq("id_incubacion", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Incubación no encontrada" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching incubation:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Crear incubación
export const createIncubacion = async (req: Request, res: Response): Promise<void> => {
  try {
    // 🔍 Log para depurar el contenido del body recibido
    console.log("🔍 Body recibido:", req.body);
    const {
      lote,
      temperatura,
      cantidad_huevos,
      fecha_inicio,
      fecha_estimada_eclosion,
      observaciones,
      id_incubadora,

    } = req.body;

    if (
      !lote ||
      temperatura === undefined ||
      cantidad_huevos === undefined ||
      !fecha_inicio ||
      !fecha_estimada_eclosion ||
      !id_incubadora
    ) {
      res.status(400).json({ error: "Todos los campos requeridos deben ser enviados" });
      return;
    }

    const { data, error } = await supabase
      .from("incubacion")
      .insert([
        {
          lote,
          temperatura,
          cantidad_huevos,
          fecha_inicio,
          fecha_estimada_eclosion,
          observaciones,
          id_incubadora,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Error de Supabase:", error);  
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creando incubación:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Actualizar incubación
export const updateIncubacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from("incubacion")
      .update(updates)
      .eq("id_incubacion", id)
      .select()
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Incubación no encontrada" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating incubation:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Eliminar incubación
export const deleteIncubacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const { error } = await supabase.from("incubacion").delete().eq("id_incubacion", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Incubación eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting incubation:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtener incubaciones activas
export const getActiveIncubaciones = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("incubacion")
      .select(`
        *,
        incubadora:incubadora(*)
      `)
      .eq("estado", "activo")
      .order("fecha_inicio", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching active incubations:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtener incubaciones por incubadora
export const getIncubacionesByIncubadora = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_incubadora } = req.params
    const { data, error } = await supabase
      .from("incubacion")
      .select(`
        *,
        nacimiento:nacimiento(*)
      `)
      .eq("id_incubadora", id_incubadora)
      .order("fecha_inicio", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching incubations by incubator:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtener estadísticas de incubación
export const getIncubacionStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { count: totalIncubations } = await supabase.from("incubacion").select("*", { count: "exact", head: true })

    const { count: activeIncubations } = await supabase
      .from("incubacion")
      .select("*", { count: "exact", head: true })
      .eq("estado", "activo")

    const { count: completedIncubations } = await supabase
      .from("incubacion")
      .select("*", { count: "exact", head: true })
      .eq("estado", "completado")

    const { count: totalBirths } = await supabase.from("nacimiento").select("*", { count: "exact", head: true })

    const successRate =
      totalIncubations && totalIncubations > 0 ? Math.round(((totalBirths || 0) / totalIncubations) * 100) : 0

    res.status(200).json({
      totalIncubations: totalIncubations || 0,
      activeIncubations: activeIncubations || 0,
      completedIncubations: completedIncubations || 0,
      totalBirths: totalBirths || 0,
      successRate,
    })
  } catch (error) {
    console.error("Error fetching incubation statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Registrar nacimiento y crear ave automáticamente
export const registrarNacimientoYCrearAve = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id_incubacion,
      fecha_nacimiento,
      sexo,
      observaciones,
      raza,
      id_jaula,
      id_anillo,
      color_anillo,
    } = req.body

    const validation = validateAveNacimiento({
      id_incubacion,
      fecha_nacimiento,
      sexo,
      raza,
      id_jaula,
      id_anillo,
      color_anillo,
    })

    if (!validation.isValid) {
      res.status(400).json({ error: validation.errors })
      return
    }

    const { data: nacimiento, error: errorNacimiento } = await supabase
      .from("nacimiento")
      .insert([{ id_incubacion, fecha_nacimiento, sexo, observaciones }])
      .select()
      .single()

    if (errorNacimiento) {
      res.status(400).json({ error: errorNacimiento.message })
      return
    }

    const { data: ave, error: errorAve } = await supabase
      .from("ave")
      .insert([
        {
          id_jaula,
          id_anillo,
          color_anillo,
          edad: "0",
          estado_puesta: "no_aplica",
          raza,
          fecha_registro: fecha_nacimiento,
        },
      ])
      .select()
      .single()

    if (errorAve) {
      if (errorAve.code === "23505" || errorAve.message.includes("duplicate")) {
        res.status(409).json({ error: "Ya existe un ave con ese id_anillo y color" })
      } else {
        res.status(400).json({ error: errorAve.message })
      }
      return
    }

    res.status(201).json({
      message: "Nacimiento y ave registrados correctamente",
      nacimiento,
      ave,
    })
  } catch (error) {
    console.error("Error al registrar nacimiento y ave:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

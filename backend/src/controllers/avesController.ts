import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

// Obtener todas las aves
export const getAllAves = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from("ave").select(`
        *,
        jaula:jaula(*)
      `)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching birds:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Obtiene una ave por su ID
export const getAveById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("ave")
      .select(`
        *,
        jaula:jaula(*)
      `)
      .eq("id_ave", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Bird not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching bird:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Crea una nueva ave
export const createAve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_jaula, id_anillo, color_anillo, edad, estado_puesta, raza } = req.body;

    // Validación básica
    if (!id_jaula || !id_anillo || !color_anillo || !edad || !estado_puesta || !raza) {
      res.status(400).json({ error: "Todos los campos son obligatorios" });
      return;
    }

    // Validación de longitud de id_anillo
    if (typeof id_anillo !== "string" || id_anillo.length < 1 || id_anillo.length > 10) {
      res.status(400).json({ error: "El id_anillo debe tener entre 1 y 10 caracteres" });
      return;
    }

    // Intentar insertar en Supabase
    const { data, error } = await supabase
      .from("ave")
      .insert([
        {
          id_jaula,
          id_anillo,
          color_anillo,
          edad,
          estado_puesta,
          raza,
          fecha_registro: new Date().toISOString().split("T")[0],
        },
      ])
      .select()
      .single();

    // Captura de error por duplicado (único)
    if (error) {
      if (error.message.includes("duplicate key value") || error.code === "23505") {
        res.status(409).json({ error: "Ya existe una gallina con ese id_anillo" });
      } else {
        res.status(400).json({ error: error.message });
      }
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creando la ave:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Actualiza una ave existente
export const updateAve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Log para depuración
    console.log("ID:", id);
    console.log("Payload recibido:", updates);

    // Validación de id_anillo si se incluye
    if (updates.id_anillo) {
      if (
        typeof updates.id_anillo !== "string" ||
        updates.id_anillo.length < 1 ||
        updates.id_anillo.length > 10
      ) {
        res.status(400).json({ error: "El id_anillo debe tener entre 1 y 10 caracteres" });
        return;
      }
    }

    // Campos que no deben enviarse al update
    const forbiddenFields = ["id_ave", "fecha_registro", "jaula"];
    for (const field of forbiddenFields) {
      delete updates[field];
    }

    const { data, error } = await supabase
      .from("ave")
      .update(updates)
      .eq("id_ave", Number(id)) // conversión explícita
      .select()
      .single();

    if (error) {
      if (error.message.includes("duplicate key value") || error.code === "23505") {
        res.status(409).json({ error: "Ya existe otra gallina con ese id_anillo" });
      } else {
        console.error("Error de Supabase:", error);
        res.status(400).json({ error: error.message });
      }
      return;
    }

    if (!data) {
      res.status(404).json({ error: "Gallina no encontrada" });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error inesperado al actualizar ave:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteAve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const { error } = await supabase.from("ave").delete().eq("id_ave", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Bird deleted successfully" })
  } catch (error) {
    console.error("Error deleting bird:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getAvesByJaula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_jaula } = req.params
    const { data, error } = await supabase.from("ave").select("*").eq("id_jaula", id_jaula)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching birds by cage:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getAvesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { count: totalBirds } = await supabase.from("ave").select("*", { count: "exact", head: true })

    const { data: layingStats } = await supabase.from("ave").select("estado_puesta").neq("estado_puesta", null)
    const { data: breedStats } = await supabase.from("ave").select("raza").neq("raza", null)

    const currentMonth = new Date().toISOString().slice(0, 7)
    const { count: deceasedThisMonth } = await supabase
      .from("aves_fallecidas")
      .select("*", { count: "exact", head: true })
      .gte("fecha", `${currentMonth}-01`)

    res.status(200).json({
      totalBirds: totalBirds || 0,
      deceasedThisMonth: deceasedThisMonth || 0,
      layingStats: layingStats || [],
      breedStats: breedStats || [],
    })
  } catch (error) {
    console.error("Error fetching bird statistics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

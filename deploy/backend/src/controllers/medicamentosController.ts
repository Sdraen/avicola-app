import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const getAllMedicamentos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from("medicamento").select("*").order("nombre")

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching medications:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getMedicamentoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("medicamento")
      .select(`
        *,
        estanques:estanque_medicamento(
          id_esmed,
          id_estanque,
          fecha_administracion,
          estanque:estanque(*)
        )
      `)
      .eq("id_medicamento", id)
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Medication not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching medication:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const createMedicamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, dosis } = req.body

    if (!nombre) {
      res.status(400).json({ error: "nombre is required" })
      return
    }

    const { data, error } = await supabase
      .from("medicamento")
      .insert([
        {
          nombre,
          dosis,
        },
      ])
      .select()
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Error creating medication:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const updateMedicamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from("medicamento")
      .update(updates)
      .eq("id_medicamento", id)
      .select()
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ error: "Medication not found" })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error updating medication:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteMedicamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Check if medication is in use
    const { count: usageCount } = await supabase
      .from("estanque_medicamento")
      .select("*", { count: "exact", head: true })
      .eq("id_medicamento", id)

    if (usageCount && usageCount > 0) {
      res.status(400).json({
        error: "Cannot delete medication that has been used. Consider deactivating instead.",
      })
      return
    }

    const { error } = await supabase.from("medicamento").delete().eq("id_medicamento", id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Medication deleted successfully" })
  } catch (error) {
    console.error("Error deleting medication:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const aplicarMedicamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_medicamento, id_estanque, fecha_administracion = new Date().toISOString().split("T")[0] } = req.body

    if (!id_medicamento || !id_estanque) {
      res.status(400).json({
        error: "id_medicamento and id_estanque are required",
      })
      return
    }

    const { data, error } = await supabase
      .from("estanque_medicamento")
      .insert([
        {
          id_medicamento,
          id_estanque,
          fecha_administracion,
        },
      ])
      .select()
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Error applying medication:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getMedicamentoAplicaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_medicamento } = req.params
    const { data, error } = await supabase
      .from("estanque_medicamento")
      .select(`
        *,
        estanque:estanque(*),
        medicamento:medicamento(*)
      `)
      .eq("id_medicamento", id_medicamento)
      .order("fecha_administracion", { ascending: false })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching medication applications:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const searchMedicamentos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.params
    const { data, error } = await supabase.from("medicamento").select("*").ilike("nombre", `%${query}%`).order("nombre")

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error searching medications:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

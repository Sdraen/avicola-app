import { z } from "zod"

// Schema base para ave
const baseAveSchema = z.object({
  id_jaula: z.number().int().positive("ID de jaula debe ser un número positivo"),
  id_anillo: z
    .string()
    .min(1, "ID anillo es obligatorio")
    .max(10, "ID anillo no puede tener más de 10 caracteres")
    .regex(/^[1-9][0-9]*$/, "ID anillo debe ser un número entero positivo mayor que cero"),
  color_anillo: z
    .string()
    .min(3, "Color anillo debe tener al menos 3 caracteres")
    .max(20, "Color anillo no puede tener más de 20 caracteres"),
  edad: z.union([
    z.number().int().min(1, "Edad debe ser mayor a 0").max(300, "Edad no puede ser mayor a 300 semanas"),
    z.string().min(1, "Edad es obligatoria").max(50, "Edad no puede tener más de 50 caracteres"),
  ]),
  estado_puesta: z.enum(["activa", "inactiva", "en_desarrollo"], {
    errorMap: () => ({ message: "Estado de puesta debe ser: activa, inactiva o en_desarrollo" }),
  }),
  raza: z
    .string()
    .min(2, "Raza debe tener al menos 2 caracteres")
    .max(50, "Raza no puede tener más de 50 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\u00f1\u00d1\s-]+$/, "Raza solo puede contener letras, espacios y guiones"),
})

// Schema para crear ave
export const createAveSchema = baseAveSchema

// Schema para actualizar ave (todos los campos opcionales excepto validaciones)
export const updateAveSchema = baseAveSchema.partial()

// Schema para validar ID en parámetros
export const aveIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID debe ser un número válido"),
})

// Schema para validar ID de jaula en parámetros
export const jaulaIdSchema = z.object({
  id_jaula: z.string().regex(/^\d+$/, "ID de jaula debe ser un número válido"),
})

// Tipos TypeScript
export type CreateAveData = z.infer<typeof createAveSchema>
export type UpdateAveData = z.infer<typeof updateAveSchema>
export type AveIdParams = z.infer<typeof aveIdSchema>
export type JaulaIdParams = z.infer<typeof jaulaIdSchema>

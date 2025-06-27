import { z } from "zod"

// Schema para crear una jaula (con tu validación personalizada de codigo_jaula)
export const createJaulaSchema = z.object({
  codigo_jaula: z
    .string({
      required_error: "El código de jaula es obligatorio",
      invalid_type_error: "El código debe ser una cadena numérica",
    })
    .regex(/^\d{1,6}$/, "Debe contener entre 1 y 6 dígitos")
    .refine((val) => Number.parseInt(val, 10) >= 1, {
      message: "El número debe ser mayor o igual a 1",
    }),

  descripcion: z
    .string({
      invalid_type_error: "La descripción debe ser texto",
    })
    .max(255, "La descripción no puede tener más de 255 caracteres")
    .optional(),
})

// Schema para actualizar una jaula (codigo_jaula opcional pero con mismas validaciones)
export const updateJaulaSchema = z.object({
  codigo_jaula: z
    .string({
      invalid_type_error: "El código debe ser una cadena numérica",
    })
    .regex(/^\d{1,6}$/, "Debe contener entre 1 y 6 dígitos")
    .refine((val) => Number.parseInt(val, 10) >= 1, {
      message: "El número debe ser mayor o igual a 1",
    })
    .optional(),

  descripcion: z
    .string({
      invalid_type_error: "La descripción debe ser texto",
    })
    .max(255, "La descripción no puede tener más de 255 caracteres")
    .optional(),
})

// Schema para servicios de higiene (sin cambios)
export const createServicioHigieneSchema = z.object({
  tipo: z.enum(["limpieza", "desinfeccion", "fumigacion", "mantenimiento"], {
    required_error: "El tipo de servicio es obligatorio",
    invalid_type_error: "Tipo de servicio inválido",
  }),

  fecha: z
    .string({
      invalid_type_error: "La fecha debe ser texto en formato YYYY-MM-DD",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD")
    .refine((date) => {
      const parsedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return parsedDate <= today
    }, "La fecha no puede ser futura")
    .optional(),

  descripcion: z
    .string({
      invalid_type_error: "La descripción debe ser texto",
    })
    .max(255, "La descripción no puede tener más de 255 caracteres")
    .optional(),
})

// Tipos TypeScript derivados de los schemas
export type CreateJaulaInput = z.infer<typeof createJaulaSchema>
export type UpdateJaulaInput = z.infer<typeof updateJaulaSchema>
export type CreateServicioHigieneInput = z.infer<typeof createServicioHigieneSchema>

import { z } from "zod"
import { VALIDATION_LIMITS, VALID_ENUMS } from "./constants"

// Schema base para cliente
const baseClienteSchema = z.object({
  nombre: z
    .string()
    .min(VALIDATION_LIMITS.NOMBRE_MIN, `Nombre debe tener al menos ${VALIDATION_LIMITS.NOMBRE_MIN} caracteres`)
    .max(VALIDATION_LIMITS.NOMBRE_MAX, `Nombre no puede exceder ${VALIDATION_LIMITS.NOMBRE_MAX} caracteres`)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Nombre solo puede contener letras, espacios y acentos")
    .transform((val) => val.trim()),

  direccion: z
    .string()
    .min(5, "Dirección debe tener al menos 5 caracteres")
    .max(
      VALIDATION_LIMITS.DESCRIPCION_MAX,
      `Dirección no puede exceder ${VALIDATION_LIMITS.DESCRIPCION_MAX} caracteres`,
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),

  telefono: z
    .string()
    .regex(/^\d{8,15}$/, "Teléfono debe contener entre 8 y 15 dígitos")
    .optional()
    .or(z.literal("")),

  tipo_cliente: z
    .enum(VALID_ENUMS.TIPO_CLIENTE as [string, ...string[]], {
      errorMap: () => ({ message: `Tipo de cliente debe ser uno de: ${VALID_ENUMS.TIPO_CLIENTE.join(", ")}` }),
    })
    .optional(),
})

// Schema para crear cliente
export const createClienteSchema = baseClienteSchema.extend({
  nombre: baseClienteSchema.shape.nombre, // nombre es requerido
})

// Schema para actualizar cliente
export const updateClienteSchema = baseClienteSchema.partial()

// Schema para validar ID de cliente
export const clienteIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID debe ser un número válido")
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => val > 0, "ID debe ser mayor a 0"),
})

// Schema para búsqueda
export const searchClienteSchema = z.object({
  query: z
    .string()
    .min(1, "Término de búsqueda requerido")
    .max(100, "Término de búsqueda muy largo")
    .transform((val) => val.trim()),
})

// Tipos TypeScript
export type CreateClienteInput = z.infer<typeof createClienteSchema>
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>
export type ClienteIdInput = z.infer<typeof clienteIdSchema>
export type SearchClienteInput = z.infer<typeof searchClienteSchema>

import type { Request, Response, NextFunction } from "express"
import { getValidator } from "../schemas"
import { sendValidationError } from "../utils/responseHelper"

// Universal validation middleware that works with any entity
export const validateEntityData = (entity: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validator = getValidator(entity)

      if (!validator) {
        console.warn(`No validator found for entity: ${entity}`)
        next()
        return
      }

      // Apply default values
      const dataWithDefaults = applyDefaults(req.body, entity)
      req.body = dataWithDefaults

      // Validate data
      const validationResult = validator(dataWithDefaults)

      if (!validationResult.isValid) {
        sendValidationError(res, validationResult.errors)
        return
      }

      // Add warnings to response if they exist
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        res.locals.warnings = validationResult.warnings
      }

      next()
    } catch (error) {
      console.error("Error in universal validation middleware:", error)
      res.status(500).json({ error: "Error en validación" })
    }
  }
}

// Apply default values based on entity
const applyDefaults = (data: any, entity: string): any => {
  const today = new Date().toISOString().split("T")[0]

  const defaults: Record<string, any> = {
    ave: {
      fecha_registro: today,
    },
    huevo: {
      fecha_recoleccion: today,
      huevos_cafe_chico: 0,
      huevos_cafe_mediano: 0,
      huevos_cafe_grande: 0,
      huevos_cafe_jumbo: 0,
      huevos_blanco_chico: 0,
      huevos_blanco_mediano: 0,
      huevos_blanco_grande: 0,
      huevos_blanco_jumbo: 0,
    },
    venta: {
      fecha_venta: today,
    },
    compra: {
      fecha: today,
    },
    aplicacion_medicamento: {
      fecha_administracion: today,
    },
    aplicacion_vacuna: {
      fecha_aplicacion: today,
    },
    servicio_higiene: {
      fecha: today,
    },
    incubacion: {
      fecha_inicio: today,
    },
    raza: {
      activa: true,
    },
    registro_huevo: {
      fecha_recoleccion: today,
      huevos_cafe_chico: 0,
      huevos_cafe_mediano: 0,
      huevos_cafe_grande: 0,
      huevos_cafe_jumbo: 0,
      huevos_blanco_chico: 0,
      huevos_blanco_mediano: 0,
      huevos_blanco_grande: 0,
      huevos_blanco_jumbo: 0,
    },
    usuario: {
      rol: "operador",
    },
  }

  return { ...defaults[entity], ...data }
}

// Validation for URL parameters
export const validateParams = (paramRules: Record<string, "number" | "string">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = []

    for (const [param, type] of Object.entries(paramRules)) {
      const value = req.params[param]

      if (!value) {
        errors.push(`Parámetro ${param} es requerido`)
        continue
      }

      if (type === "number") {
        const numValue = Number(value)
        if (isNaN(numValue) || numValue <= 0) {
          errors.push(`Parámetro ${param} debe ser un número válido mayor a 0`)
        }
      }
    }

    if (errors.length > 0) {
      sendValidationError(res, errors)
      return
    }

    next()
  }
}

// Validation for query parameters
export const validateQuery = (
  queryRules: Record<string, { required?: boolean; type?: "number" | "string" | "date" }>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = []

    for (const [param, rules] of Object.entries(queryRules)) {
      const value = req.query[param] as string

      if (rules.required && !value) {
        errors.push(`Query parameter ${param} es requerido`)
        continue
      }

      if (value && rules.type) {
        if (rules.type === "number") {
          const numValue = Number(value)
          if (isNaN(numValue)) {
            errors.push(`Query parameter ${param} debe ser un número`)
          }
        } else if (rules.type === "date") {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            errors.push(`Query parameter ${param} debe tener formato YYYY-MM-DD`)
          }
        }
      }
    }

    if (errors.length > 0) {
      sendValidationError(res, errors)
      return
    }

    next()
  }
}

// Sanitization and validation combined
export const sanitizeAndValidate = (entity: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Sanitize strings
    if (req.body && typeof req.body === "object") {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === "string") {
          // Trim whitespace
          req.body[key] = value.trim()

          // Convert empty strings to null for optional fields
          if (req.body[key] === "") {
            req.body[key] = null
          }
        }
      }
    }

    // Continue with normal validation
    validateEntityData(entity)(req, res, next)
  }
}

// Alias for backward compatibility
export const validateAdvanced = validateEntityData

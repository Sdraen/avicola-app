import type { Request, Response, NextFunction } from "express"
import { validateEntityData } from "../schemas"
import { sendValidationError } from "../utils/responseHelper"

export const validateRequest = (entity: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Aplicar valores por defecto básicos
    const today = new Date().toISOString().split("T")[0]

    // Valores por defecto comunes
    const defaults: any = {}
    if (entity === "huevo" && !req.body.fecha_recoleccion) {
      defaults.fecha_recoleccion = today
    }
    if (entity === "venta" && !req.body.fecha_venta) {
      defaults.fecha_venta = today
    }
    if (entity === "ave" && !req.body.fecha_registro) {
      defaults.fecha_registro = today
    }

    req.body = { ...defaults, ...req.body }

    // Validar datos
    const validationResult = validateEntityData(entity, req.body)

    if (!validationResult.isValid) {
      sendValidationError(res, validationResult.errors)
      return
    }

    next()
  }
}

export const validateAdvanced = (entity: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Aplicar valores por defecto básicos
      const today = new Date().toISOString().split("T")[0]

      const defaults: any = {}
      if (entity === "huevo" && !req.body.fecha_recoleccion) {
        defaults.fecha_recoleccion = today
      }
      if (entity === "venta" && !req.body.fecha_venta) {
        defaults.fecha_venta = today
      }
      if (entity === "ave" && !req.body.fecha_registro) {
        defaults.fecha_registro = today
      }

      req.body = { ...defaults, ...req.body }

      // Validación básica
      const validationResult = validateEntityData(entity, req.body)

      if (!validationResult.isValid) {
        sendValidationError(res, validationResult.errors)
        return
      }

      // Validaciones avanzadas (base de datos)
      const { AdvancedValidator } = await import("./advancedValidator")
      const businessValidation = await AdvancedValidator.validateBusinessRules(entity, req.body)

      if (!businessValidation.isValid) {
        sendValidationError(res, businessValidation.errors)
        return
      }

      next()
    } catch (error) {
      console.error("Error in advanced validation:", error)
      res.status(500).json({ error: "Validation error" })
    }
  }
}

// Función simple para validar con schema específico
export const validateWithSchema = (
  schema: any,
  target: "body" | "params" | "query" = "body",
  options: { partial?: boolean } = {},
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[target]

    // Si es validación parcial (para updates), solo validar campos presentes
    if (options.partial) {
      // Para updates, no requerir todos los campos
      // Esta lógica se puede expandir según necesidades
    }

    // Aquí puedes agregar validación específica del schema si es necesario
    // Por ahora, simplemente continúa
    next()
  }
}

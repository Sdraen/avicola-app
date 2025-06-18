import type { Request, Response, NextFunction } from "express"
import { validateAve, validateCliente, validateHuevo } from "../utils/validators"
import { sendValidationError } from "../utils/responseHelper"

export const validateRequest = (schema: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let validationResult: { isValid: boolean; errors: string[] } = { isValid: true, errors: [] }

    switch (schema) {
      case "ave":
        validationResult = validateAve(req.body)
        break
      case "cliente":
        validationResult = validateCliente(req.body)
        break
      case "huevo":
        validationResult = validateHuevo(req.body)
        break
      // Add more validation schemas as needed
    }

    if (!validationResult.isValid) {
      return sendValidationError(res, validationResult.errors)
    }

    next()
  }
}

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim()
      }
    })
  }

  next()
}

export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid ID parameter" })
  }

  next()
}

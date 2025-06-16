import type { Response } from "express"

export const sendSuccess = (res: Response, data: any, message?: string, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const sendError = (res: Response, error: string, statusCode = 400, details?: any) => {
  res.status(statusCode).json({
    success: false,
    error,
    details,
  })
}

export const sendValidationError = (res: Response, errors: string[]) => {
  res.status(400).json({
    success: false,
    error: "Validation failed",
    errors,
  })
}

export const sendNotFound = (res: Response, resource: string) => {
  res.status(404).json({
    success: false,
    error: `${resource} not found`,
  })
}

export const sendUnauthorized = (res: Response, message = "Unauthorized") => {
  res.status(401).json({
    success: false,
    error: message,
  })
}

export const sendForbidden = (res: Response, message = "Forbidden") => {
  res.status(403).json({
    success: false,
    error: message,
  })
}

export const sendServerError = (res: Response, message = "Internal server error") => {
  res.status(500).json({
    success: false,
    error: message,
  })
}

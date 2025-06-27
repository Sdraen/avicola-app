"use client"

import { useState } from "react"

// Tipos para los errores de validación del backend
export interface ValidationError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  error: string
  details?: ValidationError[]
  message?: string
}

// Clase para manejar errores de API
export class ApiError extends Error {
  public status: number
  public details?: ValidationError[]
  public originalError?: any

  constructor(message: string, status: number, details?: ValidationError[], originalError?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
    this.originalError = originalError
  }
}

// Función para procesar errores de axios
export const processApiError = (error: any): ApiError => {
  // Error de red o sin respuesta
  if (!error.response) {
    return new ApiError("Error de conexión. Verifique su conexión a internet.", 0, undefined, error)
  }

  const { status, data } = error.response

  // Error con detalles de validación
  if (data?.details && Array.isArray(data.details)) {
    return new ApiError(data.error || "Error de validación", status, data.details, error)
  }

  // Error simple con mensaje
  if (data?.error || data?.message) {
    return new ApiError(data.error || data.message, status, undefined, error)
  }

  // Error genérico
  return new ApiError(getGenericErrorMessage(status), status, undefined, error)
}

// Mensajes de error genéricos por código de estado
const getGenericErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return "Datos inválidos. Verifique la información ingresada."
    case 401:
      return "No autorizado. Inicie sesión nuevamente."
    case 403:
      return "No tiene permisos para realizar esta acción."
    case 404:
      return "Recurso no encontrado."
    case 409:
      return "Conflicto. El recurso ya existe."
    case 422:
      return "Datos no procesables. Verifique la información."
    case 500:
      return "Error interno del servidor. Intente más tarde."
    default:
      return "Ha ocurrido un error inesperado."
  }
}

// Hook para manejar errores de formularios
export const useFormErrors = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string>("")

  const setApiError = (error: ApiError) => {
    // Limpiar errores previos
    setFieldErrors({})
    setGeneralError("")

    // Si hay errores de validación por campo
    if (error.details && error.details.length > 0) {
      const errors: Record<string, string> = {}
      error.details.forEach((detail) => {
        errors[detail.field] = detail.message
      })
      setFieldErrors(errors)
    } else {
      // Error general
      setGeneralError(error.message)
    }
  }

  const clearErrors = () => {
    setFieldErrors({})
    setGeneralError("")
  }

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  return {
    fieldErrors,
    generalError,
    setApiError,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(fieldErrors).length > 0 || !!generalError,
  }
}

// Función para mostrar errores con SweetAlert2
export const showApiError = async (error: ApiError) => {
  const { showErrorAlert } = await import("./sweetAlert")

  if (error.details && error.details.length > 0) {
    // Mostrar errores de validación
    const errorList = error.details.map((detail) => `• ${detail.field}: ${detail.message}`).join("\n")

    await showErrorAlert("Errores de validación", errorList, "Corregir errores")
  } else {
    // Mostrar error general
    await showErrorAlert("Error", error.message, "Entendido")
  }
}

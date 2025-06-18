// Base validation system for the poultry management system
export interface ValidationRule {
  field: string
  required?: boolean
  type?: "string" | "number" | "boolean" | "date" | "email" | "phone"
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any, data?: any) => string | null
  enum?: string[]
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export class BaseValidator {
  static validate(data: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    for (const rule of rules) {
      const value = data[rule.field]
      const fieldErrors = this.validateField(value, rule, data)
      errors.push(...fieldErrors)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  private static validateField(value: any, rule: ValidationRule, data: any): string[] {
    const errors: string[] = []
    const fieldName = rule.field

    // Required validation
    if (rule.required && (value === undefined || value === null || value === "")) {
      errors.push(`${fieldName} es requerido`)
      return errors // Stop validation if required field is missing
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === "")) {
      return errors
    }

    // Type validation
    if (rule.type) {
      const typeError = this.validateType(value, rule.type, fieldName)
      if (typeError) errors.push(typeError)
    }

    // String validations
    if (typeof value === "string") {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${fieldName} debe tener al menos ${rule.minLength} caracteres`)
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${fieldName} no puede tener más de ${rule.maxLength} caracteres`)
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${fieldName} tiene un formato inválido`)
      }
    }

    // Number validations
    if (typeof value === "number") {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${fieldName} debe ser mayor o igual a ${rule.min}`)
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${fieldName} debe ser menor o igual a ${rule.max}`)
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${fieldName} debe ser uno de: ${rule.enum.join(", ")}`)
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value, data)
      if (customError) errors.push(customError)
    }

    return errors
  }

  private static validateType(value: any, type: string, fieldName: string): string | null {
    switch (type) {
      case "string":
        return typeof value !== "string" ? `${fieldName} debe ser una cadena de texto` : null
      case "number":
        return typeof value !== "number" || isNaN(value) ? `${fieldName} debe ser un número válido` : null
      case "boolean":
        return typeof value !== "boolean" ? `${fieldName} debe ser verdadero o falso` : null
      case "date":
        return !this.isValidDate(value) ? `${fieldName} debe ser una fecha válida (YYYY-MM-DD)` : null
      case "email":
        return !this.isValidEmail(value) ? `${fieldName} debe ser un email válido` : null
      case "phone":
        return !this.isValidPhone(value) ? `${fieldName} debe ser un teléfono válido` : null
      default:
        return null
    }
  }

  private static isValidDate(value: string): boolean {
    if (typeof value !== "string") return false
    const date = new Date(value)
    return !isNaN(date.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}$/) !== null
  }

  private static isValidEmail(value: string): boolean {
    if (typeof value !== "string") return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  private static isValidPhone(value: string): boolean {
    if (typeof value !== "string") return false
    const phoneRegex = /^\d{8,15}$/
    return phoneRegex.test(value.replace(/\D/g, ""))
  }
}

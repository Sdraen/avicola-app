import { CommonValidations } from "./commonValidation"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export class ValidationHelper {
  private errors: string[] = []
  private warnings: string[] = []

  // Required field validation
  required(value: any, fieldName: string): this {
    if (value === undefined || value === null || value === "") {
      this.errors.push(`${fieldName} es requerido`)
    }
    return this
  }

  // String validations
  string(value: any, fieldName: string): this {
    if (value !== undefined && typeof value !== "string") {
      this.errors.push(`${fieldName} debe ser una cadena de texto`)
    }
    return this
  }

  minLength(value: string, min: number, fieldName: string): this {
    if (value && value.length < min) {
      this.errors.push(`${fieldName} debe tener al menos ${min} caracteres`)
    }
    return this
  }

  maxLength(value: string, max: number, fieldName: string): this {
    if (value && value.length > max) {
      this.errors.push(`${fieldName} no puede tener más de ${max} caracteres`)
    }
    return this
  }

  pattern(value: string, pattern: RegExp, fieldName: string, message?: string): this {
    if (value && !pattern.test(value)) {
      this.errors.push(message || `${fieldName} tiene un formato inválido`)
    }
    return this
  }

  // Number validations
  number(value: any, fieldName: string): this {
    if (value !== undefined && (typeof value !== "number" || isNaN(value))) {
      this.errors.push(`${fieldName} debe ser un número válido`)
    }
    return this
  }

  min(value: number, min: number, fieldName: string): this {
    if (value !== undefined && value < min) {
      this.errors.push(`${fieldName} debe ser mayor o igual a ${min}`)
    }
    return this
  }

  max(value: number, max: number, fieldName: string): this {
    if (value !== undefined && value > max) {
      this.errors.push(`${fieldName} debe ser menor o igual a ${max}`)
    }
    return this
  }

  positive(value: number, fieldName: string): this {
    if (value !== undefined && value <= 0) {
      this.errors.push(`${fieldName} debe ser un número positivo`)
    }
    return this
  }

  nonNegative(value: number, fieldName: string): this {
    if (value !== undefined && value < 0) {
      this.errors.push(`${fieldName} no puede ser negativo`)
    }
    return this
  }

  // Date validations
  date(value: string, fieldName: string): this {
    if (value && !CommonValidations.isValidDate(value)) {
      this.errors.push(`${fieldName} debe ser una fecha válida (YYYY-MM-DD)`)
    }
    return this
  }

  dateTime(value: string, fieldName: string): this {
    if (value && !CommonValidations.isValidDateTime(value)) {
      this.errors.push(`${fieldName} debe ser una fecha y hora válida`)
    }
    return this
  }

  pastDate(value: string, fieldName: string): this {
    if (value) {
      const date = new Date(value)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today

      if (date > today) {
        this.errors.push(`${fieldName} no puede ser una fecha futura`)
      }
    }
    return this
  }

  futureDate(value: string, fieldName: string): this {
    if (value) {
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Start of today

      if (date < today) {
        this.errors.push(`${fieldName} no puede ser una fecha pasada`)
      }
    }
    return this
  }

  // Enum validations
  enum<T extends readonly string[]>(value: string, enumArray: T, fieldName: string): this {
    if (value && !CommonValidations.isValidEnum(value, enumArray)) {
      this.errors.push(`${fieldName} debe ser uno de: ${enumArray.join(", ")}`)
    }
    return this
  }

  // Email validation
  email(value: string, fieldName: string): this {
    if (value && !CommonValidations.isValidEmail(value)) {
      this.errors.push(`${fieldName} debe ser un email válido`)
    }
    return this
  }

  // Phone validation
  phone(value: string, fieldName: string): this {
    if (value && !CommonValidations.isValidPhone(value)) {
      this.errors.push(`${fieldName} debe ser un teléfono válido (8-15 dígitos)`)
    }
    return this
  }

  // Custom validation
  custom(condition: boolean, message: string): this {
    if (!condition) {
      this.errors.push(message)
    }
    return this
  }

  // Warning (non-blocking)
  warn(condition: boolean, message: string): this {
    if (!condition) {
      this.warnings.push(message)
    }
    return this
  }

  // Get result
  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: this.warnings.length > 0 ? [...this.warnings] : undefined,
    }
  }

  // Reset for reuse
  reset(): this {
    this.errors = []
    this.warnings = []
    return this
  }
}

// Factory function for creating new validator instances
export const createValidator = (): ValidationHelper => new ValidationHelper()

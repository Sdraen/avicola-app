export interface VentaValidationRules {
  id_cliente: {
    required: true
    type: "number"
    min: 1
  }
  codigo_barras: {
    required: true
    type: "number"
    min: 1
  }
  cantidad_total: {
    required: true
    type: "number"
    min: 1
    max: 1000
  }
  costo_total: {
    required: true
    type: "number"
    min: 0.01
  }
  fecha_venta: {
    type: "string"
    pattern: RegExp
  }
  descuento: {
    type: "number"
    min: 0
    max: 50
  }
}

// Patrones de validación
export const FECHA_VENTA_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// Función de validación para ventas
export const validateVentaData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validar id_cliente
  if (!data.id_cliente) {
    errors.push("id_cliente es requerido")
  } else if (typeof data.id_cliente !== "number" || data.id_cliente < 1) {
    errors.push("id_cliente debe ser un número mayor a 0")
  }

  // Validar codigo_barras
  if (!data.codigo_barras) {
    errors.push("codigo_barras es requerido")
  } else if (typeof data.codigo_barras !== "number" || data.codigo_barras < 1) {
    errors.push("codigo_barras debe ser un número mayor a 0")
  }

  // Validar cantidad_total
  if (!data.cantidad_total) {
    errors.push("cantidad_total es requerida")
  } else if (typeof data.cantidad_total !== "number" || data.cantidad_total < 1 || data.cantidad_total > 1000) {
    errors.push("cantidad_total debe estar entre 1 y 1000")
  }

  // Validar costo_total
  if (!data.costo_total) {
    errors.push("costo_total es requerido")
  } else if (typeof data.costo_total !== "number" || data.costo_total < 0.01) {
    errors.push("costo_total debe ser mayor a 0.01")
  }

  // Validar fecha_venta (opcional)
  if (data.fecha_venta) {
    if (typeof data.fecha_venta !== "string") {
      errors.push("fecha_venta debe ser texto")
    } else if (!FECHA_VENTA_PATTERN.test(data.fecha_venta)) {
      errors.push("fecha_venta debe tener formato YYYY-MM-DD")
    } else {
      const fecha = new Date(data.fecha_venta)
      const hoy = new Date()
      if (fecha > hoy) {
        errors.push("fecha_venta no puede ser futura")
      }
    }
  }

  // Validar descuento (opcional)
  if (data.descuento !== undefined) {
    if (typeof data.descuento !== "number") {
      errors.push("descuento debe ser un número")
    } else if (data.descuento < 0 || data.descuento > 50) {
      errors.push("descuento debe estar entre 0 y 50%")
    }
  }

  // Validar precio razonable
  if (data.cantidad_total && data.costo_total) {
    const precioUnitario = data.costo_total / data.cantidad_total
    if (precioUnitario < 0.5 || precioUnitario > 10.0) {
      errors.push("El precio unitario debe estar entre $0.50 y $10.00")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

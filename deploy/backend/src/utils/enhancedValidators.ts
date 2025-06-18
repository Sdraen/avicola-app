// Validaciones específicas para el dominio avícola

export const validateAnimalAge = (edad: string): { isValid: boolean; normalizedAge: string } => {
  const agePattern = /^(\d+)\s+(días?|semanas?|meses?|años?)$/i
  const match = edad.toLowerCase().match(agePattern)

  if (!match) {
    return { isValid: false, normalizedAge: "" }
  }

  const [, number, unit] = match
  const num = Number.parseInt(number)

  // Normalizar unidades
  let normalizedUnit = unit.toLowerCase()
  if (normalizedUnit.includes("día")) normalizedUnit = "días"
  else if (normalizedUnit.includes("semana")) normalizedUnit = "semanas"
  else if (normalizedUnit.includes("mes")) normalizedUnit = "meses"
  else if (normalizedUnit.includes("año")) normalizedUnit = "años"

  const normalizedAge = `${num} ${normalizedUnit}`

  // Validar rangos razonables
  switch (normalizedUnit) {
    case "días":
      return { isValid: num >= 1 && num <= 365, normalizedAge }
    case "semanas":
      return { isValid: num >= 1 && num <= 260, normalizedAge } // ~5 años
    case "meses":
      return { isValid: num >= 1 && num <= 60, normalizedAge }
    case "años":
      return { isValid: num >= 1 && num <= 5, normalizedAge }
    default:
      return { isValid: false, normalizedAge: "" }
  }
}

export const validateEggWeight = (peso: number, tipo: string): boolean => {
  const ranges = {
    fértil: { min: 45, max: 75 },
    infértil: { min: 40, max: 70 },
    doble_yema: { min: 60, max: 90 },
    deforme: { min: 20, max: 80 },
  }

  const range = ranges[tipo as keyof typeof ranges] || { min: 30, max: 80 }
  return peso >= range.min && peso <= range.max
}

export const validatePhoneNumber = (telefono: string): { isValid: boolean; formatted: string } => {
  // Limpiar el número
  const cleaned = telefono.replace(/\D/g, "")

  // Validar longitud
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { isValid: false, formatted: "" }
  }

  // Formatear número mexicano
  if (cleaned.length === 10) {
    const formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    return { isValid: true, formatted }
  }

  return { isValid: true, formatted: cleaned }
}

export const validateBusinessHours = (fecha: string): boolean => {
  const date = new Date(fecha)
  const hour = date.getHours()
  const day = date.getDay()

  // Lunes a Sábado, 6 AM a 8 PM
  return day >= 1 && day <= 6 && hour >= 6 && hour <= 20
}

export const validateSeasonalRestrictions = (fecha: string, actividad: string): boolean => {
  const date = new Date(fecha)
  const month = date.getMonth() + 1 // 1-12

  switch (actividad) {
    case "vacunacion":
      // Evitar vacunación en época de calor extremo (junio-agosto)
      return month < 6 || month > 8
    case "incubacion":
      // Mejor época para incubación (marzo-mayo, septiembre-noviembre)
      return (month >= 3 && month <= 5) || (month >= 9 && month <= 11)
    default:
      return true
  }
}

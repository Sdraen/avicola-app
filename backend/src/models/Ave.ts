export interface Ave {
  id_ave: number
  id_jaula: number
  id_anillo: string
  color_anillo: string
  estado_puesta: string
  fecha_registro: string
  fecha_nacimiento: string
  raza: string
  activo?: boolean
}

export interface AveWithAge extends Ave {
  edad_calculada?: number // Edad calculada en días o semanas
  edad_anos?: number // Edad en años
  edad_meses?: number // Edad en meses
}

export interface AveClinica {
  id_ave: number
  id_jaula: number
  fecha_inicio: string
  fecha_fin: string
  descripcion: string
}

export interface AvesFallecidas {
  id_ave: number
  fecha: string
  motivo: string
}

// Función helper para calcular edad
export const calcularEdad = (
  fechaNacimiento: string,
): {
  dias: number
  semanas: number
  meses: number
  anos: number
} => {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)

  const diferenciaTiempo = hoy.getTime() - nacimiento.getTime()
  const dias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24))
  const semanas = Math.floor(dias / 7)

  // Calcular años y meses más precisos
  let anos = hoy.getFullYear() - nacimiento.getFullYear()
  let meses = hoy.getMonth() - nacimiento.getMonth()

  if (meses < 0) {
    anos--
    meses += 12
  }

  if (hoy.getDate() < nacimiento.getDate()) {
    meses--
    if (meses < 0) {
      anos--
      meses += 12
    }
  }

  return { dias, semanas, meses, anos }
}

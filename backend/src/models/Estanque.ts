export interface Estanque {
  id_estanque: number
}

export interface EstanqueMedicamento {
  id_esmed: number
  id_medicamento: number
  id_estanque: number
  fecha_administracion: string
}

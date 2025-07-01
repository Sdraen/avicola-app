import { Cliente } from "./Cliente";
import { Bandeja } from "./Bandeja";

export interface Venta {
  id_venta: number
  id_cliente: number
  fecha_venta: string
  costo_total: number
  cantidad_total: number
  cliente?: Cliente
  bandejas?: Bandeja[] // nueva relación
}

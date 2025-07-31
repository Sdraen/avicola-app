import express, { Request, Response, Router } from "express"
import {
  getVentasMensuales,
  getProduccionHuevos,
  getProduccionPorJaula,
  getEstadisticasAves,
  getUsoInsumos,
  getVentasPorCliente,
  getEvolucionAves,
} from "../controllers/reportesController"
import { authenticateToken } from "../middleware/auth"

const router: Router = express.Router()

// Aplicar autenticación a todas las rutas de reportes
router.use(authenticateToken)

// Definición de endpoints de reportes
router.get("/ventas-mensuales", async (req: Request, res: Response) => {
  await getVentasMensuales(req, res)
})
router.get("/produccion-huevos", async (req: Request, res: Response) => {
  await getProduccionHuevos(req, res)
})
router.get("/produccion-por-jaula", async (req: Request, res: Response) => {
  await getProduccionPorJaula(req, res)
})
router.get("/estadisticas-aves", async (req: Request, res: Response) => {
  await getEstadisticasAves(req, res)
})
router.get("/uso-insumos", async (req: Request, res: Response) => {
  await getUsoInsumos(req, res)
})
router.get("/ventas-por-cliente", async (req: Request, res: Response) => {
  await getVentasPorCliente(req, res)
})
router.get("/evolucion-aves", async (req: Request, res: Response) => {
  await getEvolucionAves(req, res)
})

export default router

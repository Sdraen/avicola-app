import express from "express"
import authRoutes from "./auth"
import avesRoutes from "./aves"
import clientesRoutes from "./clientes"
import comprasRoutes from "./compras"
import huevosRoutes from "./huevos"
import implementosRoutes from "./implementos"
import incubacionRoutes from "./incubacion"
import jaulasRoutes from "./jaulas"
import medicamentosRoutes from "./medicamentos"
import razasRoutes from "./razas"
import registroHuevosRoutes from "./registroHuevos"
import vacunasRoutes from "./vacunas"
import ventasRoutes from "./ventas"

const router = express.Router()

// Rutas de autenticación (públicas)
router.use("/auth", authRoutes)

// Rutas protegidas del sistema avícola
router.use("/aves", avesRoutes)
router.use("/clientes", clientesRoutes)
router.use("/compras", comprasRoutes)
router.use("/huevos", huevosRoutes)
router.use("/implementos", implementosRoutes)
router.use("/incubacion", incubacionRoutes)
router.use("/jaulas", jaulasRoutes)
router.use("/medicamentos", medicamentosRoutes)
router.use("/razas", razasRoutes)
router.use("/registro-huevos", registroHuevosRoutes)
router.use("/vacunas", vacunasRoutes)
router.use("/ventas", ventasRoutes)

// Ruta de salud del API
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API de Sistema Avícola funcionando correctamente",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

export default router

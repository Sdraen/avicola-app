import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"

// Import routes
import authRoutes from "./routes/auth"
import avesRoutes from "./routes/aves"
import huevosRoutes from "./routes/huevos"
import incubacionRoutes from "./routes/incubacion"
import ventasRoutes from "./routes/ventas"
import jaulasRoutes from "./routes/jaulas"
import clientesRoutes from "./routes/clientes"
import implementosRoutes from "./routes/implementos"
import medicamentosRoutes from "./routes/medicamentos"
import vacunasRoutes from "./routes/vacunas"
import comprasRoutes from "./routes/compras"
import razasRoutes from "./routes/razas"
import registroHuevosRoutes from "./routes/registroHuevos"

// Import middleware
import { errorLogger, errorResponder, invalidPathHandler } from "./middleware/errorHandler"
import { sanitizeInput } from "./middleware/validator"
import logger from "./utils/logger"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Global middleware
app.use(sanitizeInput)

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now()
  res.on("finish", () => {
    const responseTime = Date.now() - start
    logger.logRequest(req, res, responseTime)
  })
  next()
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "🐔 Sistema Avícola IECI API funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/aves", avesRoutes)
app.use("/api/huevos", huevosRoutes)
app.use("/api/incubacion", incubacionRoutes)
app.use("/api/ventas", ventasRoutes)
app.use("/api/jaulas", jaulasRoutes)
app.use("/api/clientes", clientesRoutes)
app.use("/api/implementos", implementosRoutes)
app.use("/api/medicamentos", medicamentosRoutes)
app.use("/api/vacunas", vacunasRoutes)
app.use("/api/compras", comprasRoutes)
app.use("/api/razas", razasRoutes)
app.use("/api/registro-huevos", registroHuevosRoutes)

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🐔 API del Sistema Avícola IECI",
    version: "1.0.0",
    documentation: "/health",
    endpoints: {
      auth: "/api/auth",
      aves: "/api/aves",
      clientes: "/api/clientes",
      compras: "/api/compras",
      huevos: "/api/huevos",
      implementos: "/api/implementos",
      incubacion: "/api/incubacion",
      jaulas: "/api/jaulas",
      medicamentos: "/api/medicamentos",
      razas: "/api/razas",
      "registro-huevos": "/api/registro-huevos",
      vacunas: "/api/vacunas",
      ventas: "/api/ventas",
    },
  })
})

// Error handling middleware
app.use(errorLogger)
app.use(errorResponder)
app.use(invalidPathHandler)

// Start server
const startServer = () => {
  try {
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${PORT}`)
      logger.info(`📊 Health check: http://localhost:${PORT}/health`)
      logger.info(`🔗 API base URL: http://localhost:${PORT}/api`)
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    logger.error("❌ Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully")
  process.exit(0)
})

// Start the application
startServer()

export default app

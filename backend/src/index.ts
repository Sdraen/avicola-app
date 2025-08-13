import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"

// Cargar variables de entorno PRIMERO
dotenv.config()

// Verificar que las variables se cargaron
console.log("🔍 Environment variables check:")
console.log("PORT:", process.env.PORT)
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length || 0)
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "✅ Set" : "❌ Missing")

// Import routes
import authRoutes from "./routes/auth"
import avesRoutes from "./routes/aves"
import huevosRoutes from "./routes/huevos"
import incubacionRoutes from "./routes/incubaciones"
import nacimientosRoutes from "./routes/nacimientos"
import ventasRoutes from "./routes/ventas"
import jaulasRoutes from "./routes/jaulas"
import clientesRoutes from "./routes/clientes"
import implementosRoutes from "./routes/implementos"
import medicamentosRoutes from "./routes/medicamentos"
import vacunasRoutes from "./routes/vacunas"
import comprasRoutes from "./routes/compras"
import razasRoutes from "./routes/razas"
import registroHuevosRoutes from "./routes/registroHuevos"
import bandejaRoutes from "./routes/bandeja"
import aveClinicaRoutes from "./routes/aveClinica"
import reportesRoutes from "./routes/reportes"

// Import middleware
import { errorLogger, errorResponder, invalidPathHandler } from "./middleware/errorHandler"
import { requestLogger } from "./middleware/requestLogger"
import logger from "./utils/logger"

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// CORS configuration - PERMITIR AMBOS PUERTOS
app.use(
  cors({
    origin: [
      "http://localhost:3000", // React dev server
      "http://localhost:5173", // Vite dev server
      "http://localhost:1705", // Vite dev server with HTTPS
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Request logging middleware
app.use(requestLogger)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "🐔 Sistema Avícola IECI API funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    jwtConfigured: !!process.env.JWT_SECRET,
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
app.use("/api/nacimientos", nacimientosRoutes)
app.use("/api/medicamentos", medicamentosRoutes)
app.use("/api/vacunas", vacunasRoutes)
app.use("/api/compras", comprasRoutes)
app.use("/api/razas", razasRoutes)
app.use("/api/registro-huevos", registroHuevosRoutes)
app.use("/api/bandeja", bandejaRoutes)
app.use("/api/ave-clinica", aveClinicaRoutes)
app.use("/api/reportes", reportesRoutes)

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
      nacimientos: "/api/nacimientos",
      jaulas: "/api/jaulas",
      medicamentos: "/api/medicamentos",
      razas: "/api/razas",
      "registro-huevos": "/api/registro-huevos",
      vacunas: "/api/vacunas",
      ventas: "/api/ventas",
      bandeja: "/api/bandeja",
      aveClinica: "/api/ave-clinica",
      reportes: "/api/reportes",
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
      // Console logs for immediate visibility
      console.log(`🚀 Servidor iniciado en puerto ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`)
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`)
      console.log(`🔐 JWT configurado: ${process.env.JWT_SECRET ? "✅ SÍ" : "❌ NO"}`)
      console.log(`🌐 CORS habilitado para: localhost:3000, localhost:5173`)
      console.log(`✅ ¡Sistema Avícola IECI API funcionando correctamente!`)

      // Logger for file logging
      logger.info(`🚀 Servidor iniciado en puerto ${PORT}`)
      logger.info(`📊 Health check: http://localhost:${PORT}/health`)
      logger.info(`🔗 API base URL: http://localhost:${PORT}/api`)
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error)
    logger.error("❌ Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully")
  logger.info("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully")
  logger.info("SIGINT received, shutting down gracefully")
  process.exit(0)
})

// Start the application
startServer()

export default app

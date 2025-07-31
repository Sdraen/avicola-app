import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Permite conexiones externas en desarrollo
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Desactivar sourcemaps en producción
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          charts: ["chart.js", "react-chartjs-2"],
        },
      },
    },
  },
  define: {
    // Reemplazar variables de entorno en build time
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || "http://localhost:5000"),
  },
})

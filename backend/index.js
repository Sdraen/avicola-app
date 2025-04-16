require('dotenv').config()
const express = require('express')
const supabase = require('./supabaseClient')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// Ruta de prueba para obtener todas las aves
app.get('/aves', async (req, res) => {
  const { data, error } = await supabase.from('ave').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Servidor en marcha
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
})

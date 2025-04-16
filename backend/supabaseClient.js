// Cargar variables de entorno
require('dotenv').config()

// Importar Supabase
const { createClient } = require('@supabase/supabase-js')

// Leer URL y Service Key desde .env
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Crear instancia del cliente
const supabase = createClient(supabaseUrl, supabaseServiceKey)

module.exports = supabase

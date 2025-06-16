import type { Request, Response } from "express"
import { supabase } from "../config/supabase"
import { validateUsuarioRegistro, validateUsuarioLogin } from "../schemas/authSchema"
import { sendValidationError } from "../utils/responseHelper"

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ VALIDAR DATOS DE REGISTRO
    const validation = validateUsuarioRegistro(req.body)
    if (!validation.isValid) {
      sendValidationError(res, validation.errors)
      return
    }

    const { email, password, nombre, rol = "operador" } = req.body

    if (!email || !password || !nombre) {
      res.status(400).json({ error: "Email, password, and nombre are required" })
      return
    }

    // Validar que el rol sea válido
    if (!["admin", "operador"].includes(rol)) {
      res.status(400).json({ error: "Rol must be 'admin' or 'operador'" })
      return
    }

    // Verificar si el email ya existe
    const { data: existingUser, error: emailCheckError } = await supabase
      .from("usuario")
      .select("correo")
      .eq("correo", email)
      .single()

    if (emailCheckError && emailCheckError.code !== "PGRST116") {
      // PGRST116 es el código para "no rows returned", que es lo que esperamos
      res.status(500).json({ error: "Error checking email availability" })
      return
    }

    if (existingUser) {
      res.status(400).json({ error: "Email already registered" })
      return
    }

    // Verificar límites de roles
    const { data: roleCount, error: roleCountError } = await supabase.from("usuario").select("rol").eq("rol", rol)

    if (roleCountError) {
      res.status(500).json({ error: "Error checking role availability" })
      return
    }

    // Validar límites por rol
    if (rol === "admin" && roleCount && roleCount.length >= 1) {
      res.status(400).json({
        error: "Only one admin user is allowed. Admin user already exists.",
      })
      return
    }

    if (rol === "operador" && roleCount && roleCount.length >= 1) {
      res.status(400).json({
        error: "Only one operador user is allowed. Operador user already exists.",
      })
      return
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      res.status(400).json({ error: authError.message })
      return
    }

    // Agregar usuario a la tabla usuario
    if (authData.user) {
      const { data: userData, error: userError } = await supabase
        .from("usuario")
        .insert([
          {
            correo: email,
            nombre,
            rol,
          },
        ])
        .select()
        .single()

      if (userError) {
        console.error("Error creating user profile:", userError)
        // Si falla la creación del perfil, intentar eliminar el usuario de auth
        await supabase.auth.admin.deleteUser(authData.user.id)
        res.status(500).json({ error: "Error creating user profile" })
        return
      }

      res.status(201).json({
        message: `${rol.charAt(0).toUpperCase() + rol.slice(1)} user registered successfully`,
        user: authData.user,
        profile: userData,
      })
    } else {
      res.status(500).json({ error: "User creation failed" })
    }
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ VALIDAR DATOS DE LOGIN
    const validation = validateUsuarioLogin(req.body)
    if (!validation.isValid) {
      sendValidationError(res, validation.errors)
      return
    }

    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" })
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      res.status(401).json({ error: error.message })
      return
    }

    // Get user profile
    const { data: userProfile } = await supabase.from("usuario").select("*").eq("correo", email).single()

    res.status(200).json({
      message: "Login successful",
      session: data.session,
      user: data.user,
      profile: userProfile,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(200).json({ message: "Logout successful" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      res.status(401).json({ error: "Access token required" })
      return
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      res.status(403).json({ error: "Invalid token" })
      return
    }

    // Get user profile
    const { data: userProfile } = await supabase.from("usuario").select("*").eq("correo", user.email).single()

    res.status(200).json({
      user,
      profile: userProfile,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Nuevo endpoint para verificar disponibilidad de roles
export const checkRoleAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: users, error } = await supabase.from("usuario").select("rol")

    if (error) {
      res.status(500).json({ error: "Error checking role availability" })
      return
    }

    const adminExists = users?.some((user) => user.rol === "admin") || false
    const operadorExists = users?.some((user) => user.rol === "operador") || false

    res.status(200).json({
      admin: {
        exists: adminExists,
        available: !adminExists,
      },
      operador: {
        exists: operadorExists,
        available: !operadorExists,
      },
      totalUsers: users?.length || 0,
    })
  } catch (error) {
    console.error("Error checking role availability:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Nuevo endpoint para verificar disponibilidad de email
export const checkEmailAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params

    if (!email) {
      res.status(400).json({ error: "Email parameter is required" })
      return
    }

    const { data: existingUser, error } = await supabase.from("usuario").select("correo").eq("correo", email).single()

    if (error && error.code !== "PGRST116") {
      res.status(500).json({ error: "Error checking email availability" })
      return
    }

    res.status(200).json({
      email,
      available: !existingUser,
      exists: !!existingUser,
    })
  } catch (error) {
    console.error("Error checking email availability:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

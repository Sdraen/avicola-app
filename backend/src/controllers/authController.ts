import type { Request, Response } from "express"
import { supabase } from "../config/supabase"

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre, rol = "user" } = req.body

    if (!email || !password || !nombre) {
      res.status(400).json({ error: "Email, password, and nombre are required" })
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      res.status(400).json({ error: authError.message })
      return
    }

    if (authData.user) {
      const { error: userError } = await supabase.from("usuario").insert([
        { correo: email, nombre, rol },
      ])
      if (userError) {
        console.error("Error creating user profile:", userError)
      }
    }

    res.status(201).json({ message: "User registered successfully", user: authData.user })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" })
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      res.status(401).json({ error: error.message })
      return
    }

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

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      res.status(403).json({ error: "Invalid token" })
      return
    }

    const { data: userProfile } = await supabase.from("usuario").select("*").eq("correo", user.email).single()

    res.status(200).json({ user, profile: userProfile })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

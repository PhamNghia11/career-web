"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: Partial<User> & { password: string }) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("gdu_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem("gdu_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      if (data.success && data.user) {
        setUser(data.user)
        localStorage.setItem("gdu_user", JSON.stringify(data.user))
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Login error:", error)
      return false
    }
  }

  const register = async (data: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        return false
      }

      const result = await response.json()
      if (result.success && result.user) {
        setUser(result.user)
        localStorage.setItem("gdu_user", JSON.stringify(result.user))
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Register error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("gdu_user")
  }

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (user) {
        const updatedUser = { ...user, ...data, updatedAt: new Date() }
        setUser(updatedUser)
        localStorage.setItem("gdu_user", JSON.stringify(updatedUser))
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Update profile error:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

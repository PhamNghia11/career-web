"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: Partial<User> & { password: string }) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  setAuthUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("gdu_user")
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          // Set user immediately to provide fast UI feedback
          setUser(parsedUser)

          // Verify with server if user still exists (in background)
          const userId = parsedUser.id || parsedUser._id
          if (userId) {
            try {
              const res = await fetch(`/api/users/${userId}`)
              if (res.status === 404) {
                console.warn("[Auth] User not found on server, logging out.")
                logout()
                return
              }

              if (res.ok) {
                const data = await res.json()
                if (data.success && data.user) {
                  // Update with fresh data if successful
                  setUser(data.user)
                  localStorage.setItem("gdu_user", JSON.stringify(data.user))
                }
              }
            } catch (fetchErr) {
              // If fetch fails (abort, network error, server down), 
              // we trust the local session instead of logging out
              console.log("[Auth] Background verify bypassed due to connection issue/abort")
            }
          }
        } catch (e) {
          console.error("[Auth] Session data corrupted:", e)
          localStorage.removeItem("gdu_user")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
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
        const userId = user.id || user._id
        if (!userId) {
          throw new Error("User ID not found")
        }

        const response = await fetch(`/api/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error("Failed to update profile on server")
        }

        const updatedUser = { ...user, ...data, updatedAt: new Date() }
        setUser(updatedUser)
        localStorage.setItem("gdu_user", JSON.stringify(updatedUser))
        return true
      }
      return false
    } catch (error) {
      console.error("[Auth] Update profile error:", error)
      return false
    }
  }

  const setAuthUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem("gdu_user", JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, setAuthUser }}>
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

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  name: string
  email: string
  avatar: string
  bio?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  loginWithOTP: (email: string) => Promise<void>
  logout: () => void
  updateProfile: (profile: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from Supabase
  useEffect(() => {
    // Get initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
          avatar: session.user.user_metadata.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
        }
        setUser(userData)
      }
      setIsLoading(false)
    }
    
    checkSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
          avatar: session.user.user_metadata.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
        }
        setUser(userData)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setIsLoading(false)
        throw error
      }
      
      if (data.user) {
        const userData: User = {
          id: data.user.id,
          name: data.user.user_metadata.name || data.user.email?.split("@")[0] || "User",
          email: data.user.email || email,
          avatar: data.user.user_metadata.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
        }
        setUser(userData)
      }
    } catch (error: any) {
      setIsLoading(false)
      // Check if the error is related to email confirmation
      if (error.message?.includes('email') && error.message?.includes('confirm')) {
        throw new Error('Please confirm your email address before logging in.')
      }
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      })
      
      if (error) {
        console.error('Signup error:', error)
        setIsLoading(false)
        throw error
      }
      
      if (data.user) {
        const userData: User = {
          id: data.user.id,
          name: data.user.user_metadata.name || name,
          email: data.user.email || email,
          avatar: data.user.user_metadata.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
        }
        setUser(userData)
      }
    } catch (error) {
      console.error('Signup error:', error)
      setIsLoading(false)
      throw error
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (error) throw error
      // The redirect will handle the rest
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const loginWithGithub = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (error) throw error
      // The redirect will handle the rest
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const loginWithOTP = async (email: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      })
      
      if (error) throw error
      // The user will receive an email with the OTP
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) console.error("Error signing out:", error)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const updateProfile = (profile: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...profile }
      setUser(updated)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, loginWithGoogle, loginWithGithub, loginWithOTP, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

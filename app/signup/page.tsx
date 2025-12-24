"use client"

import type React from "react"
import Navbar from "@/components/Navbar"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Chrome, Github } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const { signup, loginWithGoogle, loginWithGithub, loginWithOTP, isLoading } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle()
      router.push("/")
    } catch (err) {
      setError("Google signup failed. Please try again.")
    }
  }

  const handleGithubSignup = async () => {
    try {
      await loginWithGithub()
      router.push("/")
    } catch (err) {
      setError("GitHub signup failed. Please try again.")
    }
  }

  const handleOTPLogin = async () => {
    try {
      if (!email.trim()) {
        setError("Please enter your email")
        return
      }
      await loginWithOTP(email)
      alert("OTP sent to your email. Please check your inbox.")
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name.trim()) {
      setError("Name is required")
      return
    }
    try {
      await signup(name, email, password)
      // If signup was successful but requires email confirmation
      setError("Please check your email to confirm your account. You'll be redirected to login after confirmation.")
      // Optionally redirect to login after a delay
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      if (err.message?.includes('confirmation')) {
        setError("Please check your email to confirm your account.")
      } else {
        setError(`Signup failed: ${err.message || 'Please try again.'}`)
      }
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-background-alt flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-2xl animate-pulse delay-500" />

        <div className="w-full max-w-md relative z-10">
          <div className="glass-card p-8 md:p-10 space-y-8 rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-slate-900/30 border border-white/20 dark:border-slate-700/50 shadow-2xl">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-2xl font-bold text-white">B</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Join Blogify
              </h1>
              <p className="text-foreground-muted text-sm md:text-base">
                Start sharing your unique stories with the world
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium animate-in fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 pl-12"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/50">
                    <span className="text-lg">👤</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 pl-12"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/50">
                    <span className="text-lg">✉️</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 pl-12"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/50">
                    <span className="text-lg">🔒</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2 group overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </span>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white/10 dark:bg-slate-900/30 text-foreground-muted font-medium text-sm">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="py-3 bg-white/50 dark:bg-slate-800/50 border border-border/50 hover:border-primary/30 hover:bg-primary/5 rounded-xl transition-all font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Chrome size={16} />
                Google
              </button>
              <button
                type="button"
                onClick={handleGithubSignup}
                disabled={isLoading}
                className="py-3 bg-white/50 dark:bg-slate-800/50 border border-border/50 hover:border-primary/30 hover:bg-primary/5 rounded-xl transition-all font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github size={16} />
                GitHub
              </button>

            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-foreground-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

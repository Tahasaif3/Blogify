"use client"

import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="gradient-primary w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline gradient-text">Blogify</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground-muted hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/create" className="text-foreground-muted hover:text-foreground transition-colors">
              Write
            </Link>
            <Link href="/explore" className="text-foreground-muted hover:text-foreground transition-colors">
              Explore
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
                  <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass border border-border rounded-lg shadow-lg animate-fade-in z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-foreground-muted truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-background-alt transition-colors">
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm hover:bg-background-alt transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-background-alt transition-colors text-danger"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium hover:bg-background-alt rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

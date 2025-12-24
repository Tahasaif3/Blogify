"use client"

import Navbar from "@/components/Navbar"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateProfile, logout } = useAuth()
  const [bio, setBio] = useState(user?.bio || "")
  const [saved, setSaved] = useState(false)

  if (!user) {
    router.push("/login")
    return null
  }

  const handleSave = () => {
    updateProfile({ bio })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-12">Settings</h1>

          {/* Profile Section */}
          <div className="bg-white border border-border rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background-alt"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background-alt"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={4}
                />
              </div>

              {saved && (
                <div className="p-4 bg-success/10 border border-success text-success rounded-lg text-sm">
                  ✓ Profile updated successfully
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white border border-danger rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-danger">Danger Zone</h2>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

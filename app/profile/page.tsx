"use client"

import Navbar from "@/components/Navbar"
import { useAuth } from "@/context/AuthContext"
import { useBlog } from "@/context/BlogContext"
import BlogCard from "@/components/BlogCard"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { posts } = useBlog()

  if (!user) {
    router.push("/login")
    return null
  }

  const userPosts = posts.filter((post) => post.author.id === user.id)
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes.length, 0)
  const totalComments = userPosts.reduce((sum, post) => sum + post.comments.length, 0)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-white border border-border rounded-xl p-8 mb-12">
            <div className="flex flex-col md:flex-row gap-8">
              <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-32 h-32 rounded-full" />
              <div className="flex-grow">
                <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                <p className="text-foreground-muted mb-6">{user.email}</p>
                <p className="text-foreground mb-6">{user.bio}</p>
                <Link
                  href="/settings"
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{userPosts.length}</p>
                <p className="text-sm text-foreground-muted">Articles</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{totalLikes}</p>
                <p className="text-sm text-foreground-muted">Likes Received</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{totalComments}</p>
                <p className="text-sm text-foreground-muted">Comments</p>
              </div>
            </div>
          </div>

          {/* User's Articles */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Your Articles</h2>
            {userPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-foreground-muted mb-4">You haven't written any articles yet.</p>
                <Link
                  href="/create"
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Write Your First Article
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

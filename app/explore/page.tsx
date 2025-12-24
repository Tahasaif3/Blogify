"use client"

import Navbar from "@/components/Navbar"
import BlogCard from "@/components/BlogCard"
import { useBlog } from "@/context/BlogContext"
import { useState } from "react"

export default function ExplorePage() {
  const { posts } = useBlog()
  const [sortBy, setSortBy] = useState("recent")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return b.createdAt.getTime() - a.createdAt.getTime()
    } else if (sortBy === "popular") {
      return b.likes.length + b.comments.length - (a.likes.length + a.comments.length)
    } else if (sortBy === "trending") {
      return b.shares + b.reactions.length - (a.shares + a.reactions.length)
    }
    return 0
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Explore Articles</h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Discover amazing stories from our community of writers
            </p>
          </div>

          {/* Search and Filter */}
          <div className="space-y-4 mb-12">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSortBy("recent")}
                className={`px-4 py-2 rounded-full transition-all ${
                  sortBy === "recent" ? "bg-primary text-white" : "bg-background-alt text-foreground hover:bg-border"
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`px-4 py-2 rounded-full transition-all ${
                  sortBy === "popular" ? "bg-primary text-white" : "bg-background-alt text-foreground hover:bg-border"
                }`}
              >
                Popular
              </button>
              <button
                onClick={() => setSortBy("trending")}
                className={`px-4 py-2 rounded-full transition-all ${
                  sortBy === "trending" ? "bg-primary text-white" : "bg-background-alt text-foreground hover:bg-border"
                }`}
              >
                Trending
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          {sortedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-foreground-muted">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

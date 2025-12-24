"use client"

import Navbar from "@/components/Navbar"
import BlogCard from "@/components/BlogCard"
import { useBlog } from "@/context/BlogContext"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useState } from "react"

export default function Home() {
  const { posts, loading } = useBlog()
  const { user } = useAuth()
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter = filter === "all" || post.category === filter
    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

  const categories = Array.from(new Set(posts.map((p) => p.category)))

  // @ts-expect-error:ts error
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }
  // @ts-expect-error:ts error
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center space-y-6 mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">Share Your Stories</h1>
              <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto">
                Discover inspiring articles, engage with the community, and share your unique perspective with the
                world.
              </p>
              {!user && (
                <Link
                  href="/signup"
                  className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-lg font-medium"
                >
                  Get Started
                </Link>
              )}
              {user && (
                <Link
                  href="/create"
                  className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-lg font-medium"
                >
                  Write an Article
                </Link>
              )}
            </div>

            {/* Search and Filter */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`px-4 py-2 rounded-full transition-all ${
                    filter === "all" ? "bg-primary text-white" : "bg-background-alt text-foreground hover:bg-border"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleFilterChange(category)}
                    className={`px-4 py-2 rounded-full transition-all ${
                      filter === category
                        ? "bg-primary text-white"
                        : "bg-background-alt text-foreground hover:bg-border"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : currentPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
                            
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === 1
                          ? "bg-background-alt text-foreground-muted cursor-not-allowed"
                          : "bg-background-alt text-foreground hover:bg-border"
                      }`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? "bg-primary text-white"
                            : "bg-background-alt text-foreground hover:bg-border"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === totalPages
                          ? "bg-background-alt text-foreground-muted cursor-not-allowed"
                          : "bg-background-alt text-foreground hover:bg-border"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-foreground-muted mb-4">No articles found.</p>
                <p className="text-sm text-foreground-muted">Try adjusting your search or filter.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
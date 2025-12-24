import { postService } from '@/lib/blog-service'
import Navbar from "@/components/Navbar"
import BlogCard from "@/components/BlogCard"
import Link from "next/link"

// This will enable ISR with a 60-second revalidation interval
export const revalidate = 60;

export default async function HomePageServer() {
  let posts: any[] = [];
  
  try {
    // Fetch posts from Supabase
    posts = await postService.getPosts(1, 10); // Get first page with 10 posts
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Return empty array if there's an error
    posts = [];
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
              <Link
                href="/signup"
                className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-lg font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard 
                    key={post.id} 
                    post={{
                      id: post.id,
                      title: post.title,
                      content: post.content || "", // Add content field
                      excerpt: post.excerpt || "",
                      author: {
                        id: post.profiles?.[0]?.id || "",
                        name: post.profiles?.[0]?.full_name || post.profiles?.[0]?.username || "Anonymous",
                        avatar: post.profiles?.[0]?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`
                      },
                      image: post.image || "/placeholder.svg",
                      category: post.category || "Uncategorized",
                      tags: post.tags || [],
                      createdAt: new Date(post.created_at),
                      likes: [], // Will be populated differently
                      shares: post._count?.comments || 0, // Using comments count as shares for now
                      comments: [], // Will be populated differently
                      reactions: {}, // Will be populated differently
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-foreground-muted mb-4">No articles found.</p>
                <p className="text-sm text-foreground-muted">Check back later for new content.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
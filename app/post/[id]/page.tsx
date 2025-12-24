"use client"

import { useAuth } from "@/context/AuthContext"
import Navbar from "@/components/Navbar"
import CommentSection from "@/components/CommentSection"
import { useParams, useRouter } from "next/navigation"
import { formatDistance } from "date-fns"
import { useState, useEffect } from "react"
import Link from "next/link"
import { postService } from "@/lib/blog-service"
import { BlogPost } from "@/context/BlogContext"

export default function PostDetail() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch post by ID
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const postData = await postService.getPostById(params.id as string)
        
        // Convert to our format
        const formattedPost: BlogPost = {
          id: postData.id,
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt || "",
          author: {
            id: postData.author?.id || "",
            name: postData.author?.full_name || postData.author?.username || "Anonymous",
            avatar: postData.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${postData.author?.id || postData.author_id}`
          },
          image: postData.image || "/placeholder.svg",
          category: postData.category || "Uncategorized",
          tags: postData.tags || [],
          createdAt: new Date(postData.created_at),
          likes: [], // Will be populated differently
          shares: 0, // Will be populated differently
          comments: [], // Will be populated differently
          reactions: {}, // Will be populated differently
        }
        
        setPost(formattedPost)
      } catch (error) {
        console.error('Error fetching post:', error)
        setPost(null)
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    )
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link href="/" className="text-primary hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </>
    )
  }

  const isLiked = user && post.likes?.includes(user.id)
  const reactionsArray = Object.entries(post.reactions || {})
    .map(([emoji, count]) => ({ emoji, count: count as number }))
    .sort((a, b) => b.count - a.count)

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`
    const title = post.title

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        // sharePost(post.id) // Will be implemented with Supabase
      } catch (error) {
        console.log("Share canceled")
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url)
      setCopied(true)
      // sharePost(post.id) // Will be implemented with Supabase
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleReaction = async (emoji: string) => {
    if (!user) {
      router.push('/login')
      return
    }
    
    try {
      const reactionResult = await postService.addReaction(post.id, user.id, emoji)
      
      // Refresh the post to update reactions
      const updatedPost = await postService.getPostById(params.id as string)
      
      // Convert to our format
      const formattedPost: BlogPost = {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        excerpt: updatedPost.excerpt || "",
        author: {
          id: updatedPost.author?.id || "",
          name: updatedPost.author?.full_name || updatedPost.author?.username || "Anonymous",
          avatar: updatedPost.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${updatedPost.author?.id || updatedPost.author_id}`
        },
        image: updatedPost.image || "/placeholder.svg",
        category: updatedPost.category || "Uncategorized",
        tags: updatedPost.tags || [],
        createdAt: new Date(updatedPost.created_at),
        likes: [], // Will be populated differently
        shares: updatedPost._count?.comments, // Use comments count as shares
        comments: [], // Will be populated differently
        reactions: updatedPost.reactions || {}, // Use the reactions from the updated post
        _count: updatedPost._count || { comments: 0, reactions: 0 }
      }
      
      setPost(formattedPost)
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }


  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <article className="max-w-4xl mx-auto py-12 md:py-20 px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-8 transition-colors"
          >
            ← Back to posts
          </Link>

          {/* Hero Image */}
          <div className="w-full h-96 rounded-xl overflow-hidden mb-8 shadow-lg">
            <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Header */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{post.title}</h1>

            {/* Author Info */}
            <div className="flex items-center justify-between pt-6 border-t border-b border-border py-6">
              <div className="flex items-center gap-4">
                <img
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.name}
                  className="w-14 h-14 rounded-full"
                />
                <div>
                  <p className="font-semibold text-lg">{post.author.name}</p>
                  <p className="text-sm text-foreground-muted">
                    {formatDistance(post.createdAt, new Date(), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-background-alt hover:bg-border rounded-lg transition-colors"
                title={copied ? "Copied!" : "Share post"}
              >
                <span className="text-xl">📤</span>
                <span className="text-sm font-medium">{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12 text-foreground leading-relaxed">{post.content}</div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-12">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-background-alt text-foreground-muted rounded-full text-sm hover:bg-border transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Engagement Section */}
       

          {/* Comments */}
          <CommentSection postId={post.id} />
        </article>
      </main>
    </>
  )
}

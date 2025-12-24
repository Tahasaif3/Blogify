"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from './AuthContext'
import { postService, commentService, reactionService } from '@/lib/blog-service'

export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  author: {
    id: string
    name: string
    avatar: string
  }
  image: string
  category: string
  tags: string[]
  createdAt: Date
  likes: string[]
  shares: number
  comments: Comment[]
  reactions: Reactions
  _count?: {
    comments: number;
    reactions: number;
  };
}

export interface Comment {
  id: string
  text: string
  author: {
    id: string
    name: string
    avatar: string
  }
  createdAt: Date
  replies: Comment[]
}

export interface Reactions {
  [key: string]: number
}

interface BlogContextType {
  posts: BlogPost[]
  addPost: (post: Omit<BlogPost, "id" | "createdAt" | "likes" | "shares" | "comments" | "reactions">) => void
  updatePost: (id: string, post: Partial<BlogPost>) => void
  deletePost: (id: string) => void
  getPost: (id: string) => BlogPost | undefined
  likePost: (postId: string, userId: string) => void
  addComment: (postId: string, comment: Omit<Comment, "id" | "replies">) => void
  addReaction: (postId: string, emoji: string) => void
  sharePost: (postId: string) => void
  loadPosts: (page?: number) => Promise<void>
  loading: boolean
}

const BlogContext = createContext<BlogContextType | undefined>(undefined)

export function BlogProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Load posts from Supabase
  const loadPosts = async (page: number = 1) => {
    try {
      setLoading(true)
      const postsData = await postService.getPosts(page, 10) // Load more initially
      
      // Convert Supabase data to our format
      const formattedPosts = postsData.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content || "",
        excerpt: post.excerpt || "",
        author: {
          id: post.author?.id || "",
          name: post.author?.full_name || post.author?.username || "Anonymous",
          avatar: post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`
        },
        image: post.image || "/placeholder.svg",
        category: post.category || "Uncategorized",
        tags: post.tags || [],
        createdAt: new Date(post.created_at),
        likes: [], // Will be populated differently
        shares: post._count?.comments || 0, // Using comments count as shares for now
        comments: [], // Will be populated differently
        reactions: post.reactions || {}, // Use reactions from the post
        _count: post._count || { comments: 0, reactions: 0 } // Include the count data
      }))
      
      setPosts(formattedPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
      // Set empty posts array if there's an error
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const addPost = async (post: Omit<BlogPost, "id" | "createdAt" | "likes" | "shares" | "comments" | "reactions">) => {
    if (!user) {
      throw new Error('User must be logged in to create a post')
    }
    
    // Optimistic update: add the post to the list immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticPost: BlogPost = {
      ...post,
      id: tempId,
      createdAt: new Date(),
      likes: [],
      shares: 0,
      comments: [],
      reactions: {},
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      }
    };
    
    setPosts(prev => [optimisticPost, ...prev]);
    
    try {
      const newPost = await postService.createPost({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        author_id: user.id,
        image: post.image,
        category: post.category,
        tags: post.tags,
      })
      
      // Replace the optimistic post with the actual one
      setPosts(prev => 
        prev.map(p => 
          p.id === tempId ? {
            ...p,
            id: newPost.id,
            createdAt: new Date(newPost.created_at)
          } : p
        )
      );
    } catch (error) {
      // If there's an error, remove the optimistic post
      setPosts(prev => prev.filter(p => p.id !== tempId));
      console.error('Error creating post:', error)
      throw error
    }
  }

  const updatePost = (id: string, updatedData: Partial<BlogPost>) => {
    // This would be implemented with Supabase update
    setPosts(posts.map((post) => (post.id === id ? { ...post, ...updatedData } : post)))
  }

  const deletePost = async (id: string) => {
    try {
      await postService.deletePost(id)
      // Reload posts after deletion
      await loadPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  const getPost = (id: string) => {
    return posts.find((post) => post.id === id)
  }

  const likePost = (postId: string, userId: string) => {
    // This would be implemented with Supabase likes table
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const likes = post.likes.includes(userId) ? post.likes.filter((id) => id !== userId) : [...post.likes, userId]
          return { ...post, likes }
        }
        return post
      }),
    )
  }

  const addComment = (postId: string, comment: Omit<Comment, "id" | "replies">) => {
    // This would be implemented with Supabase comments
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, { ...comment, id: Math.random().toString(36).substr(2, 9), replies: [] }],
          }
        }
        return post
      }),
    )
  }

  const addReaction = (postId: string, emoji: string) => {
    // This would be implemented with Supabase reactions
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            reactions: {
              ...post.reactions,
              [emoji]: (post.reactions[emoji] || 0) + 1,
            },
          }
        }
        return post
      }),
    )
  }

  const sharePost = (postId: string) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)))
  }

  return (
    <BlogContext.Provider
      value={{ posts, addPost, updatePost, deletePost, getPost, likePost, addComment, addReaction, sharePost, loadPosts, loading }}
    >
      {children}
    </BlogContext.Provider>
  )
}

export function useBlog() {
  const context = useContext(BlogContext)
  if (!context) {
    throw new Error("useBlog must be used within BlogProvider")
  }
  return context
}

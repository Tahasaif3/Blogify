"use client"

import type React from "react"

import Navbar from "@/components/Navbar"
import { useAuth } from "@/context/AuthContext"
import { useBlog } from "@/context/BlogContext"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const CATEGORIES = ["Writing", "Design", "Development", "Marketing", "Business", "Lifestyle"]

// Define the schema for form validation
const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  excerpt: z.string().max(500, "Excerpt must be less than 500 characters").optional(),
  content: z.string().min(10, "Content must be at least 10 characters").max(10000, "Content must be less than 10000 characters"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().max(200, "Tags must be less than 200 characters").optional(),
  image: z.string().optional(),
})

type PostFormData = z.infer<typeof postSchema>

export default function CreatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addPost } = useBlog()
  
  // Use react-hook-form for form handling and validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      category: "Writing",
      tags: "",
      image: "/blog-post-concept.png",
    },
  })

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-foreground-muted">Please login to create a post.</p>
        </div>
      </>
    )
  }

  const onSubmit = async (data: PostFormData) => {
    try {
      // Process tags
      const tagsArray = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []

      await addPost({
        title: data.title,
        excerpt: data.excerpt || data.content.substring(0, 150),
        content: data.content,
        category: data.category,
        tags: tagsArray,
        image: data.image || "/blog-post-concept.png", // Use default image if not provided
        author: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
      })

      router.push("/")
    } catch (error) {
      console.error("Error creating post:", error)
      setError("root", {
        message: "Failed to create post. Please try again.",
      })
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2 mb-12">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text">Write Your Story</h1>
              <p className="text-foreground-muted">Share your thoughts with the world</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium animate-in fade-in">
                  {errors.root.message}
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-semibold">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  {...register("title")}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label htmlFor="excerpt" className="block text-sm font-semibold">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  {...register("excerpt")}
                  placeholder="Brief summary of your article..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                />
                {errors.excerpt && (
                  <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-semibold">
                  Content
                </label>
                <textarea
                  id="content"
                  {...register("content")}
                  placeholder="Write your article content here..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                  rows={12}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-semibold">
                  Category
                </label>
                <select
                  id="category"
                  {...register("category")}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label htmlFor="tags" className="block text-sm font-semibold">
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  {...register("tags")}
                  placeholder="react, javascript, web-development"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.tags && (
                  <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t border-border">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                >
                  Publish Article
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-3 border border-border rounded-lg hover:bg-background-alt transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

"use client"

import type { BlogPost } from "@/context/BlogContext"
import Link from "next/link"
import { formatDistance } from "date-fns"

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  const reactionsArray = Object.entries(post.reactions).map(([emoji, count]) => ({ emoji, count }))

  return (
    <Link href={`/post/${post.id}`}>
      <article className="group bg-white border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-background-alt">
          <img
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={post.author.avatar || "/placeholder.svg"}
              alt={post.author.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{post.author.name}</p>
              <p className="text-xs text-foreground-muted">
                {formatDistance(post.createdAt, new Date(), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-foreground-muted mb-4 line-clamp-2 flex-grow">{post.excerpt}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-background-alt text-foreground-muted px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>


        </div>
      </article>
    </Link>
  )
}

"use client"

import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { commentService, Comment } from '@/lib/blog-service'

interface CommentSectionProps {
  postId: string
}

// Simple time ago function
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
    }
  }
  
  return 'just now'
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth()
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch comments from Supabase
  const fetchComments = async () => {
    try {
      setLoading(true)
      const data = await commentService.getCommentsByPostId(postId)
      setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  // Load comments on mount
  useEffect(() => {
    fetchComments()
  }, [postId])

  const handleAddComment = async () => {
    if (!user || !commentText.trim()) return

    try {
      // Add comment to Supabase
      await commentService.createComment({
        post_id: postId,
        user_id: user.id,
        content: commentText,
        parent_id: undefined,
      })
      
      // Refresh comments
      await fetchComments()
      
      // Clear the input
      setCommentText("")
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Comments ({comments.length})</h3>

      {user ? (
        <div className="flex gap-4">
          <img 
            src={user.avatar || "/placeholder.svg"} 
            alt={user.name} 
            className="w-10 h-10 rounded-full" 
          />
          <div className="flex-grow">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Please log in to comment.</p>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
              <img
                src={
                  comment.author?.avatar_url || 
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.id}`
                }
                alt={comment.author?.full_name || comment.author?.username || "Anonymous"}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">
                    {comment.author?.full_name || comment.author?.username || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {timeAgo(new Date(comment.created_at))}
                  </p>
                </div>
                <p className="text-gray-800 mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
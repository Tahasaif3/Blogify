import { supabase } from './supabase';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_id: string;
  image?: string;
  category?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  published: boolean;
  author?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  _count?: {
    comments: number;
    reactions: number;
  };
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string;
  author?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// Posts API
export const postService = {
  // Get paginated published posts
  getPosts: async (page: number = 1, limit: number = 5) => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        content, 
        excerpt, 
        author_id, 
        image, 
        category, 
        tags, 
        created_at, 
        updated_at,
        published
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Fetch user profiles and counts for each post
    const postsWithAdditionalData = [];
    
    for (const post of data) {
      try {
        // Get user info from profiles
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', post.author_id)
          .single();

        // Get comment count for this post
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Get reaction count for this post
        const { count: reactionsCount } = await supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        postsWithAdditionalData.push({
          ...post,
          author: userData || {
            id: post.author_id,
            username: 'Anonymous',
            full_name: 'Anonymous',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`
          },
          _count: {
            comments: commentsCount || 0,
            reactions: reactionsCount || 0
          },
          reactions: {} // Initialize as empty, populate separately if needed
        });
      } catch (err) {
        // If user profile not found, use a default
        // Get comment count for this post
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Get reaction count for this post
        const { count: reactionsCount } = await supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        postsWithAdditionalData.push({
          ...post,
          author: {
            id: post.author_id,
            username: 'Anonymous',
            full_name: 'Anonymous',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`
          },
          _count: {
            comments: commentsCount || 0,
            reactions: reactionsCount || 0
          },
          reactions: {} // Initialize as empty, populate separately if needed
        });
      }
    }
    
    return postsWithAdditionalData;
  },

  // Get total count of published posts
  getPostsCount: async () => {
    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    if (error) throw error;

    return count || 0;
  },

  // Get post by ID
  getPostById: async (id: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        content, 
        excerpt, 
        author_id, 
        image, 
        category, 
        tags, 
        created_at, 
        updated_at,
        published
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Get user profile separately
    let author = {
      id: data.author_id,
      username: 'Anonymous',
      full_name: 'Anonymous',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.author_id}`
    };
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', data.author_id)
        .single();
        
      if (userData) {
        author = {
          ...userData,
          id: userData.id
        };
      } else {
        // If no user data was found, use default values
        author = {
          id: data.author_id,
          username: 'Anonymous',
          full_name: 'Anonymous',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.author_id}`
        };
      }
    } catch (err) {
      console.error('Error fetching author profile:', err);
    }
    
    // Get reaction counts for this post
    const { data: reactionsData, error: reactionsError } = await supabase
      .from('reactions')
      .select('emoji')
      .eq('post_id', id);
      
    // Group reactions by emoji and count them
    const reactions: Record<string, number> = {};
    if (reactionsData) {
      reactionsData.forEach((reaction: { emoji: string }) => {
        if (reactions[reaction.emoji]) {
          reactions[reaction.emoji]++;
        } else {
          reactions[reaction.emoji] = 1;
        }
      });
    }
    
    // Get comments count for this post
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id);
    
    return {
      ...data,
      author,
      reactions,
      _count: {
        comments: commentsCount || 0,
        reactions: reactionsData?.length || 0
      }
    };
  },

  // Create a new post
  createPost: async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'published'>) => {
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        author_id: postData.author_id,
        image: postData.image,
        category: postData.category,
        tags: postData.tags,
        published: false // Draft by default
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // Update a post
  updatePost: async (id: string, postData: Partial<Post>) => {
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...postData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // Delete a post
  deletePost: async (id: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Publish a post
  publishPost: async (id: string) => {
    const { data, error } = await supabase
      .from('posts')
      .update({ published: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
  
  // Add reaction to a post
  addReaction: async (postId: string, userId: string, emoji: string) => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .insert([{
          post_id: postId,
          user_id: userId,
          emoji
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      // If it's a duplicate key error, remove the existing reaction instead
      if (error.code === '23505') { // duplicate key error
        // Remove the existing reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
          .eq('emoji', emoji);
        
        return null; // Indicate that reaction was removed
      }
      
      throw error;
    }
  }
};

// Comments API
export const commentService = {
  // Get comments for a post
  getCommentsByPostId: async (postId: string) => {
    // First get the comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        parent_id
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    // Get unique user IDs to fetch profiles
    const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
    
    let profilesMap: Record<string, any> = {};
    
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        profilesMap = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
      }
    }
    
    // Combine comments with profile data
    return commentsData.map(comment => ({
      ...comment,
      author: profilesMap[comment.user_id] || {
        id: comment.user_id,
        username: 'Anonymous',
        full_name: 'Anonymous',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`
      }
    }));
  },

  // Create a comment
  createComment: async (commentData: Omit<Comment, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: commentData.post_id,
        user_id: commentData.user_id,
        content: commentData.content,
        parent_id: commentData.parent_id
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // Delete a comment
  deleteComment: async (id: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Reactions API
export const reactionService = {
  // Get reactions for a post
  getReactionsByPostId: async (postId: string) => {
    const { data, error } = await supabase
      .from('reactions')
      .select(`
        id,
        post_id,
        user_id,
        emoji,
        created_at
      `)
      .eq('post_id', postId);

    if (error) throw error;

    return data;
  },

  // Add a reaction to a post
  addReaction: async (postId: string, userId: string, emoji: string) => {
    const { data, error } = await supabase
      .from('reactions')
      .insert([{
        post_id: postId,
        user_id: userId,
        emoji
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // Remove a reaction from a post
  removeReaction: async (postId: string, userId: string, emoji: string) => {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('emoji', emoji);

    if (error) throw error;
  }
};
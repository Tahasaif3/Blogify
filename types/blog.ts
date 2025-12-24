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
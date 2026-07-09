export interface Group {
  id: number;
  name: string;
  description: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
  is_member?: boolean;
  creator_username?: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface Post {
  id: number;
  group_id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  username?: string;
  comment_count?: number;
  group_name?: string;
}

export interface CreatePostRequest {
  group_id: number;
  title: string;
  content: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  username?: string;
}

export interface CreateCommentRequest {
  post_id: number;
  content: string;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
  member_count?: number;
  is_member?: boolean;
  creator_username?: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
}

export interface Post {
  id: number;
  group_id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  username?: string;
  comment_count?: number;
  group_name?: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
  username?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  role: 'public' | 'user' | 'admin' | 'sub_admin';
  created_at: Date;
  updated_at: Date;
}

export interface UserRegistrationData {
  email: string;
  username: string;
  password: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: number;
  id: number; // Alias for userId for compatibility
  email: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
  token: string;
}

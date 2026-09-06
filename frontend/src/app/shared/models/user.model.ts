export interface AuthUser {
  fullName: string;
  email: string;
  age: number | null;
  educationLevel: string | null;
  interests: string[];
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  age: number;
  educationLevel: string;
  interests: string[];
}
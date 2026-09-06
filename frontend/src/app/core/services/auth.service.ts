import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';
import {
  AuthUser,
  LoginResponse,
  SignupRequest,
} from '../../shared/models/user.model';

const USER_KEY = 'civiclens_user';
const LOGGED_IN_KEY = 'civiclens_logged_in';
const TOKEN_KEY = 'civiclens_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = `${API_BASE_URL}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  signup(payload: SignupRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/signup`,
      payload
    );
  }

  fetchMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`);
  }

  persistSession(user: AuthUser, token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(LOGGED_IN_KEY, 'true');
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? (JSON.parse(saved) as AuthUser) : null;
  }

  isLoggedIn(): boolean {
    return (
      localStorage.getItem(LOGGED_IN_KEY) === 'true' &&
      localStorage.getItem(TOKEN_KEY) !== null
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LOGGED_IN_KEY);
  }
}
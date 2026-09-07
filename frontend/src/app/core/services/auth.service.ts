import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { API_BASE_URL } from './api-config';
import {
  AuthUser,
  LoginResponse,
  RefreshResponse,
  SignupRequest,
} from '../models/user.model';

const USER_KEY = 'civiclens_user';
const LOGGED_IN_KEY = 'civiclens_logged_in';
const TOKEN_KEY = 'civiclens_token';
const REFRESH_TOKEN_KEY = 'civiclens_refresh_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());

  authState$ = this.authState.asObservable();

  private apiUrl = `${API_BASE_URL}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  googleLogin(credential: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/google`, { credential });
  }

  forgotPassword(email: string): Observable<{ message: string; dev_reset_link?: string }> {
    return this.http
      .post<{ message: string; dev_reset_link?: string }>(
        `${this.apiUrl}/forgot-password`,
        { email }
      );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/reset-password`,
        { token, new_password: newPassword }
      );
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

  refresh(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    return this.http
      .post<RefreshResponse>(`${this.apiUrl}/refresh`, {
        refresh_token: refreshToken,
      })
      .pipe(
        tap((response) => {
          this.storeTokens(
            response.access_token,
            response.refresh_token,
            this.usesSessionStorage()
          );
        })
      );
  }

  /** True when the session lives in sessionStorage (remember-me off). */
  private usesSessionStorage(): boolean {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) !== null;
  }

  persistSession(user: AuthUser, accessToken: string, refreshToken: string, rememberMe = true): void {
    this.storeTokens(accessToken, refreshToken, rememberMe);
    this.setUser(user, rememberMe);
    this.setLoggedIn(rememberMe);
    this.authState.next(true);
  }

  storeTokens(accessToken: string, refreshToken: string, rememberMe = true): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private setUser(user: AuthUser, rememberMe = true): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  private setLoggedIn(rememberMe = true): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(LOGGED_IN_KEY, 'true');
  }

  getToken(): string | null {
    return this.getFromStorage(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.getFromStorage(REFRESH_TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    const saved = this.getFromStorage(USER_KEY);
    return saved ? (JSON.parse(saved) as AuthUser) : null;
  }

  isLoggedIn(): boolean {
    return (
      (this.getFromStorage(LOGGED_IN_KEY) ?? null) === 'true' &&
      this.getFromStorage(TOKEN_KEY) !== null
    );
  }

  private getFromStorage(key: string): string | null {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      this.http
        .post(`${this.apiUrl}/logout`, { refresh_token: refreshToken })
        .subscribe({ error: () => {} });
    }

    this.clearSession();
  }

  clearSession(): void {
    [localStorage, sessionStorage].forEach((storage) => {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
      storage.removeItem(USER_KEY);
      storage.removeItem(LOGGED_IN_KEY);
    });
    this.authState.next(false);
  }
}
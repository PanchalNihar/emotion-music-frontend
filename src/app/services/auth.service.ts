import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface GoogleAuthRequest {
  credential: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check if user is already logged in
    this.loadStoredUser();
    // Initialize Google Sign-In
    this.initializeGoogleSignIn();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('current_user');
    if (token && user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.logout();
      }
    }
  }

  private initializeGoogleSignIn(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '61367993371-uo7te2rdier6c48o1002tr1gbhri5a91.apps.googleusercontent.com',
        callback: this.handleGoogleSignIn.bind(this)
      });
    }
  }

  signInWithGoogle(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.prompt();
    }
  }

  renderGoogleSignInButton(elementId: string): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: 'filled_blue',
          size: 'large',
          width: 250,
          text: 'continue_with'
        }
      );
    }
  }

  private handleGoogleSignIn(response: any): void {
    const googleAuthRequest: GoogleAuthRequest = {
      credential: response.credential
    };
    
    this.googleAuth(googleAuthRequest).subscribe({
      next: (authResponse) => {
        console.log('Google Sign-In successful:', authResponse);
        // Auto-redirect after successful login
        this.router.navigate(['/music-recommendation']).then(() => {
          // Force reload to ensure all data is properly loaded
          window.location.reload();
        });
      },
      error: (error) => {
        console.error('Google Sign-In failed:', error);
      }
    });
  }

  // Traditional registration
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData)
      .pipe(
        tap(response => {
          this.setAuthData(response);
          this.router.navigate(['/music-recommendation']);
        })
      );
  }

  // Traditional login
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        tap(response => {
          this.setAuthData(response);
          this.router.navigate(['/music-recommendation']);
        })
      );
  }

  // Google OAuth
  googleAuth(credentials: GoogleAuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/google`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response);
        })
      );
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    
    // Sign out from Google
    if (typeof google !== 'undefined') {
      google.accounts.id.disableAutoSelect();
    }
    
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

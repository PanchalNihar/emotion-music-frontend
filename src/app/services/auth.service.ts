import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Only initialize if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Check if user is already logged in
      this.loadStoredUser();
      // Initialize Google Sign-In
      this.initializeGoogleSignIn();
    }
  }

  private loadStoredUser(): void {
    // Double-check we're in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: `${environment.client_id}`,
        callback: this.handleGoogleSignIn.bind(this)
      });
    }
  }

  signInWithGoogle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof google !== 'undefined') {
      google.accounts.id.prompt();
    }
  }

  renderGoogleSignInButton(elementId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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
          if (isPlatformBrowser(this.platformId)) {
            window.location.reload();
          }
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      
      // Sign out from Google
      if (typeof google !== 'undefined') {
        google.accounts.id.disableAutoSelect();
      }
    }
    
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

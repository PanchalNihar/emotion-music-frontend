import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService, LoginRequest, RegisterRequest } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  isLoading = false;
  errorMessage = '';
  isLoginMode = true;

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  registerData: RegisterRequest = {
    email: '',
    password: '',
    username: '',
    full_name: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/music-recommendation']);
    }
  }

  ngAfterViewInit(): void {
    // Render Google Sign-In button after view initialization
    setTimeout(() => {
      this.authService.renderGoogleSignInButton('google-signin-button');
    }, 100);
  }

  setMode(mode: 'login' | 'register'): void {
    this.isLoginMode = mode === 'login';
    this.errorMessage = '';
    this.clearForms();
  }

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isLoading = false;
        // Navigation is handled in auth service
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.detail || 'Login failed. Please try again.';
      }
    });
  }

  onRegister(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.isLoading = false;
        // Navigation is handled in auth service
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.detail || 'Registration failed. Please try again.';
      }
    });
  }

  signInWithGoogle(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.signInWithGoogle();
  }

  private clearForms(): void {
    this.loginData = { email: '', password: '' };
    this.registerData = { email: '', password: '', username: '', full_name: '' };
  }
}

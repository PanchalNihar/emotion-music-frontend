import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import {
  MusicRecommendationResponse,
  MusicRecommendationService,
} from '../../services/music-recommendation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-music-recommendation',
  imports: [CommonModule],
  templateUrl: './music-recommendation.component.html',
  styleUrl: './music-recommendation.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate(
          '400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms cubic-bezier(0.55, 0.055, 0.675, 0.19)',
          style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' })
        ),
      ]),
    ]),
    trigger('staggerIn', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class MusicRecommendationComponent implements OnInit {
  isLoading = false;
  results: MusicRecommendationResponse | null = null;
  errorMessage: string | null = null;
  isDarkMode = true; // Default to dark mode for Spotify-like experience
  currentUser: User | null = null; // To hold the current user information
  lastEmotion = '';
  lastWasImage = false;
  constructor(
    private musicService: MusicRecommendationService,
    private renderer: Renderer2,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set initial dark theme
    this.renderer.removeClass(document.body, 'light-theme');
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.removeClass(document.body, 'light-theme');
    } else {
      this.renderer.addClass(document.body, 'light-theme');
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file.';
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage =
        'Image file is too large. Please select a file smaller than 10MB.';
      return;
    }

    this.startLoading();
    this.musicService.getRecsByImage(file).subscribe(this.handleResponse());
    this.lastWasImage = true;
  }

  onTextSearch(mood: string,offset=0): void {
    if (!mood || mood.trim() === '') {
      this.errorMessage = 'Please enter a mood or feeling to search for music.';
      return;
    }

    // Clean and validate input
    const cleanMood = mood.trim().toLowerCase();
    if (cleanMood.length < 2) {
      this.errorMessage =
        'Please enter at least 2 characters to describe your mood.';
      return;
    }

    this.startLoading();
    this.lastWasImage = false;
    this.lastEmotion = cleanMood;
    this.musicService
      .getRecsByText(this.lastEmotion, offset)
      .subscribe(this.handleResponse());
  }

  private startLoading(): void {
    this.isLoading = true;
    this.results = null;
    this.errorMessage = null;
  }

  private handleResponse() {
    return {
      next: (response: MusicRecommendationResponse) => {
        this.results = response;
        this.isLoading = false;
        this.lastEmotion = response.emotion;
        // Validate response data
        if (!response.tracks || response.tracks.length === 0) {
          this.errorMessage =
            'No tracks found for your mood. Please try a different search.';
          this.results = null;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('API Error:', error);
        this.isLoading = false;

        // Provide user-friendly error messages
        if (error.status === 0) {
          this.errorMessage =
            'Unable to connect to the service. Please check your internet connection and try again.';
        } else if (error.status === 429) {
          this.errorMessage =
            'Too many requests. Please wait a moment and try again.';
        } else if (error.status >= 500) {
          this.errorMessage =
            'Server is temporarily unavailable. Please try again later.';
        } else {
          this.errorMessage =
            error.error?.detail || 'Something went wrong. Please try again.';
        }
      },
    };
  }

  reset(): void {
    this.results = null;
    this.isLoading = false;
    this.errorMessage = null;

    // Clear file input
    const fileInput = document.getElementById(
      'file-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  refreshTracks(): void {
    if (!this.lastEmotion) {
      return;
    }
    this.startLoading();
    const offset = Math.floor(Math.random() * 800);
    this.musicService
      .getRecsByText(this.lastEmotion, offset)
      .subscribe(this.handleResponse());
  }
  // Utility method for better user experience
  onInputFocus(event: Event): void {
    const target = event.target as HTMLElement;
    target.parentElement?.classList.add('focused');
  }

  onInputBlur(event: Event): void {
    const target = event.target as HTMLElement;
    target.parentElement?.classList.remove('focused');
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

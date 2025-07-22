import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicRecommendationService, MusicRecommendationResponse } from './services/music-recommendation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // THIS IS THE CRUCIAL PART THAT WAS MISSING
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  isLoading = false;
  results: MusicRecommendationResponse | null = null;
  errorMessage: string | null = null;
  isDarkMode = false;

  constructor(private musicService: MusicRecommendationService, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      this.renderer.addClass(document.body, 'dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    this.startLoading();
    this.musicService.getRecsByImage(file).subscribe(this.handleResponse());
  }

  onTextSearch(mood: string): void {
    if (!mood || mood.trim() === '') return;
    this.startLoading();
    this.musicService.getRecsByText(mood).subscribe(this.handleResponse());
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
      },
      error: (error: HttpErrorResponse) => {
        console.error('API Error:', error);
        this.errorMessage = error.error?.detail || 'An unknown error occurred. Please try again.';
        this.isLoading = false;
      }
    };
  }

  reset(): void {
    this.results = null;
    this.isLoading = false;
    this.errorMessage = null;
  }
}
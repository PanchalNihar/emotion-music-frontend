// src/app/components/mood-tune/containers/recommendation-page/recommendation-page.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  Renderer2,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Services
import {
  MusicRecommendationResponse,
  MusicRecommendationService,
  Track,
} from '../../services/music-recommendation.service';
import { User, AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../mood-tune/ui/theme-toggle/theme-toggle.component';
import { UserHeaderComponent } from '../mood-tune/ui/user-header/user-header.component';
import { ImageUploadCardComponent } from '../mood-tune/ui/image-upload-card/image-upload-card.component';
import { TextSearchCardComponent } from '../mood-tune/ui/text-search-card/text-search-card.component';
import { LoadingStateComponent } from '../mood-tune/ui/loading-state/loading-state.component';
import { PlaylistHeaderComponent } from '../mood-tune/ui/playlist-header/playlist-header.component';
import { TrackListComponent } from '../mood-tune/ui/track-list/track-list.component';
import { ActionButtonsComponent } from '../mood-tune/ui/action-buttons/action-buttons.component';

// UI Components

// ... other UI components

@Component({
  selector: 'app-recommendation-page',
  standalone: true,
  imports: [
    CommonModule,
    ThemeToggleComponent,
    UserHeaderComponent,
    ImageUploadCardComponent,
    TextSearchCardComponent,
    LoadingStateComponent,
    PlaylistHeaderComponent,
    TrackListComponent,
    ActionButtonsComponent,
    // ... other UI components
  ],
  templateUrl: './music-recommendation.component.html',
  styleUrls: ['./music-recommendation.component.css'],
})
export class MusicRecommendationComponent implements OnInit, OnDestroy {
  // State
  isLoading = false;
  results: MusicRecommendationResponse | null = null;
  errorMessage: string | null = null;
  isDarkMode = true;
  currentUser: User | null = null;

  // Image upload state
  uploadedImageData: string | null = null;
  detectedMood = '';
  moodConfidence = 0;
  loadingMessage = 'Analyzing your mood...';
  expandedTrackId: string | null = null;
  // Audio state
  currentlyPlaying: string | null = null;
  audioElement: HTMLAudioElement | null = null;
  lastEmotion: any;
isCameraMode: any;

  constructor(
    private musicService: MusicRecommendationService,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.renderer.removeClass(document.body, 'light-theme');
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  // Theme
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.removeClass(document.body, 'light-theme');
    } else {
      this.renderer.addClass(document.body, 'light-theme');
    }
  }

  // Image upload
  onFileSelected(file: File): void {
    // Validation logic...
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageData = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.loadingMessage = 'Analyzing your facial expression...';
    this.startLoading();

    this.musicService.getRecsByImage(file).subscribe({
      next: (response) => {
        this.detectedMood = response.emotion;
        this.moodConfidence = response.confidence || 0;
        this.handleSuccess(response);
      },
      error: (error) => this.handleError(error),
    });
  }

  onTextSearch(mood: string): void {
    this.loadingMessage = 'Finding tracks for your mood...';
    this.startLoading();

    this.musicService.getRecsByText(mood, 0).subscribe({
      next: (response) => this.handleSuccess(response),
      error: (error) => this.handleError(error),
    });
  }

  onSuggestionSelected(suggestion: string): void {
    this.onTextSearch(suggestion);
  }

  clearUploadedImage(): void {
    this.uploadedImageData = null;
    this.detectedMood = '';
    this.moodConfidence = 0;
  }

  // User actions
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  viewHistory(): void {
    this.router.navigate(['/mood-history']);
  }

  openPreferences(): void {
    this.router.navigate(['/preferences']);
  }

  // Audio control
  playPreview(track: Track): void {
    if (!track.preview_url) return;

    // Stop current audio if playing
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }

    if (this.currentlyPlaying === track.id) {
      this.currentlyPlaying = null;
      return;
    }

    this.audioElement = new Audio(track.preview_url);
    this.audioElement.play();
    this.currentlyPlaying = track.id;

    // Auto-stop after 30 seconds
    this.audioElement.addEventListener('ended', () => {
      this.currentlyPlaying = null;
      this.audioElement = null;
    });
  }
  async saveAsPlaylist(): Promise<void> {
    if (!this.results?.tracks) return;
    const trackIds = this.results.tracks.map((t) => t.id).filter((id) => id);
    const playlistName = `Tuneify - ${this.results.emotion} Mix`;

    try {
      await this.musicService
        .createSpotifyPlaylist(trackIds, playlistName)
        .toPromise();
      console.log('Playlist saved successfully!');
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  }
  playAll(): void {
    if (this.results && this.results.tracks && this.results.tracks.length > 0) {
      const firstTrackWithPreview = this.results.tracks.find(
        (track) => track.has_preview
      );
      if (firstTrackWithPreview) {
        this.playPreview(firstTrackWithPreview);
      }
    }
  }

  refreshTracks(): void {
    // Safely get the current mood from results (already displayed)
    const mood = this.results?.emotion?.trim();
    if (!mood) {
      this.errorMessage = 'No mood to refresh. Please search for a mood first.';
      return;
    }
    this.loadingMessage = 'Finding new tracks...';
    this.startLoading();
    const offset = Math.floor(Math.random() * 800);

    // Always fetch by current displayed emotion, not prior state
    this.musicService.getRecsByText(mood, offset).subscribe({
      next: (response) => this.handleSuccess(response),
      error: (error) => this.handleError(error),
    });
  }

  reset(): void {
    this.results = null;
    this.isLoading = false;
    this.errorMessage = null;
    this.clearUploadedImage();
    this.detectedMood = '';
    this.moodConfidence = 0;

    // Stop any playing audio
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
      this.currentlyPlaying = null;
    }
  }
  // Helper methods
  private startLoading(): void {
    this.isLoading = true;
    this.results = null;
    this.errorMessage = null;
  }

  private handleSuccess(response: MusicRecommendationResponse): void {
    this.results = response;
    this.isLoading = false;
    this.lastEmotion = response.emotion;
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.errorMessage = 'Something went wrong. Please try again.';
  }

  ngOnDestroy(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
  }
  toggleTrackExpansion(trackId: string): void {
    this.expandedTrackId = this.expandedTrackId === trackId ? null : trackId;
  }
}

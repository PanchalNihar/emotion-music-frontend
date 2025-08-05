import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
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
  Track,
} from '../../services/music-recommendation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, User } from '../../services/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';

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
  // Core state
  isLoading = false;
  results: MusicRecommendationResponse | null = null;
  errorMessage: string | null = null;
  isDarkMode = true;
  currentUser: User | null = null;
  lastEmotion = '';
  lastWasImage = false;

  // Track controls
  expandedTrackId: string | null = null;
  currentlyPlaying: string | null = null;
  audioElement: HTMLAudioElement | null = null;

  // Enhanced UI state
  isProfileDropdownOpen = false;
  uploadedImageData: string | null = null;
  detectedMood: string = '';
  moodConfidence: number = 0;
  loadingMessage = 'Analyzing your mood...';

  // Mood suggestions for text input
  moodSuggestions = [
    'happy',
    'sad',
    'energetic',
    'calm',
    'romantic',
    'angry',
    'excited',
    'melancholy',
    'chill',
    'upbeat',
    'gym',
    'study',
    'relaxing',
    'party',
    'focus',
  ];

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

  // Theme management
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.removeClass(document.body, 'light-theme');
    } else {
      this.renderer.addClass(document.body, 'light-theme');
    }
  }

  // Profile dropdown management
  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-dropdown')) {
      this.isProfileDropdownOpen = false;
    }
  }

  logout(): void {
    console.log('Logout clicked - function invoked!');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  viewHistory(): void {
    this.isProfileDropdownOpen = false;
    // Navigate to history page or open history modal
    console.log('View mood history');
    // Implement: this.router.navigate(['/history']);
  }

  openPreferences(): void {
    this.isProfileDropdownOpen = false;
    // Navigate to preferences page or open preferences modal
    console.log('Open user preferences');
    // Implement: this.router.navigate(['/preferences']);
  }

  // Enhanced file upload with preview
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

    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageData = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.loadingMessage = 'Analyzing your facial expression...';
    this.startLoading();
    this.lastWasImage = true;

    this.musicService.getRecsByImage(file).subscribe({
      next: (response) => {
        this.detectedMood = response.emotion;
        this.moodConfidence = response.confidence || 0;
        this.handleResponse().next(response);
      },
      error: (error) => {
        this.handleResponse().error(error);
      },
    });
  }

  clearUploadedImage(): void {
    this.uploadedImageData = null;
    this.detectedMood = '';
    this.moodConfidence = 0;
    // Clear file input
    const fileInput = document.getElementById(
      'file-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Enhanced text search with form submission
  onTextSearchSubmit(event: Event, mood: string): void {
    event.preventDefault();
    this.onTextSearch(mood);
  }

  onTextSearch(mood: string, offset = 0): void {
    if (!mood || mood.trim() === '') {
      this.errorMessage = 'Please enter a mood or feeling to search for music.';
      return;
    }

    const cleanMood = mood.trim().toLowerCase();
    if (cleanMood.length < 2) {
      this.errorMessage =
        'Please enter at least 2 characters to describe your mood.';
      return;
    }

    this.loadingMessage = 'Finding tracks for your mood...';
    this.startLoading();
    this.lastWasImage = false;
    this.lastEmotion = cleanMood;

    this.musicService
      .getRecsByText(this.lastEmotion, offset)
      .subscribe(this.handleResponse());
  }

  // Mood suggestion selection
  selectSuggestion(suggestion: string): void {
    const input = document.querySelector('.mood-input') as HTMLInputElement;
    if (input) {
      input.value = suggestion;
      this.onTextSearch(suggestion);
    }
  }

  onInputChange(event: any): void {
    // Optional: Add real-time suggestions based on input
    const value = event.target.value.toLowerCase();
    // Could implement suggestion filtering here
  }

  // Track management
  toggleTrackExpansion(trackId: string): void {
    this.expandedTrackId = this.expandedTrackId === trackId ? null : trackId;
  }

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

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Playlist actions
  playAll(): void {
    if (this.results && this.results.tracks && this.results.tracks.length > 0) {
      // Play the first track with preview
      const firstTrackWithPreview = this.results.tracks.find(
        (track) => track.has_preview
      );
      if (firstTrackWithPreview) {
        this.playPreview(firstTrackWithPreview);
      }
    }
  }

  async saveAsPlaylist(): Promise<void> {
    if (!this.results?.tracks) return;

    const trackIds = this.results.tracks.map((t) => t.id).filter((id) => id);
    const playlistName = `MoodTune - ${this.results.emotion} Mix`;

    try {
      await this.musicService
        .createSpotifyPlaylist(trackIds, playlistName)
        .toPromise();
      // Show success message (you could add a toast notification here)
      console.log('Playlist saved successfully!');
    } catch (error) {
      console.error('Failed to create playlist:', error);
      // Show error message (you could add a toast notification here)
    }
  }

  // Mood-based utilities
  getMoodEmoji(emotion: string): string {
    const emojiMap: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      calm: '😌',
      energetic: '⚡',
      romantic: '💕',
      excited: '🤩',
      neutral: '😐',
      fearful: '😰',
      surprised: '😲',
      disgusted: '🤢',
    };
    return emojiMap[emotion.toLowerCase()] || '🎵';
  }

  getPlaylistDescription(emotion: string): string {
    const descriptions: { [key: string]: string } = {
      happy: 'Uplifting tracks to keep your spirits high and energy flowing',
      sad: 'Melancholic melodies that understand and embrace your feelings',
      angry: 'Intense beats to channel your energy and release tension',
      calm: 'Peaceful sounds to soothe your mind and relax your soul',
      energetic: 'High-energy anthems to fuel your motivation and drive',
      romantic: 'Love songs to set the perfect mood for your heart',
      excited: 'Thrilling beats that match your enthusiasm and joy',
      neutral: 'Balanced tracks for any moment and any mood',
      fearful: 'Comforting melodies to ease your worries',
      surprised: 'Unexpected gems that will delight and amaze',
      disgusted: 'Cleansing beats to refresh your musical palate',
    };
    return (
      descriptions[emotion.toLowerCase()] ||
      `Carefully curated tracks matching your ${emotion.toLowerCase()} vibe`
    );
  }

  // Core state management
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

  refreshTracks(): void {
    if (!this.lastEmotion) return;

    this.loadingMessage = 'Finding new tracks...';
    this.startLoading();
    const offset = Math.floor(Math.random() * 800);

    this.musicService
      .getRecsByText(this.lastEmotion, offset)
      .subscribe(this.handleResponse());
  }

  // Utility methods for better UX
  onInputFocus(event: Event): void {
    const target = event.target as HTMLElement;
    target.parentElement?.classList.add('focused');
  }

  onInputBlur(event: Event): void {
    const target = event.target as HTMLElement;
    target.parentElement?.classList.remove('focused');
  }

  // Cleanup on component destroy
  ngOnDestroy(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
  }
}

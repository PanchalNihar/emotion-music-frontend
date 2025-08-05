// src/app/shared/types/music.types.ts
export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  album_art_url: string | null;
  preview_url: string | null;
  has_preview: boolean;
  spotify_url: string | null;
  duration_ms: number | null;
  explicit: boolean;
  popularity: number | null;
  release_date: string | null;
}

export interface MusicRecommendationResponse {
  emotion: string;
  confidence?: number;
  tracks: Track[];
  mood_entry_id?: string;
}

export interface MoodState {
  isLoading: boolean;
  results: MusicRecommendationResponse | null;
  error: string | null;
  uploadedImageData: string | null;
  detectedMood: string;
  moodConfidence: number;
}

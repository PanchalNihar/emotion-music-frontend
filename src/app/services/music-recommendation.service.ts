import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class MusicRecommendationService {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getRecsByImage(imageFile: File): Observable<MusicRecommendationResponse> {
    const formData = new FormData();
    formData.append('file', imageFile, imageFile.name);
    
    return this.http.post<MusicRecommendationResponse>(
      `${this.apiUrl}/api/recommendations/by-image`, 
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  getRecsByText(emotion: string,offset=0): Observable<MusicRecommendationResponse> {
    return this.http.get<MusicRecommendationResponse>(
      `${this.apiUrl}/api/recommendations/by-text/${emotion}?offset=${offset}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getMoodHistory(days: number = 30): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/analytics/mood-history?days=${days}`,
      { headers: this.getAuthHeaders() }
    );
  }
  
  createSpotifyPlaylist(trackIds: string[], playlistName: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/spotify/create-playlist`, {
    track_ids: trackIds,
    playlist_name: playlistName
  }, { headers: this.getAuthHeaders() });
}
}

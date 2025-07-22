import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Track {
  name: string;
  artist: string;
  album_art_url: string | null;
  preview_url: string | null;
  has_preview: boolean;
  spotify_url: string | null;
}

export interface MusicRecommendationResponse {
  emotion: string;
  tracks: Track[];
}
@Injectable({
  providedIn: 'root',
})
export class MusicRecommendationService {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  getRecsByImage(imageFile: File): Observable<MusicRecommendationResponse> {
    const formData = new FormData();
    formData.append('file', imageFile, imageFile.name);
    // The endpoint for image uploads is /by-image
    return this.http.post<MusicRecommendationResponse>(`${this.apiUrl}/by-image`, formData);
  }

  getRecsByText(emotion: string): Observable<MusicRecommendationResponse> {
    return this.http.get<MusicRecommendationResponse>(`${this.apiUrl}/by-text/${emotion}`);
  }
}

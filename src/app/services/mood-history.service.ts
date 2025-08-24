import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface MoodHistoryResponse {
  emotion_distribution: { [emotion: string]: number };
  total_entries: number;
  mood_timeline: { [date: string]: { [emotion: string]: number } };
  date_range: { start: string; end: string };
}

@Injectable({
  providedIn: 'root',
})
export class MoodHistoryService {
  private apiUrl = `${environment.apiUrl}`;
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    if (!isPlatformBrowser(this.platformId)) {
      return new HttpHeaders();
    }

    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getMoodHistory(days: number = 30): Observable<MoodHistoryResponse> {
    return this.http.get<MoodHistoryResponse>(
      `${this.apiUrl}/api/analytics/mood-history?days=${days}`,
      { headers: this.getAuthHeaders() }
    );
  }
}

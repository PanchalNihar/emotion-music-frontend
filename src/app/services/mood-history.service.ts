import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  getMoodHistory(days: number = 30): Observable<MoodHistoryResponse> {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<MoodHistoryResponse>(
      `${this.apiUrl}/api/analytics/mood-history?days=${days}`,
      { headers }
    );
  }
}

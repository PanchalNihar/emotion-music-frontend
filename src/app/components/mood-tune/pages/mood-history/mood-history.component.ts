import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MoodHistoryResponse, MoodHistoryService } from '../../../../services/mood-history.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mood-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-history.component.html',
  styleUrls: ['./mood-history.component.css'],
})
export class MoodHistoryComponent implements OnInit {
  moodHistory: MoodHistoryResponse | null = null;
  isLoading = true;
  error: string | null = null;
  selectedDays = 30;
  timeRangeOptions = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
  ];

  constructor(
    private moodHistoryService: MoodHistoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMoodHistory();
  }

  loadMoodHistory(): void {
    this.isLoading = true;
    this.error = null;
    
    this.moodHistoryService.getMoodHistory(this.selectedDays).subscribe({
      next: (data) => {
        this.moodHistory = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load mood history';
        this.isLoading = false;
        console.error('Mood history error:', err);
      }
    });
  }

  onTimeRangeChange(): void {
    this.loadMoodHistory();
  }

  goBackToRecommendations(): void {
    this.router.navigate(['/music-recommendation']);
  }

  moodKeys(): string[] {
    return this.moodHistory ? Object.keys(this.moodHistory.emotion_distribution) : [];
  }

  getMoodIcon(emotion: string): string {
    const iconMap: { [key: string]: string } = {
      'happy': '●',
      'sad': '●',
      'angry': '●',
      'calm': '●',
      'energetic': '●',
      'romantic': '●',
      'excited': '●',
      'neutral': '●',
      'fearful': '●',
      'surprised': '●',
      'disgusted': '●'
    };
    return iconMap[emotion.toLowerCase()] || '●';
  }

  getMoodColor(emotion: string): string {
    const colorMap: { [key: string]: string } = {
      'happy': '#2E7D32',
      'sad': '#1976D2',
      'angry': '#D32F2F',
      'calm': '#00796B',
      'energetic': '#F57C00',
      'romantic': '#7B1FA2',
      'excited': '#FF8F00',
      'neutral': '#424242',
      'fearful': '#5E35B1',
      'surprised': '#388E3C',
      'disgusted': '#689F38'
    };
    return colorMap[emotion.toLowerCase()] || 'var(--accent-primary)';
  }

  getTimelineData(): Array<{date: string, emotions: Array<{emotion: string, count: number}>}> {
    if (!this.moodHistory?.mood_timeline) return [];
    
    return Object.keys(this.moodHistory.mood_timeline)
      .sort()
      .map(date => ({
        date,
        emotions: Object.keys(this.moodHistory!.mood_timeline[date]).map(emotion => ({
          emotion,
          count: this.moodHistory!.mood_timeline[date][emotion]
        }))
      }));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getMaxCount(): number {
    return Math.max(...this.moodKeys().map(key => this.moodHistory!.emotion_distribution[key]));
  }

  getMostCommonMood(): string {
    if (!this.moodHistory?.emotion_distribution) return '';
    
    const emotions = Object.entries(this.moodHistory.emotion_distribution);
    if (emotions.length === 0) return '';
    
    const sorted = emotions.sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  }
}

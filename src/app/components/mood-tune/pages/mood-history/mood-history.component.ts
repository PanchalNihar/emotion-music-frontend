import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodHistoryResponse, MoodHistoryService } from '../../../../services/mood-history.service';
import { FormsModule } from '@angular/forms';
// (Inject your history service if needed)

@Component({
  selector: 'app-mood-history',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './mood-history.component.html',
  styleUrls: ['./mood-history.component.css'],
})
export class MoodHistoryComponent implements OnInit {
  moodHistory: MoodHistoryResponse | null = null;
  isLoading = true;
  error: string | null = null;
  constructor(private moodHistoryService:MoodHistoryService) {}
  ngOnInit(): void {
      this.moodHistoryService.getMoodHistory().subscribe({
        next: (data) => {
          this.moodHistory = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load mood history';
          this.isLoading = false;
        }
      })
  }
  moodKeys() {
  return this.moodHistory ? Object.keys(this.moodHistory.emotion_distribution) : [];
}

}

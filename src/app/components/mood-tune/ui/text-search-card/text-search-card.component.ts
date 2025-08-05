// src/app/components/mood-tune/ui/text-search-card/text-search-card.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-search-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-search-card.component.html',
  styleUrls: ['./text-search-card.component.css']
})
export class TextSearchCardComponent {
  @Output() textSearch = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<string>();

  moodSuggestions = [
    'happy', 'sad', 'energetic', 'calm', 'romantic',
    'angry', 'excited', 'chill', 'upbeat', 'gym'
  ];

  onSubmit(event: Event, mood: string): void {
    event.preventDefault();
    if (mood?.trim()) {
      this.textSearch.emit(mood.trim());
    }
  }
}

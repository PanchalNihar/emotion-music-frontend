import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../../../../services/music-recommendation.service';

@Component({
  selector: 'app-track-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-list.component.html',
  styleUrls: ['./track-list.component.css']
})
export class TrackListComponent {
  @Input() tracks: Track[] = [];
  @Input() expandedTrackId: string | null = null;
  @Input() currentlyPlaying: string | null = null;
  @Output() toggleExpansion = new EventEmitter<string>();
  @Output() playPreview = new EventEmitter<Track>();

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicRecommendationResponse } from '../../../../services/music-recommendation.service';

@Component({
  selector: 'app-playlist-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlist-header.component.html',
  styleUrls: ['./playlist-header.component.css']
})
export class PlaylistHeaderComponent {
  @Input() result!: MusicRecommendationResponse;
  @Output() playAll = new EventEmitter<void>();
  @Output() savePlaylist = new EventEmitter<void>();

  getMoodEmoji(emotion: string): string {
    const emojiMap: { [key: string]: string } = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'calm': '😌',
      'energetic': '⚡',
      'romantic': '💕',
      'excited': '🤩',
      'neutral': '😐',
      'fearful': '😰',
      'surprised': '😲',
      'disgusted': '🤢'
    };
    return emojiMap[emotion.toLowerCase()] || '🎵';
  }

  getPlaylistDescription(emotion: string): string {
    const descriptions: { [key: string]: string } = {
      'happy': 'Uplifting tracks to keep your spirits high and energy flowing',
      'sad': 'Melancholic melodies that understand and embrace your feelings',
      'angry': 'Intense beats to channel your energy and release tension',
      'calm': 'Peaceful sounds to soothe your mind and relax your soul',
      'energetic': 'High-energy anthems to fuel your motivation and drive',
      'romantic': 'Love songs to set the perfect mood for your heart',
      'excited': 'Thrilling beats that match your enthusiasm and joy',
      'neutral': 'Balanced tracks for any moment and any mood',
      'fearful': 'Comforting melodies to ease your worries',
      'surprised': 'Unexpected gems that will delight and amaze',
      'disgusted': 'Cleansing beats to refresh your musical palate'
    };
    return descriptions[emotion.toLowerCase()] || `Carefully curated tracks matching your ${emotion.toLowerCase()} vibe`;
  }
}

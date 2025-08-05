// src/app/components/mood-tune/ui/image-upload-card/image-upload-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload-card.component.html',
  styleUrls: ['./image-upload-card.component.css'],
})
export class ImageUploadCardComponent {
  @Input() uploadedImageData: string | null = null;
  @Input() detectedMood = '';
  @Input() moodConfidence = 0;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() clearImage = new EventEmitter<void>();

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }
}

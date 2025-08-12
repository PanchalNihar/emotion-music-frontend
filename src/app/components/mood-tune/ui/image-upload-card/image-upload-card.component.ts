import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-upload-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-upload-card.component.html',
  styleUrls: ['./image-upload-card.component.css']
})
export class ImageUploadCardComponent implements AfterViewInit {
  @ViewChild('videoElement', { static: false }) videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;

  @Input() uploadedImageData: string | null = null;
  @Input() detectedMood = '';
  @Input() moodConfidence = 0;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() clearImage = new EventEmitter<void>();

  // Camera states
  isCameraMode = false;
  isCameraActive = false;
  isCapturing = false;
  cameraError: string | null = null;
  stream: MediaStream | null = null;
  viewInitialized = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.viewInitialized = true;
  }

  async startCamera(): Promise<void> {
    this.cameraError = null;
    this.isCapturing = true;
    
    // First, set camera mode to render the video element
    this.isCameraMode = true;
    
    // Force change detection to render the video element
    this.cdr.detectChanges();
    
    // Wait a tick for the DOM to update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      // Wait for video element to be available
      let attempts = 0;
      while (!this.videoElement?.nativeElement && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!this.videoElement?.nativeElement) {
        throw new Error('Video element not available after waiting');
      }

      // Set video source and mark as active
      this.videoElement.nativeElement.srcObject = this.stream;
      this.isCameraActive = true;
      this.isCapturing = false;

    } catch (error: any) {
      this.cameraError = error.message || 'Camera access denied or not available. Please check permissions.';
      this.isCapturing = false;
      this.isCameraMode = false;
      console.error('Camera error:', error);
    }
  }

  capturePhoto(): void {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) {
      this.cameraError = 'Camera elements not ready. Please try again.';
      return;
    }

    this.isCapturing = true;

    try {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas size to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and then to File
      canvas.toBlob((blob) => {
        if (blob) {
          const timestamp = new Date().getTime();
          const file = new File([blob], `camera-capture-${timestamp}.jpg`, { 
            type: 'image/jpeg' 
          });

          // Create preview data URL
          const reader = new FileReader();
          reader.onload = (e) => {
            this.uploadedImageData = e.target?.result as string;
          };
          reader.readAsDataURL(blob);

          // Emit the file for processing
          this.fileSelected.emit(file);
          
          // Stop camera after capture
          this.stopCamera();
        }
      }, 'image/jpeg', 0.8);

    } catch (error) {
      console.error('Capture error:', error);
      this.cameraError = 'Failed to capture photo';
    } finally {
      this.isCapturing = false;
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraActive = false;
    this.isCameraMode = false;
    this.cameraError = null;
  }

  switchToUpload(): void {
    this.stopCamera();
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fileSelected.emit(file);
      event.target.value = '';
    }
  }

  clearCurrentImage(): void {
    this.stopCamera();
    this.clearImage.emit();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }
}

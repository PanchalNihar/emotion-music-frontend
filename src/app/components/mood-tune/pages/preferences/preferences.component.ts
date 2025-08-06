import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { FormBuilder, etc. } for real preferences

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent {
  // Use a real model/service in the future
  preferences = {
    theme: 'dark',
    favoriteGenres: ['Pop', 'Chill'],
    weeklySummary: true
  };
}

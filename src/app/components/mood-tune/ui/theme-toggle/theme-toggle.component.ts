// src/app/components/mood-tune/ui/theme-toggle/theme-toggle.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.css'],
})
export class ThemeToggleComponent {
  @Input() isDarkMode = true;
  @Output() themeChange = new EventEmitter<void>();
}

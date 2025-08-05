import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.css']
})
export class ActionButtonsComponent {
  @Output() refreshTracks = new EventEmitter<void>();
  @Output() newSearch = new EventEmitter<void>();
}

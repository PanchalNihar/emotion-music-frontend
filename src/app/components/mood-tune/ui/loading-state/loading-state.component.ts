// src/app/components/mood-tune/ui/loading-state/loading-state.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  templateUrl: './loading-state.component.html',
  styleUrls: ['./loading-state.component.css']
})
export class LoadingStateComponent {
  @Input() message = 'Analyzing your mood...';
}

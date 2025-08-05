// src/app/components/mood-tune/ui/user-header/user-header.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../services/auth.service';



@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent {
  @Input() user: User | null = null;
  @Output() logout = new EventEmitter<void>();
  @Output() viewHistory = new EventEmitter<void>();
  @Output() openPreferences = new EventEmitter<void>();

  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  getFirstName(user: User): string {
    return (user.full_name || user.username)?.split(' ')[0] || user.username;
  }
}

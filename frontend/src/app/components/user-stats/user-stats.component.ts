import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStat } from '../../core/models/analysis.model';

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-stats.component.html',
  styleUrl: './user-stats.component.scss'
})
export class UserStatsComponent {
  @Input() userStats: UserStat[] = [];

  getAvatarInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getAvatarColor(index: number): string {
    const colors = [
      '#00E599', '#6366F1', '#EC4899', '#F59E0B', '#14B8A6',
      '#8B5CF6', '#3B82F6', '#EF4444', '#10B981', '#F43F5E'
    ];
    return colors[index % colors.length];
  }
}

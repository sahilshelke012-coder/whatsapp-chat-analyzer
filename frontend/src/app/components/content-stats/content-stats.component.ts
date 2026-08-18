import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentAnalysis } from '../../core/models/analysis.model';

@Component({
  selector: 'app-content-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-stats.component.html',
  styleUrl: './content-stats.component.scss'
})
export class ContentStatsComponent {
  @Input() contentStats!: ContentAnalysis;

  getMediaEntries(): { name: string; count: number }[] {
    if (!this.contentStats?.mediaStats?.mediaByParticipant) return [];
    return Object.entries(this.contentStats.mediaStats.mediaByParticipant).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  }
}

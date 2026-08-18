import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverallStats } from '../../core/models/analysis.model';

@Component({
  selector: 'app-overall-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overall-stats.component.html',
  styleUrl: './overall-stats.component.scss'
})
export class OverallStatsComponent {
  @Input() stats!: OverallStats;
}

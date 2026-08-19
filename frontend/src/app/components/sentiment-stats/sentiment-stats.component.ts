import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SentimentAnalysis } from '../../core/models/analysis.model';

@Component({
  selector: 'app-sentiment-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sentiment-stats.component.html',
  styleUrl: './sentiment-stats.component.scss'
})
export class SentimentStatsComponent {
  @Input() sentiment!: SentimentAnalysis;
}

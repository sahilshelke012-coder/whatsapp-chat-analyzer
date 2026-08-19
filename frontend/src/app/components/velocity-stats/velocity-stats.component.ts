import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { VelocityAnalysis, UserStat, TimeAnalysis } from '../../core/models/analysis.model';

Chart.register(...registerables);

@Component({
  selector: 'app-velocity-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './velocity-stats.component.html',
  styleUrl: './velocity-stats.component.scss'
})
export class VelocityStatsComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() velocity!: VelocityAnalysis;
  @Input() userStats: UserStat[] = [];
  @Input() timeAnalysis?: TimeAnalysis;

  @ViewChild('velocityChartCanvas') velocityChartCanvas!: ElementRef<HTMLCanvasElement>;

  private velocityChart: Chart | null = null;
  private isViewInitialized = false;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.renderVelocityChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isViewInitialized && (changes['timeAnalysis'] || changes['velocity'])) {
      this.renderVelocityChart();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private destroyChart(): void {
    if (this.velocityChart) {
      try {
        this.velocityChart.destroy();
      } catch (e) {
        // Safe disposal
      }
      this.velocityChart = null;
    }
  }

  private renderVelocityChart(): void {
    if (!this.velocityChartCanvas?.nativeElement || !this.timeAnalysis?.byDate?.length) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.destroyChart();

      const existing = Chart.getChart(this.velocityChartCanvas.nativeElement);
      if (existing) {
        existing.destroy();
      }

      const timeData = this.timeAnalysis?.byDate || [];
      this.velocityChart = new Chart(this.velocityChartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: timeData.map(d => d.date),
          datasets: [{
            label: 'Message Volume Over Time',
            data: timeData.map(d => d.count),
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: '#00E599',
            pointRadius: 4
          }]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: {
              labels: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans', size: 12 } }
            }
          },
          scales: {
            x: {
              ticks: { color: '#64748B' },
              grid: { color: 'rgba(255, 255, 255, 0.04)' }
            },
            y: {
              ticks: { color: '#64748B' },
              grid: { color: 'rgba(255, 255, 255, 0.04)' }
            }
          }
        }
      });
    });
  }
}

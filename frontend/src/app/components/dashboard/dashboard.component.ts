import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TimeAnalysis, UserStat } from '../../core/models/analysis.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() timeAnalysis!: TimeAnalysis;
  @Input() userStats: UserStat[] = [];

  @ViewChild('dateChartCanvas') dateChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthChartCanvas') monthChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hourChartCanvas') hourChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dayOfWeekChartCanvas') dayOfWeekChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('userChartCanvas') userChartCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  private isViewInitialized = false;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.renderAllCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isViewInitialized && (changes['timeAnalysis'] || changes['userStats'])) {
      this.renderAllCharts();
    }
  }

  ngOnDestroy(): void {
    this.destroyAllCharts();
  }

  private destroyAllCharts(): void {
    this.charts.forEach(chart => {
      try {
        chart.destroy();
      } catch (e) {
        // Safe disposal
      }
    });
    this.charts = [];
  }

  private destroyCanvasChart(canvasRef: ElementRef<HTMLCanvasElement> | undefined): void {
    if (canvasRef?.nativeElement) {
      const existing = Chart.getChart(canvasRef.nativeElement);
      if (existing) {
        existing.destroy();
      }
    }
  }

  private renderAllCharts(): void {
    // Run Chart.js rendering OUTSIDE Angular zone to prevent change detection loops
    this.ngZone.runOutsideAngular(() => {
      this.destroyAllCharts();

      const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 400
        },
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
      };

      // 1. Messages by Date Chart (Line)
      if (this.dateChartCanvas?.nativeElement && this.timeAnalysis?.byDate?.length > 0) {
        this.destroyCanvasChart(this.dateChartCanvas);
        const chart = new Chart(this.dateChartCanvas.nativeElement, {
          type: 'line',
          data: {
            labels: this.timeAnalysis.byDate.map(d => d.date),
            datasets: [{
              label: 'Messages',
              data: this.timeAnalysis.byDate.map(d => d.count),
              borderColor: '#00E599',
              backgroundColor: 'rgba(0, 229, 153, 0.15)',
              fill: true,
              tension: 0.3,
              borderWidth: 2
            }]
          },
          options: commonOptions
        });
        this.charts.push(chart);
      }

      // 2. Messages by Month Chart (Bar)
      if (this.monthChartCanvas?.nativeElement && this.timeAnalysis?.byMonth?.length > 0) {
        this.destroyCanvasChart(this.monthChartCanvas);
        const chart = new Chart(this.monthChartCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: this.timeAnalysis.byMonth.map(m => m.month),
            datasets: [{
              label: 'Monthly Messages',
              data: this.timeAnalysis.byMonth.map(m => m.count),
              backgroundColor: '#6366F1',
              borderRadius: 6
            }]
          },
          options: commonOptions
        });
        this.charts.push(chart);
      }

      // 3. Messages by Hour (Bar)
      if (this.hourChartCanvas?.nativeElement && this.timeAnalysis?.byHour?.length > 0) {
        this.destroyCanvasChart(this.hourChartCanvas);
        const chart = new Chart(this.hourChartCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: this.timeAnalysis.byHour.map(h => `${h.hour}:00`),
            datasets: [{
              label: 'Messages by Hour',
              data: this.timeAnalysis.byHour.map(h => h.count),
              backgroundColor: '#EC4899',
              borderRadius: 4
            }]
          },
          options: commonOptions
        });
        this.charts.push(chart);
      }

      // 4. Messages by Day of Week (Bar)
      if (this.dayOfWeekChartCanvas?.nativeElement && this.timeAnalysis?.byDayOfWeek?.length > 0) {
        this.destroyCanvasChart(this.dayOfWeekChartCanvas);
        const chart = new Chart(this.dayOfWeekChartCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: this.timeAnalysis.byDayOfWeek.map(d => d.day),
            datasets: [{
              label: 'Day of Week Activity',
              data: this.timeAnalysis.byDayOfWeek.map(d => d.count),
              backgroundColor: '#F59E0B',
              borderRadius: 6
            }]
          },
          options: commonOptions
        });
        this.charts.push(chart);
      }

      // 5. Messages by Participant (Doughnut)
      if (this.userChartCanvas?.nativeElement && this.userStats?.length > 0) {
        this.destroyCanvasChart(this.userChartCanvas);
        const colors = ['#00E599', '#6366F1', '#EC4899', '#F59E0B', '#14B8A6', '#8B5CF6', '#3B82F6', '#EF4444'];
        const chart = new Chart(this.userChartCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: this.userStats.map(u => u.name),
            datasets: [{
              data: this.userStats.map(u => u.messages),
              backgroundColor: colors.slice(0, this.userStats.length),
              borderWidth: 2,
              borderColor: '#121A2A'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
              legend: {
                position: 'right',
                labels: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans' } }
              }
            }
          }
        });
        this.charts.push(chart);
      }
    });
  }
}

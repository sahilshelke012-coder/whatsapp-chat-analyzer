import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { OverallStatsComponent } from './components/overall-stats/overall-stats.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserStatsComponent } from './components/user-stats/user-stats.component';
import { ContentStatsComponent } from './components/content-stats/content-stats.component';
import { ChatAnalysisData } from './core/models/analysis.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadComponent,
    OverallStatsComponent,
    DashboardComponent,
    UserStatsComponent,
    ContentStatsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'WhatsApp Chat Analyzer';
  analysisData: ChatAnalysisData | null = null;

  onAnalysisReceived(data: ChatAnalysisData) {
    this.analysisData = data;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetAnalysis() {
    this.analysisData = null;
  }
}

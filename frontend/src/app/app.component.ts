import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { OverallStatsComponent } from './components/overall-stats/overall-stats.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserStatsComponent } from './components/user-stats/user-stats.component';
import { ContentStatsComponent } from './components/content-stats/content-stats.component';
import { ChatPreviewComponent } from './components/chat-preview/chat-preview.component';
import { SentimentStatsComponent } from './components/sentiment-stats/sentiment-stats.component';
import { VelocityStatsComponent } from './components/velocity-stats/velocity-stats.component';
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
    ContentStatsComponent,
    ChatPreviewComponent,
    SentimentStatsComponent,
    VelocityStatsComponent
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

  /**
   * Returns the clean raw uploaded file name (preserving .txt extension and unicode characters).
   */
  getRawUploadedFileName(fileName: string | undefined | null): string {
    if (!fileName) return 'sample_chat.txt';
    let clean = fileName.replace(/[\u202f\xa0\ufeff\u200e\u200f\r\n\t]/g, ' ').trim();
    return clean || 'sample_chat.txt';
  }

  /**
   * Formats a clean descriptive title heading for the dashboard.
   */
  getCleanFileName(fileName: string | undefined | null): string {
    if (!fileName) return 'sample_chat.txt';
    let clean = this.getRawUploadedFileName(fileName);
    if (!clean.toLowerCase().startsWith('whatsapp chat with')) {
      clean = `WhatsApp Chat with ${clean}`;
    }
    return clean;
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ChatAnalysisData } from '../../core/models/analysis.model';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  @Output() analysisCompleted = new EventEmitter<ChatAnalysisData>();

  selectedFile: File | null = null;
  isDragging = false;
  isAnalyzing = false;
  errorMessage: string | null = null;

  constructor(private apiService: ApiService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.validateAndSetFile(file);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
    // Reset file input value so selecting the same file again triggers change
    input.value = '';
  }

  validateAndSetFile(file: File) {
    this.errorMessage = null;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      this.errorMessage = 'Invalid file format. Please upload a WhatsApp exported .txt chat file.';
      this.selectedFile = null;
      return;
    }

    if (file.size === 0) {
      this.errorMessage = 'The selected file is empty. Please select a valid WhatsApp chat file.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  clearSelectedFile() {
    this.selectedFile = null;
    this.errorMessage = null;
    this.isAnalyzing = false;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  analyzeChat() {
    if (!this.selectedFile || this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.errorMessage = null;

    this.apiService.uploadAndAnalyzeChat(this.selectedFile).subscribe({
      next: (response) => {
        this.isAnalyzing = false;
        if (response.success && response.data) {
          this.analysisCompleted.emit(response.data);
        } else {
          this.errorMessage = response.message || 'Failed to parse chat file.';
        }
      },
      error: (err) => {
        this.isAnalyzing = false;
        console.error('Chat upload analysis error:', err);
        this.errorMessage = err.error?.error || err.error?.message || 'Server error occurred during chat analysis. Please ensure backend services are running.';
      }
    });
  }
}

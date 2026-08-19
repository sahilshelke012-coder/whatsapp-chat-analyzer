import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessagePreview } from '../../core/models/analysis.model';

@Component({
  selector: 'app-chat-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-preview.component.html',
  styleUrl: './chat-preview.component.scss'
})
export class ChatPreviewComponent {
  @Input() messages: ChatMessagePreview[] = [];
  @Input() fileName: string = '';

  searchTerm: string = '';
  isExpanded: boolean = true;

  get filteredMessages(): ChatMessagePreview[] {
    if (!this.searchTerm.trim()) {
      return this.messages;
    }
    const term = this.searchTerm.toLowerCase();
    return this.messages.filter(m =>
      m.author.toLowerCase().includes(term) ||
      m.message.toLowerCase().includes(term) ||
      m.date.toLowerCase().includes(term)
    );
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
}

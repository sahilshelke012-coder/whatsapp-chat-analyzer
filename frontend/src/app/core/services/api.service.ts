import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, ChatAnalysisData } from '../models/analysis.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api/chat';

  constructor(private http: HttpClient) {}

  /**
   * Upload WhatsApp chat txt file for analysis
   */
  uploadAndAnalyzeChat(file: File): Observable<ApiResponse<ChatAnalysisData>> {
    const formData = new FormData();
    formData.append('chatFile', file);
    return this.http.post<ApiResponse<ChatAnalysisData>>(`${this.baseUrl}/analyze`, formData);
  }

  /**
   * Get past analysis history
   */
  getHistory(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/history`);
  }

  /**
   * Get specific analysis result by ID
   */
  getAnalysisById(id: string): Observable<ApiResponse<ChatAnalysisData>> {
    return this.http.get<ApiResponse<ChatAnalysisData>>(`${this.baseUrl}/analysis/${id}`);
  }
}

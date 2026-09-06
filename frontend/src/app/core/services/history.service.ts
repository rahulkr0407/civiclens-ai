import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';
import { ChatMessage, ExplainResponse } from './ai';

export type SavedHistoryType = 'explain' | 'chat';

export interface SavedChatContent {
  messages: ChatMessage[];
  reply: string;
}

export interface SavedHistoryItem {
  id: string;
  type: SavedHistoryType;
  topicId: string;
  topicTitle: string;
  language: string;
  content: ExplainResponse | SavedChatContent;
  savedAt: string;
}

export interface HistoryResponse {
  items: SavedHistoryItem[];
}

export interface SaveHistoryRequest {
  type: SavedHistoryType;
  topicId: string;
  topicTitle: string;
  language: string;
  content: ExplainResponse | SavedChatContent;
}

@Injectable({
  providedIn: 'root',
})
export class HistoryService {

  private apiUrl = `${API_BASE_URL}/history`;

  constructor(private http: HttpClient) {}

  list(): Observable<HistoryResponse> {
    return this.http.get<HistoryResponse>(this.apiUrl);
  }

  save(request: SaveHistoryRequest): Observable<{ message: string; item: SavedHistoryItem }> {
    return this.http.post<{ message: string; item: SavedHistoryItem }>(
      this.apiUrl,
      request
    );
  }

  delete(itemId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${itemId}`
    );
  }

  clear(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.apiUrl);
  }
}
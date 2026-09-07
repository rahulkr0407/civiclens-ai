import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';
import { ChatMessage, ExplainResponse } from '../models/ai.model';
import {
  HistoryResponse,
  SaveHistoryRequest,
  SaveTopicRequest,
  SavedChatContent,
  SavedHistoryItem,
  SavedTopic,
  SavedTopicsResponse,
  SavedHistoryType,
} from '../models/history.model';

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

  listTopics(): Observable<SavedTopicsResponse> {
    return this.http.get<SavedTopicsResponse>(`${this.apiUrl}/topics`);
  }

  saveTopic(request: SaveTopicRequest): Observable<{ message: string; item: SavedTopic }> {
    return this.http.post<{ message: string; item: SavedTopic }>(
      `${this.apiUrl}/topics`,
      request
    );
  }

  deleteTopic(topicId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/topics/${topicId}`
    );
  }
}
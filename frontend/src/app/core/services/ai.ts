import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';
import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatTrackerRequest,
  ExplainRequest,
  ExplainResponse,
  ExplainTrackerRequest,
} from '../models/ai.model';

@Injectable({
  providedIn: 'root',
})
export class AiService {

  constructor(private http: HttpClient) {}

  explain(request: ExplainRequest): Observable<ExplainResponse> {
    return this.http.post<ExplainResponse>(
      `${API_BASE_URL}/ai/explain`,
      request
    );
  }

  explainTracker(request: ExplainTrackerRequest): Observable<ExplainResponse> {
    return this.http.post<ExplainResponse>(
      `${API_BASE_URL}/ai/explain-tracker`,
      request
    );
  }

  chat(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${API_BASE_URL}/ai/chat`,
      request
    );
  }

  chatTracker(request: ChatTrackerRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${API_BASE_URL}/ai/chat-tracker`,
      request
    );
  }
}
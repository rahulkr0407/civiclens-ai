import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface ExplainRequest {
  topic_id: string;
  age: number;
  education_level: string;
  interests: string[];
  style?: string;
  language?: string;
}

export interface ExplainTrackerRequest {
  tracker_id: string;
  age: number;
  education_level: string;
  interests: string[];
  style?: string;
  language?: string;
}

export interface ExplainViewpoint {
  side: string;
  explanation: string;
}

export interface ExplainResponse {
  topicTitle: string;
  simpleExplanation: string;
  whyItMatters: string;
  keyPoints: string[];
  viewpoints: ExplainViewpoint[];
  questionsToThinkAbout: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  topic_id: string;
  messages: ChatMessage[];
  language?: string;
}

export interface ChatResponse {
  reply: string;
}

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
}
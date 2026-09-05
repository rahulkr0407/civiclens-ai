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
}
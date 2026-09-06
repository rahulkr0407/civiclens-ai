import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export type TrackerType = 'bill' | 'protest';

export interface Tracker {
  id: string;
  type: TrackerType;
  title: string;
  category: string;
  status: string;
  stage: string;
  summary: string;
  viewpoints?: {
    side: string;
    explanation: string;
  }[];
  lastUpdated: string;
  sources: {
    name: string;
    url: string;
  }[];
}

export interface TrackersResponse {
  items: Tracker[];
}

@Injectable({
  providedIn: 'root',
})
export class TrackersService {

  private apiUrl = `${API_BASE_URL}/trackers`;

  constructor(private http: HttpClient) {}

  list(type?: TrackerType): Observable<TrackersResponse> {
    const params = type ? new HttpParams().set('type', type) : undefined;
    return this.http.get<TrackersResponse>(this.apiUrl, { params });
  }

  get(id: string): Observable<Tracker> {
    return this.http.get<Tracker>(`${this.apiUrl}/${id}`);
  }
}
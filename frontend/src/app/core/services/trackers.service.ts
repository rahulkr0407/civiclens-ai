import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';
import {
  Tracker,
  TrackerType,
  TrackersResponse,
} from '../models/tracker.model';

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
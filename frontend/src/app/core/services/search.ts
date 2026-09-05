import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Topic } from '../models/topic';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class SearchService {

  constructor(private http: HttpClient) {}

  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${API_BASE_URL}/topics`);
  }
}
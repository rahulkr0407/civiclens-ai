import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Topic } from '../models/topic';

@Injectable({
  providedIn: 'root',
})
export class SearchService {

  private apiUrl = 'https://civiclens-ai-1-f708.onrender.com/api/topics';

  constructor(private http: HttpClient) {}

  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(this.apiUrl);
  }
}
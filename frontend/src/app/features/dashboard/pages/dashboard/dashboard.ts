import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import {
  HistoryService,
  SavedChatContent,
  SavedHistoryItem,
  SavedTopic,
} from '../../../../core/services/history.service';
import { ExplainResponse } from '../../../../core/services/ai';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {

  loading = true;
  errorMessage = '';

  items: SavedHistoryItem[] = [];
  savedTopics: SavedTopic[] = [];
  isLoggedIn = false;

  expanded: Record<string, boolean> = {};

  constructor(
    private auth: AuthService,
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();

    if (!this.isLoggedIn) {
      this.loading = false;
      return;
    }

    this.loadItems();
    this.loadSavedTopics();
  }

  loadSavedTopics(): void {
    this.historyService.listTopics().subscribe({
      next: (response) => {
        this.savedTopics = response.items;
      },
      error: (error) => {
        this.errorMessage = this.mapError(error);
      },
    });
  }

  unsaveTopic(topic: SavedTopic): void {
    this.historyService.deleteTopic(topic.topicId).subscribe({
      next: () => {
        this.savedTopics = this.savedTopics.filter(
          (saved) => saved.topicId !== topic.topicId
        );
      },
      error: (error) => {
        this.errorMessage = this.mapError(error);
      },
    });
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';

    this.historyService.list().subscribe({
      next: (response) => {
        this.items = response.items;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.mapError(error);
      },
    });
  }

  toggleItem(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  isExplain(item: SavedHistoryItem): boolean {
    return item.type === 'explain';
  }

  isExplainContent(content: ExplainResponse | SavedChatContent): content is ExplainResponse {
    return 'simpleExplanation' in content;
  }

  isChatContent(content: ExplainResponse | SavedChatContent): content is SavedChatContent {
    return 'messages' in content || 'reply' in content;
  }

  deleteItem(item: SavedHistoryItem): void {
    this.historyService.delete(item.id).subscribe({
      next: () => {
        this.items = this.items.filter(
          (saved) => saved.id !== item.id
        );
      },
      error: (error) => {
        this.errorMessage = this.mapError(error);
      },
    });
  }

  clearAll(): void {
    this.historyService.clear().subscribe({
      next: () => {
        this.items = [];
      },
      error: (error) => {
        this.errorMessage = this.mapError(error);
      },
    });
  }

  formatDate(savedAt: string): string {
    try {
      return new Date(savedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return savedAt;
    }
  }

  private mapError(error: any): string {
    if (error.status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    return (
      error.error?.detail ||
      'Something went wrong loading your dashboard. Please try again.'
    );
  }
}
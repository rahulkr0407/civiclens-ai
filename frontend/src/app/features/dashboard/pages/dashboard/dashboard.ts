import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { HistoryService } from '../../../../core/services/history.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  SavedChatContent,
  SavedHistoryItem,
  SavedTopic,
} from '../../../../core/models/history.model';
import { ExplainResponse } from '../../../../core/models/ai.model';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LoadingSpinner],
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
    private historyService: HistoryService,
    private toast: ToastService
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
        this.toast.success('Topic removed from your saved list.');
      },
      error: (error) => {
        this.toast.error(this.mapActionError(error));
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
        this.toast.success('Item deleted from your history.');
      },
      error: (error) => {
        this.toast.error(this.mapActionError(error));
      },
    });
  }

  clearAll(): void {
    this.historyService.clear().subscribe({
      next: () => {
        this.items = [];
        this.toast.success('All history cleared.');
      },
      error: (error) => {
        this.toast.error(this.mapActionError(error));
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

  private mapActionError(error: any): string {
    if (error.status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    return (
      error.error?.detail ||
      'Something went wrong. Please try again.'
    );
  }
}
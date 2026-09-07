import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackersService } from '../../../../core/services/trackers.service';
import { Tracker } from '../../../../core/models/tracker.model';
import { AiService } from '../../../../core/services/ai';
import {
  ChatMessage,
  ExplainResponse,
  ExplainTrackerRequest,
} from '../../../../core/models/ai.model';
import { AuthService } from '../../../../core/services/auth.service';
import { HistoryService } from '../../../../core/services/history.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { Chip } from '../../../../shared/components/chip/chip';

interface LearnerProfile {
  age: number;
  educationLevel: string;
  interests: string[];
}

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Hinglish'] as const;

@Component({
  selector: 'app-tracker-details',
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule, LoadingSpinner, Chip],
  templateUrl: './tracker-details.html',
})
export class TrackerDetailsComponent implements OnInit {

  loading = true;
  errorMessage = '';

  tracker: Tracker | null = null;

  aiLoading = false;
  aiResult: ExplainResponse | null = null;

  language: (typeof LANGUAGE_OPTIONS)[number] = 'English';
  languageOptions = LANGUAGE_OPTIONS;

  savedExplain = false;

  chatMessages: ChatMessage[] = [];
  chatInput = '';
  chatLoading = false;
  savedChat = false;

  constructor(
    private route: ActivatedRoute,
    private trackersService: TrackersService,
    private aiService: AiService,
    private auth: AuthService,
    private historyService: HistoryService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'No tracker specified.';
      this.loading = false;
      return;
    }

    this.trackersService.get(id).subscribe({
      next: (tracker) => {
        this.tracker = tracker;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.status === 404
            ? 'Tracker not found. It may have been removed or renamed.'
            : 'Something went wrong loading this tracker. Please try again.';
      },
    });
  }

  formatDate(value: string): string {
    try {
      return new Date(value).toLocaleDateString(undefined, {
        dateStyle: 'medium',
      });
    } catch {
      return value;
    }
  }

  isStale(value: string, days = 14): boolean {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return false;
    }
    const msPerDay = 24 * 60 * 60 * 1000;
    return Date.now() - date.getTime() > days * msPerDay;
  }

  regenerateExplanation(): void {
    this.explainWithAI();
  }

  explainWithAI(): void {
    if (!this.tracker || this.aiLoading) {
      return;
    }

    this.aiLoading = true;
    this.aiResult = null;
    this.savedExplain = false;

    const profile = this.getLearnerProfile();

    const request: ExplainTrackerRequest = {
      tracker_id: this.tracker.id,
      age: profile.age,
      education_level: profile.educationLevel,
      interests: profile.interests,
      language: this.language,
    };

    this.aiService.explainTracker(request).subscribe({
      next: (result) => {
        this.aiResult = result;
        this.aiLoading = false;
      },
      error: (error) => {
        this.aiLoading = false;
        this.toast.error(this.mapAiError(error));
      },
    });
  }

  saveExplanation(): void {
    if (!this.tracker || !this.aiResult) {
      return;
    }

    if (!this.requireLogin()) {
      return;
    }

    this.historyService
      .save({
        type: 'explain',
        topicId: this.tracker.id,
        topicTitle: this.tracker.title,
        language: this.language,
        content: this.aiResult,
      })
      .subscribe({
        next: () => {
          this.savedExplain = true;
          this.toast.success('Explanation saved to your dashboard.');
        },
        error: (error) => {
          this.toast.error(this.mapSaveError(error));
        },
      });
  }

  sendChatMessage(): void {
    const content = this.chatInput.trim();

    if (!content || !this.tracker || this.chatLoading) {
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content };
    this.chatMessages = [...this.chatMessages, userMessage];
    this.chatInput = '';
    this.chatLoading = true;

    this.aiService
      .chatTracker({
        tracker_id: this.tracker.id,
        messages: this.chatMessages,
        language: this.language,
      })
      .subscribe({
        next: (result) => {
          this.chatMessages = [
            ...this.chatMessages,
            { role: 'assistant', content: result.reply },
          ];
          this.chatLoading = false;
        },
        error: (error) => {
          this.chatLoading = false;
          this.toast.error(this.mapAiError(error));
        },
      });
  }

  clearChat(): void {
    this.chatMessages = [];
    this.savedChat = false;
  }

  saveChat(): void {
    if (!this.tracker || !this.chatMessages.length) {
      return;
    }

    if (!this.requireLogin()) {
      return;
    }

    const lastMessage = this.chatMessages[this.chatMessages.length - 1];

    if (lastMessage.role !== 'assistant') {
      return;
    }

    this.historyService
      .save({
        type: 'chat',
        topicId: this.tracker.id,
        topicTitle: this.tracker.title,
        language: this.language,
        content: {
          messages: this.chatMessages,
          reply: lastMessage.content,
        },
      })
      .subscribe({
        next: () => {
          this.savedChat = true;
          this.toast.success('Conversation saved to your dashboard.');
        },
        error: (error) => {
          this.toast.error(this.mapSaveError(error));
        },
      });
  }

  private getLearnerProfile(): LearnerProfile {
    const saved = localStorage.getItem('civiclens_user');

    if (saved) {
      try {
        const user = JSON.parse(saved);
        return {
          age: typeof user.age === 'number' ? user.age : 18,
          educationLevel:
            typeof user.educationLevel === 'string' && user.educationLevel
              ? user.educationLevel
              : 'General',
          interests: Array.isArray(user.interests) ? user.interests : [],
        };
      } catch {
        // Fall through to defaults if the stored profile is corrupted.
      }
    }

    return {
      age: 18,
      educationLevel: 'General',
      interests: [],
    };
  }

  private requireLogin(): boolean {
    const loggedIn = this.auth.isLoggedIn();

    if (!loggedIn) {
      this.toast.warning(
        'Please log in to save items to your dashboard.'
      );
    }

    return loggedIn;
  }

  private mapSaveError(error: any): string {
    if (error.status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    return (
      error.error?.detail ||
      'Could not save right now. Please try again.'
    );
  }

  private mapAiError(error: any): string {
    if (error.status === 404) {
      return 'This tracker is no longer available.';
    }

    if (error.status === 502) {
      return (
        error.error?.detail ||
        'The AI service is temporarily unavailable. Please try again later.'
      );
    }

    if (error.status === 0) {
      return 'Unable to connect to the server. Please try again.';
    }

    return (
      error.error?.detail ||
      'Something went wrong generating the explanation. Please try again.'
    );
  }

  statusClass(status: string): Record<string, boolean> {
    const lower = status.toLowerCase();
    const passed = lower.includes('passed');
    const committee = lower.includes('committee') || lower.includes('active');
    const concluded = lower.includes('concluded') || lower.includes('negatived');

    return {
      'bg-green-50 text-green-700': passed && !concluded,
      'bg-amber-50 text-amber-700': committee && !passed && !concluded,
      'bg-slate-100 text-slate-600': concluded,
    };
  }
}
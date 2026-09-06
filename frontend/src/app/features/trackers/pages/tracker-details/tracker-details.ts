import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackersService, Tracker } from '../../../../core/services/trackers.service';
import {
  AiService,
  ExplainResponse,
  ExplainTrackerRequest,
} from '../../../../core/services/ai';
import { AuthService } from '../../../../core/services/auth.service';
import { HistoryService } from '../../../../core/services/history.service';

interface LearnerProfile {
  age: number;
  educationLevel: string;
  interests: string[];
}

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Hinglish'] as const;

@Component({
  selector: 'app-tracker-details',
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule],
  templateUrl: './tracker-details.html',
})
export class TrackerDetailsComponent implements OnInit {

  loading = true;
  errorMessage = '';

  tracker: Tracker | null = null;

  aiLoading = false;
  aiError = '';
  aiResult: ExplainResponse | null = null;

  language: (typeof LANGUAGE_OPTIONS)[number] = 'English';
  languageOptions = LANGUAGE_OPTIONS;

  savedExplain = false;
  saveMessage = '';

  constructor(
    private route: ActivatedRoute,
    private trackersService: TrackersService,
    private aiService: AiService,
    private auth: AuthService,
    private historyService: HistoryService,
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

  regenerateExplanation(): void {
    this.explainWithAI();
  }

  explainWithAI(): void {
    if (!this.tracker || this.aiLoading) {
      return;
    }

    this.aiLoading = true;
    this.aiError = '';
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
        this.aiError = this.mapAiError(error);
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

    this.saveMessage = '';

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
          this.saveMessage = 'Explanation saved to your dashboard.';
        },
        error: (error) => {
          this.saveMessage = this.mapSaveError(error);
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
      this.saveMessage = 'Please log in to save items to your dashboard.';
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
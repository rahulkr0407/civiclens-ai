import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../../../core/services/search';
import {
  AiService,
  ChatMessage,
  ExplainRequest,
  ExplainResponse,
} from '../../../../core/services/ai';
import { AuthService } from '../../../../core/services/auth.service';
import { HistoryService } from '../../../../core/services/history.service';
import { Topic } from '../../../../core/models/topic';

interface LearnerProfile {
  age: number;
  educationLevel: string;
  interests: string[];
}

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Hinglish'] as const;

@Component({
  selector: 'app-topic-details',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './topic-details.html',
})
export class TopicDetailsComponent implements OnInit {

  topic: Topic | undefined;
  searchText = '';

  loading = true;
  errorMessage = '';

  aiLoading = false;
  aiError = '';
  aiResult: ExplainResponse | null = null;

  language: (typeof LANGUAGE_OPTIONS)[number] = 'English';
  languageOptions = LANGUAGE_OPTIONS;

  chatMessages: ChatMessage[] = [];
  chatInput = '';
  chatLoading = false;
  chatError = '';

  savedExplain = false;
  savedChat = false;
  saveMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private aiService: AiService,
    private auth: AuthService,
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.searchText = this.route.snapshot.queryParamMap.get('q') ?? '';

    if (!id) {
      this.loading = false;
      return;
    }

    this.searchService.getTopics().subscribe({
      next: (topics) => {
        this.topic = topics.find(
          (topic: Topic) => topic.id === id
        );
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'Unable to load this topic right now. Please try again later.';
        this.loading = false;
      },
    });
  }

  goBackToResults(): void {
    if (this.searchText) {
      this.router.navigate(['/search'], {
        queryParams: {
          q: this.searchText,
        },
      });
    } else {
      this.router.navigate(['/topics']);
    }
  }

  browseAllTopics(): void {
    this.router.navigate(['/topics']);
  }

  regenerateExplanation(): void {
    this.explainWithAI();
  }

  explainWithAI(): void {
    if (!this.topic || this.aiLoading) {
      return;
    }

    this.aiLoading = true;
    this.aiError = '';
    this.aiResult = null;
    this.savedExplain = false;

    const profile = this.getLearnerProfile();

    const request: ExplainRequest = {
      topic_id: this.topic.id,
      age: profile.age,
      education_level: profile.educationLevel,
      interests: profile.interests,
      language: this.language,
    };

    this.aiService.explain(request).subscribe({
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

  sendChatMessage(): void {
    const content = this.chatInput.trim();

    if (!content || !this.topic || this.chatLoading) {
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content };
    this.chatMessages = [...this.chatMessages, userMessage];
    this.chatInput = '';
    this.chatLoading = true;
    this.chatError = '';

    this.aiService
      .chat({
        topic_id: this.topic.id,
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
          this.chatError = this.mapAiError(error);
        },
      });
  }

  clearChat(): void {
    this.chatMessages = [];
    this.chatError = '';
    this.savedChat = false;
  }

  saveExplanation(): void {
    if (!this.topic || !this.aiResult) {
      return;
    }

    if (!this.requireLogin()) {
      return;
    }

    this.saveMessage = '';

    this.historyService
      .save({
        type: 'explain',
        topicId: this.topic.id,
        topicTitle: this.topic.title,
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

  saveChat(): void {
    if (!this.topic || !this.chatMessages.length) {
      return;
    }

    if (!this.requireLogin()) {
      return;
    }

    const lastMessage = this.chatMessages[this.chatMessages.length - 1];

    if (lastMessage.role !== 'assistant') {
      return;
    }

    this.saveMessage = '';

    this.historyService
      .save({
        type: 'chat',
        topicId: this.topic.id,
        topicTitle: this.topic.title,
        language: this.language,
        content: {
          messages: this.chatMessages,
          reply: lastMessage.content,
        },
      })
      .subscribe({
        next: () => {
          this.savedChat = true;
          this.saveMessage = 'Conversation saved to your dashboard.';
        },
        error: (error) => {
          this.saveMessage = this.mapSaveError(error);
        },
      });
  }

  private requireLogin(): boolean {
    const loggedIn = this.auth.isLoggedIn();

    if (!loggedIn) {
      this.saveMessage =
        'Please log in to save items to your dashboard.';
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

  private mapAiError(error: any): string {
    if (error.status === 404) {
      return 'This topic is no longer available.';
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
}
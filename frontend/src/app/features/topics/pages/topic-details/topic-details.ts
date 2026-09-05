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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private aiService: AiService
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
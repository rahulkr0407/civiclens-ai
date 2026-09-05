import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../../../core/services/search';
import { AiService, ExplainRequest, ExplainResponse } from '../../../../core/services/ai';
import { Topic } from '../../../../core/models/topic';

interface LearnerProfile {
  age: number;
  educationLevel: string;
  interests: string[];
}

@Component({
  selector: 'app-topic-details',
  standalone: true,
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
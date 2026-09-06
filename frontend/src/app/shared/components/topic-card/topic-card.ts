import { Component, Input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Topic } from '../../../core/models/topic';
import { AuthService } from '../../../core/services/auth.service';
import { HistoryService } from '../../../core/services/history.service';

@Component({
  selector: 'app-topic-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './topic-card.html',
  styleUrl: './topic-card.scss',
})
export class TopicCard implements OnInit {

  @Input() topic!: Topic;

  saved = false;
  saveLoading = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.historyService.listTopics().subscribe({
        next: (res) => {
          this.saved = res.items.some((t) => t.topicId === this.topic.id);
        },
        error: () => {
          this.saved = false;
        },
      });
    }
  }

  openTopic(): void {
    this.router.navigate(['/topic', this.topic.id]);
  }

  toggleSave(event: Event): void {
    event.stopPropagation();

    if (this.saveLoading) {
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.saveLoading = true;

    if (this.saved) {
      this.historyService.deleteTopic(this.topic.id).subscribe({
        next: () => {
          this.saved = false;
          this.saveLoading = false;
        },
        error: () => {
          this.saveLoading = false;
        },
      });
    } else {
      this.historyService
        .saveTopic({
          topicId: this.topic.id,
          topicTitle: this.topic.title,
          category: this.topic.category,
          readTime: this.topic.readTime,
          summary: this.topic.summary,
        })
        .subscribe({
          next: () => {
            this.saved = true;
            this.saveLoading = false;
          },
          error: () => {
            this.saveLoading = false;
          },
        });
    }
  }
}
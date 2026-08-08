import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Topic } from '../../../core/models/topic';

@Component({
  selector: 'app-topic-card',
  standalone: true,
  imports: [],
  templateUrl: './topic-card.html',
  styleUrl: './topic-card.scss',
})
export class TopicCard {

  @Input() topic!: Topic;

  constructor(private router: Router) {}

  openTopic(): void {
    this.router.navigate(['/topic', this.topic.id]);
  }
}
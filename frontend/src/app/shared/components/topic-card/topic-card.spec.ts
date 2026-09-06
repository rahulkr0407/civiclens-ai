import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HistoryService } from '../../../core/services/history.service';

import { TopicCard } from './topic-card';

describe('TopicCard', () => {
  let component: TopicCard;
  let fixture: ComponentFixture<TopicCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicCard],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: () => true } },
        { provide: HistoryService, useValue: { listTopics: () => of([]) } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicCard);
    component = fixture.componentInstance;
    component.topic = {
      id: 'gst',
      title: 'GST',
      category: 'Economy',
      summary: 'An indirect tax system.',
      readTime: '5 min',
      sources: [],
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
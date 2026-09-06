import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TopicCard } from './topic-card';

describe('TopicCard', () => {
  let component: TopicCard;
  let fixture: ComponentFixture<TopicCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicCard],
      providers: [provideRouter([])],
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
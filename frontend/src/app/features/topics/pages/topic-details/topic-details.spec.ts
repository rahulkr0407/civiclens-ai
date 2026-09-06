import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { SearchService } from '../../../../core/services/search';
import { AiService } from '../../../../core/services/ai';
import { AuthService } from '../../../../core/services/auth.service';
import { HistoryService } from '../../../../core/services/history.service';

import { TopicDetailsComponent } from './topic-details';

describe('TopicDetailsComponent', () => {
  let component: TopicDetailsComponent;
  let fixture: ComponentFixture<TopicDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => 'gst' },
              queryParamMap: { get: () => null },
            },
          },
        },
        { provide: SearchService, useValue: { getTopics: () => of([]) } },
        {
          provide: AiService,
          useValue: { explain: () => of({}), chat: () => of({}) },
        },
        { provide: AuthService, useValue: { isLoggedIn: () => false } },
        { provide: HistoryService, useValue: {} },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
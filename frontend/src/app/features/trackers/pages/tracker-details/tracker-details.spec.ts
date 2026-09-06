import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TrackersService, Tracker } from '../../../../core/services/trackers.service';
import { AiService } from '../../../../core/services/ai';
import { AuthService } from '../../../../core/services/auth.service';
import { HistoryService } from '../../../../core/services/history.service';

import { TrackerDetailsComponent } from './tracker-details';

describe('TrackerDetailsComponent', () => {
  let component: TrackerDetailsComponent;
  let fixture: ComponentFixture<TrackerDetailsComponent>;
  let service: TrackersService;
  let aiService: AiService;

  const mockTracker: Tracker = {
    id: 'fcra-amendment',
    type: 'bill',
    title: 'Foreign Contribution (Regulation) Amendment Bill, 2026',
    category: 'Governance',
    status: 'In Committee',
    stage: 'Referred to a Joint Parliamentary Committee (Aug 2026)',
    summary: 'Summary text.',
    viewpoints: [
      { side: 'Government view', explanation: 'One side.' },
    ],
    lastUpdated: '2026-08-12',
    sources: [{ name: 'PRS', url: 'https://prsindia.org/billtrack' }],
  };

  const mockAiResult = {
    topicTitle: 'Foreign Contribution (Regulation) Amendment Bill, 2026',
    simpleExplanation: 'plain',
    whyItMatters: 'plain',
    keyPoints: ['one'],
    viewpoints: [{ side: 'Proponents', explanation: 'side' }],
    questionsToThinkAbout: ['q'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackerDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'fcra-amendment' } },
          },
        },
        {
          provide: TrackersService,
          useValue: { get: (id: string) => of({ ...mockTracker, id }) },
        },
        {
          provide: AiService,
          useValue: {
            explainTracker: () => of(mockAiResult),
            chatTracker: () => of({ reply: 'A helpful answer.' }),
          },
        },
        { provide: AuthService, useValue: { isLoggedIn: () => true } },
        {
          provide: HistoryService,
          useValue: { save: () => of({}) },
        },
      ],
    })
    .compileComponents();

    service = TestBed.inject(TrackersService);
    aiService = TestBed.inject(AiService);
    fixture = TestBed.createComponent(TrackerDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load the tracker on init', () => {
    fixture.detectChanges();
    expect(component.tracker?.id).toBe('fcra-amendment');
    expect(component.loading).toBeFalse();
  });

  it('should show an error when the tracker is not found', () => {
    spyOn(service, 'get').and.returnValue(throwError(() => ({ status: 404 })));
    fixture.detectChanges();
    expect(component.errorMessage).toContain('not found');
  });

  it('should generate an AI explanation for the tracker', () => {
    fixture.detectChanges();
    component.explainWithAI();
    expect(component.aiResult?.topicTitle).toContain('Foreign Contribution');
    expect(component.aiLoading).toBeFalse();
    expect(component.aiError).toBe('');
  });

  it('should map a 502 AI error to a friendly message', () => {
    fixture.detectChanges();
    spyOn(aiService, 'explainTracker').and.returnValue(
      throwError(() => ({ status: 502, error: { detail: 'Quota exceeded' } }))
    );
    component.explainWithAI();
    expect(component.aiError).toBe('Quota exceeded');
  });

  it('should send a chat message and store the assistant reply', () => {
    spyOn(aiService, 'chatTracker').and.returnValue(of({ reply: 'A helpful answer.' }));
    fixture.detectChanges();
    component.chatInput = 'What does it change?';
    component.sendChatMessage();
    expect(component.chatMessages.length).toBe(2);
    expect(component.chatMessages[1].content).toBe('A helpful answer.');
    expect(component.chatLoading).toBeFalse();
  });

  it('should detect staleness from the lastUpdated date', () => {
    expect(component.isStale('2000-01-01')).toBeTrue();
    expect(component.isStale(new Date().toISOString())).toBeFalse();
  });

  it('should assign an appropriate badge class by status', () => {
    expect(component.statusClass('In Committee')).toEqual({
      'bg-green-50 text-green-700': false,
      'bg-amber-50 text-amber-700': true,
      'bg-slate-100 text-slate-600': false,
    });
  });
});
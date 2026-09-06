import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TrackersService, Tracker } from '../../../../core/services/trackers.service';

import { TrackerDetailsComponent } from './tracker-details';

describe('TrackerDetailsComponent', () => {
  let component: TrackerDetailsComponent;
  let fixture: ComponentFixture<TrackerDetailsComponent>;
  let service: TrackersService;

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
      ],
    })
    .compileComponents();

    service = TestBed.inject(TrackersService);
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

  it('should assign an appropriate badge class by status', () => {
    expect(component.statusClass('In Committee')).toEqual({
      'bg-green-50 text-green-700': false,
      'bg-amber-50 text-amber-700': true,
      'bg-slate-100 text-slate-600': false,
    });
  });
});
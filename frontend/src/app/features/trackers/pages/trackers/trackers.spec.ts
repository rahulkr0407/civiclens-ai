import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TrackersService, Tracker } from '../../../../core/services/trackers.service';

import { TrackersComponent } from './trackers';

describe('TrackersComponent', () => {
  let component: TrackersComponent;
  let fixture: ComponentFixture<TrackersComponent>;

  const mockBills: Tracker[] = [
    {
      id: 'fcra-amendment',
      type: 'bill',
      title: 'Foreign Contribution (Regulation) Amendment Bill, 2026',
      category: 'Governance',
      status: 'In Committee',
      stage: 'Referred to a Joint Parliamentary Committee (Aug 2026)',
      summary: 'Summary text.',
      lastUpdated: '2026-08-12',
      sources: [{ name: 'PRS', url: 'https://prsindia.org/billtrack' }],
    },
  ];

  const mockProtests: Tracker[] = [
    {
      id: 'farmers-kisan-bachao-padyatra',
      type: 'protest',
      title: 'Farmers\u2019 \u2018Kisan Bachao Padyatra\u2019',
      category: 'Agriculture',
      status: 'Active',
      stage: 'March blocked at the Haryana-Punjab border',
      summary: 'Summary text.',
      viewpoints: [
        {
          side: 'Protesters',
          explanation: 'Demand a legal MSP guarantee.',
        },
      ],
      lastUpdated: '2026-08-17',
      sources: [{ name: 'Down to Earth', url: 'https://www.downtoearth.org.in' }],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackersComponent],
      providers: [
        {
          provide: TrackersService,
          useValue: {
            list: () =>
              of({
                items: [...mockBills, ...mockProtests],
              }),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split items into bills and protests', () => {
    expect(component.bills.length).toBe(1);
    expect(component.protests.length).toBe(1);
  });

  it('should filter visible items by active tab', () => {
    component.setTab('protest');
    expect(component.visible()).toEqual(mockProtests);

    component.setTab('bill');
    expect(component.visible()).toEqual(mockBills);

    component.setTab('all');
    expect(component.visible().length).toBe(2);
  });

  it('should toggle expanded state', () => {
    expect(component.expanded['fcra-amendment']).toBeUndefined();
    component.toggle('fcra-amendment');
    expect(component.expanded['fcra-amendment']).toBeTrue();
    component.toggle('fcra-amendment');
    expect(component.expanded['fcra-amendment']).toBeFalse();
  });

  it('should assign an appropriate badge class by status', () => {
    expect(component.statusClass('Passed by both Houses')).toEqual({
      'bg-green-50 text-green-700': true,
      'bg-amber-50 text-amber-700': false,
      'bg-slate-100 text-slate-600': false,
    });
    expect(component.statusClass('Concluded')).toEqual({
      'bg-green-50 text-green-700': false,
      'bg-amber-50 text-amber-700': false,
      'bg-slate-100 text-slate-600': true,
    });
  });
});
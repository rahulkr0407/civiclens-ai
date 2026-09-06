import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SearchService } from '../../../../core/services/search';

import { TrendingTopics } from './trending-topics';

describe('TrendingTopics', () => {
  let component: TrendingTopics;
  let fixture: ComponentFixture<TrendingTopics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingTopics],
      providers: [
        { provide: SearchService, useValue: { getTopics: () => of([]) } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendingTopics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
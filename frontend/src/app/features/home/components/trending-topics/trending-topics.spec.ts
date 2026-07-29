import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingTopics } from './trending-topics';

describe('TrendingTopics', () => {
  let component: TrendingTopics;
  let fixture: ComponentFixture<TrendingTopics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingTopics]
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

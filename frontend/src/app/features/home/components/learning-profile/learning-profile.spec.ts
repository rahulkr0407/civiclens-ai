import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningProfile } from './learning-profile';

describe('LearningProfile', () => {
  let component: LearningProfile;
  let fixture: ComponentFixture<LearningProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningProfileComponent } from './learning-profile';

describe('LearningProfile', () => {
  let component: LearningProfileComponent;
  let fixture: ComponentFixture<LearningProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

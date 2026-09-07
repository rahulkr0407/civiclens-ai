import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastService } from '../../../core/services/toast.service';

import { ToastRegion } from './toast-region';

describe('ToastRegion', () => {
  let component: ToastRegion;
  let fixture: ComponentFixture<ToastRegion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastRegion],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastRegion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render toasts from the service', () => {
    const service = TestBed.inject(ToastService);
    service.success('Saved successfully');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Saved successfully');
  });

  it('should dismiss a toast via the close button', () => {
    const service = TestBed.inject(ToastService);
    service.error('Something failed');
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('.toast__close') as HTMLButtonElement;
    closeButton.click();
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string).trim()).toBe('');
  });
});
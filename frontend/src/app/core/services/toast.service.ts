import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  private counter = 0;

  private toastsSubject = new BehaviorSubject<Toast[]>([]);

  toasts$ = this.toastsSubject.asObservable();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message, 6000);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  show(type: ToastType, message: string, durationMs = 4000): void {
    const toast: Toast = {
      id: ++this.counter,
      type,
      message,
    };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(toast.id), durationMs);
    }
  }

  dismiss(id: number): void {
    this.toastsSubject.next(
      this.toastsSubject.value.filter((toast) => toast.id !== id)
    );
  }
}
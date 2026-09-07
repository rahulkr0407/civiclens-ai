import { Component, OnInit } from '@angular/core';
import { Toast, ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-region',
  imports: [],
  templateUrl: './toast-region.html',
  styleUrl: './toast-region.scss',
})
export class ToastRegion implements OnInit {

  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  toastClass(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'toast toast--success';
      case 'error':
        return 'toast toast--error';
      case 'warning':
        return 'toast toast--warning';
      case 'info':
      default:
        return 'toast toast--info';
    }
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
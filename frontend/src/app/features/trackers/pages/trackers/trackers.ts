import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrackersService, Tracker, TrackerType } from '../../../../core/services/trackers.service';

@Component({
  selector: 'app-trackers',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './trackers.html',
})
export class TrackersComponent implements OnInit {

  loading = true;
  errorMessage = '';

  activeTab: 'all' | TrackerType = 'all';

  tabs: Array<'all' | TrackerType> = ['all', 'bill', 'protest'];

  bills: Tracker[] = [];
  protests: Tracker[] = [];

  expanded: Record<string, boolean> = {};

  constructor(private trackersService: TrackersService) {}

  ngOnInit(): void {
    this.loadTrackers();
  }

  loadTrackers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.trackersService.list().subscribe({
      next: (response) => {
        this.bills = response.items.filter((t) => t.type === 'bill');
        this.protests = response.items.filter((t) => t.type === 'protest');
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.mapError(error);
      },
    });
  }

  setTab(tab: 'all' | TrackerType): void {
    this.activeTab = tab;
  }

  visible(): Tracker[] {
    if (this.activeTab === 'bill') {
      return this.bills;
    }
    if (this.activeTab === 'protest') {
      return this.protests;
    }
    return [...this.bills, ...this.protests];
  }

  toggle(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  statusClass(status: string): Record<string, boolean> {
    const lower = status.toLowerCase();
    const passed = lower.includes('passed');
    const committee = lower.includes('committee') || lower.includes('active');
    const concluded = lower.includes('concluded') || lower.includes('negatived');

    return {
      'bg-green-50 text-green-700': passed && !concluded,
      'bg-amber-50 text-amber-700': committee && !passed && !concluded,
      'bg-slate-100 text-slate-600': concluded,
    };
  }

  formatDate(value: string): string {
    try {
      return new Date(value).toLocaleDateString(undefined, {
        dateStyle: 'medium',
      });
    } catch {
      return value;
    }
  }

  isStale(value: string, days = 14): boolean {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return false;
    }
    const msPerDay = 24 * 60 * 60 * 1000;
    return Date.now() - date.getTime() > days * msPerDay;
  }

  private mapError(error: any): string {
    return (
      error.error?.detail ||
      'Something went wrong loading the trackers. Please try again.'
    );
  }
}
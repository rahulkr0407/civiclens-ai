import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { TrackersService, Tracker } from '../../../../core/services/trackers.service';

@Component({
  selector: 'app-tracker-details',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './tracker-details.html',
})
export class TrackerDetailsComponent implements OnInit {

  loading = true;
  errorMessage = '';

  tracker: Tracker | null = null;

  constructor(
    private route: ActivatedRoute,
    private trackersService: TrackersService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'No tracker specified.';
      this.loading = false;
      return;
    }

    this.trackersService.get(id).subscribe({
      next: (tracker) => {
        this.tracker = tracker;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.status === 404
            ? 'Tracker not found. It may have been removed or renamed.'
            : 'Something went wrong loading this tracker. Please try again.';
      },
    });
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
}
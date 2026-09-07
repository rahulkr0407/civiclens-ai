import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chip',
  imports: [],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
})
export class Chip {
  @Input() label = '';
  @Input() tone: 'primary' | 'indigo' | 'red' | 'orange' = 'primary';
  @Input() size: 'sm' | 'md' = 'sm';
  @Input() uppercase = false;

  get chipClass(): string {
    const toneClass: Record<Chip['tone'], string> = {
      primary: 'bg-blue-50 text-blue-600',
      indigo: 'bg-indigo-50 text-indigo-700',
      red: 'bg-red-50 text-red-600',
      orange: 'bg-orange-100 text-orange-600',
    };

    return [
      'inline-flex',
      'items-center',
      'rounded-full',
      'font-semibold',
      this.size === 'md'
        ? 'px-4 py-2 text-xs sm:text-sm'
        : 'px-3 py-1 text-xs',
      toneClass[this.tone],
      this.uppercase ? 'uppercase tracking-wide' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
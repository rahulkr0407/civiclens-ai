import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-title',
  imports: [],
  templateUrl: './section-title.html',
  styleUrl: './section-title.scss',
})
export class SectionTitle {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() align: 'center' | 'left' = 'center';
  @Input() heading: 'h1' | 'h2' = 'h1';
}
import { Component } from '@angular/core';

interface Step {
  label: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.html',
})
export class AboutComponent {

  steps: Step[] = [
    {
      label: '1. Search',
      description: 'Find a civic topic you want to understand.',
    },
    {
      label: '2. Understand',
      description: 'Read a simple, neutral explanation of the topic.',
    },
    {
      label: '3. Compare viewpoints',
      description: 'See different sides of the debate side by side.',
    },
    {
      label: '4. Check sources',
      description: 'Open the authoritative references behind each topic.',
    },
    {
      label: '5. Learn',
      description: 'Build your own informed, balanced understanding.',
    },
  ];
}
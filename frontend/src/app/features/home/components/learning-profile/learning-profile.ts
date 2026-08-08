import { Component, OnInit } from '@angular/core';

interface UserProfile {
  fullName: string;
  email: string;
  age: number;
  educationLevel: string;
  interests: string[];
}

@Component({
  selector: 'app-learning-profile',
  standalone: true,
  imports: [],
  templateUrl: './learning-profile.html',
  styleUrl: './learning-profile.scss',
})
export class LearningProfileComponent implements OnInit {

  user: UserProfile | null = null;

  ngOnInit(): void {
    const savedUser = localStorage.getItem('civiclens_user');

    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }

    console.log('Learning profile:', this.user);
  }
}
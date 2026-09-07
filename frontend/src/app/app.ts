import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { ToastRegion } from './shared/components/toast-region/toast-region';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastRegion],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}

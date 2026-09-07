import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { API_BASE_URL } from './api-config';

interface PublicConfig {
  googleClientId: string | null;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class GoogleSignInService {

  private configLoaded = false;
  private config$ = new ReplaySubject<string | null>(1);

  constructor(private http: HttpClient) {}

  /** Fetch public config once and expose the Google client ID. */
  getClientId(): Observable<string | null> {
    if (!this.configLoaded) {
      this.configLoaded = true;
      this.http.get<PublicConfig>(`${API_BASE_URL}/config`).subscribe({
        next: (config) => this.config$.next(config.googleClientId || null),
        error: () => this.config$.next(null),
      });
    }
    return this.config$.asObservable();
  }

  /**
   * Wait for Google Identity Services to load, then render the sign-in
   * button into the given element by id.
   */
  renderButton(containerId: string, clientId: string, onCredential: (credential: string) => void): void {
    this.waitForGis(() => {
      const gis = window.google?.accounts?.id;
      const container = document.getElementById(containerId);

      if (!gis || !container) {
        return;
      }

      gis.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          if (response.credential) {
            onCredential(response.credential);
          }
        },
      });

      gis.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: 300,
        shape: 'pill',
        text: 'continue_with',
      });
    });
  }

  private waitForGis(callback: () => void, attempts = 0): void {
    if (window.google?.accounts?.id) {
      callback();
    } else if (attempts < 50) {
      setTimeout(() => this.waitForGis(callback, attempts + 1), 200);
    }
  }
}
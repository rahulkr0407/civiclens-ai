import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

import { NavbarComponent } from './navbar';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authState$: BehaviorSubject<boolean>;

  beforeEach(async () => {
    authState$ = new BehaviorSubject<boolean>(false);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => authState$.value,
            getUser: () =>
              authState$.value
                ? { id: '1', email: 'a@b.com', fullName: 'Ada' }
                : null,
            authState$: authState$.asObservable(),
            logout: () => authState$.next(false),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start logged out', () => {
    expect(component.isLoggedIn).toBeFalse();
    expect(component.user).toBeNull();
  });

  it('should update to logged in when auth state changes', () => {
    authState$.next(true);
    expect(component.isLoggedIn).toBeTrue();
    expect(component.user?.fullName).toBe('Ada');
  });

  it('should reset to logged out when auth state changes to false', () => {
    authState$.next(true);
    authState$.next(false);
    expect(component.isLoggedIn).toBeFalse();
    expect(component.user).toBeNull();
  });
});
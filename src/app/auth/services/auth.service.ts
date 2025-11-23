import { computed, inject, Injectable, signal } from "@angular/core";
import { User } from "../interfaces/user.interface";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";
import { AuthResponse } from "../interfaces/auth-response.interface";
import { catchError, map, Observable, of, tap } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));
  private http = inject(HttpClient);

  authStatus = computed(() => this._authStatus());
  user = computed(() => this._user());
  token = computed(() => this._token());

  // Observable para que los guards puedan suscribirse
  authStatus$ = toObservable(this._authStatus);


  constructor() {
    // Validamos token al inicializar el servicio
    this.checkStatus().subscribe();
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, { email, password }).pipe(
      tap(resp => this.handleAuthSucess(resp)),
      map(() => true),
      catchError(err => this.handleAuthError(err))
    );
  }

  checkStatus(): Observable<boolean> {
  const token = localStorage.getItem('token');

  if (!token) {
    this._authStatus.set('not-authenticated');
    return of(false);
  }

  return this.http.get<AuthResponse>(`${baseUrl}/auth/check-status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .pipe(
      tap(resp => this.handleAuthSucess(resp)), // ← usa tu método real
      map(() => true),
      catchError(() => {
        this._authStatus.set('not-authenticated');
        this.logout();
        return of(false);
      })
    );
}


  logout() {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');
    localStorage.removeItem('token');
  }

  private handleAuthSucess({ token, user }: AuthResponse) {
    this._user.set(user);
    this._token.set(token);
    this._authStatus.set('authenticated');
    localStorage.setItem('token', token);
    return true;
  }

  private handleAuthError(error: any) {
    this.logout();
    return of(false);
  }
  register(fullName: string, email: string, password: string): Observable<boolean> {
  return this.http.post<AuthResponse>(`${baseUrl}/auth/register`, {
    fullName, email, password
  }).pipe(
    tap(resp => this.handleAuthSucess(resp)),
    map(() => true),
    catchError(() => of(false))
  );
}


}

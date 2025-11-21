import { computed, inject, Injectable, signal } from "@angular/core";
import { User } from "../interfaces/user.interface";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";
import { AuthResponse } from "../interfaces/auth-response.interface";
import { catchError, map, Observable, of, tap, throwIfEmpty } from "rxjs";
import { rxResource } from "@angular/core/rxjs-interop";

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({providedIn: 'root'})
export class AuthService {
    private _authStatus = signal('checking');
    private _user = signal<User|null>(null);
    private _token = signal<string|null>(null);

    private http = inject(HttpClient);

    checkStatusResource = rxResource({
       params: () => ({token: this._token() }),
       stream: () => this.checkStatus()
    });
    constructor() {
        // Aquí llamamos a checkStatus() al inicio para ver si el usuario sigue logeado
        this.checkStatus().subscribe({
            next: (isLoggedIn) => {
                console.log('¿Usuario logeado tras refresh?:', isLoggedIn);
                console.log('Usuario actual:', this.user());
                console.log('Token actual:', this.token());
            },
            error: (err) => console.log('Error al validar token:', err)
        });
    }



    authStatus = computed<AuthStatus>(() => {
        if( this._authStatus() === 'checking') return 'checking';

        if(this._user()) {
            return 'authenticated';
        }
        return 'not-authenticated';
    });

    user = computed(() => this._user());
    token = computed(this._token);

    login(email: string, password: string): Observable<boolean>{
        return this.http.post<AuthResponse>(`${ baseUrl }/auth/login`, {
            email,
            password,
        }).pipe(tap(resp => this.handleAuthSucess(resp)),
        map(() => true),
        catchError((error: any) => this.handleAuthError(error)),
      );
    }

    checkStatus():Observable<boolean>{
        const token = localStorage.getItem('token');
        if(!token) {
            this.logout();
            return of (false);
        }

        return this.http.get<AuthResponse>(`${baseUrl}/auth/check-status`, {
            headers: {
                Authorization: `Bearer ${ token }`,
            },
        }).pipe(map((resp) => this.handleAuthSucess(resp)),
                catchError((error: any) => this.handleAuthError(error)),
      );
    }
    logout() {
        this._user.set(null);
        this._token.set(null)
        this._authStatus.set('not-authenticated');

        localStorage.removeItem('token');
    }
    private handleAuthSucess({token, user}: AuthResponse) {
        this._user.set(user);
        this._authStatus.set('authenticated');
        this._token.set(token);

        localStorage.setItem('token', token);

        return true;
    }

    private handleAuthError( error: any){
        this.logout();
        return of (false);
    }
    
}
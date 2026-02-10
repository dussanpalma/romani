import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  username: string;
  loginTime: number;
  id?: number;
}

export interface LoginResponse {
  id: number;
  nombreUsuario: string;
  mensaje: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private KEY_LOGGED = 'logged';
  private KEY_USER = 'user';
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      nombreUsuario: username,
      contraseña: password
    }).pipe(
      timeout(8000),
      catchError((error) => {
        console.log('Auth login error caught:', error);
        return throwError(() => error);
      })
    );
  }

  saveUser(username: string, response: LoginResponse): void {
    const user: User = {
      username: response.nombreUsuario || username,
      loginTime: Date.now(),
      id: response.id
    };
    localStorage.setItem(this.KEY_LOGGED, 'true');
    localStorage.setItem(this.KEY_USER, JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem(this.KEY_LOGGED);
    localStorage.removeItem(this.KEY_USER);
  }

  isLogged(): boolean {
    return localStorage.getItem(this.KEY_LOGGED) === 'true' && this.getUser() !== null;
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.KEY_USER);
    if (!userStr) {
      this.logout();
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (e) {
      this.logout();
      return null;
    }
  }
}

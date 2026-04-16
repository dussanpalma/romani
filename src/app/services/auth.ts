import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

export interface User {
  username: string;
  loginTime: number;
  id?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private KEY_LOGGED = 'logged';
  private KEY_USER = 'user';
  
  // Credenciales de fronted
  private readonly VALID_USERNAME = 'admin';
  private readonly VALID_PASSWORD = 'palmaromani23';

  login(username: string, password: string): Observable<{ success: boolean; message: string }> {
    if (username === this.VALID_USERNAME && password === this.VALID_PASSWORD) {
      const user: User = {
        username: username,
        loginTime: Date.now(),
        id: 1
      };
      localStorage.setItem(this.KEY_LOGGED, 'true');
      localStorage.setItem(this.KEY_USER, JSON.stringify(user));
      return of({ success: true, message: 'Login exitoso' });
    }
    return throwError(() => new Error('Credenciales inválidas'));
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

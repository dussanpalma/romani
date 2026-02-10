import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  hasError = false;

  login(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.hasError = false;

    console.log('Iniciando login con usuario:', this.username);

    this.auth.login(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.markForCheck();
        console.log('Login response:', response);
        
        if (response.activo && response.id) {
          this.auth.saveUser(this.username, response);
          this.hasError = false;
          this.router.navigate(['/students']);
        } else {
          this.errorMessage = response.mensaje || 'Usuario o contraseña inválidos';
          this.hasError = true;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.hasError = true;
        this.cdr.markForCheck();
        
        console.log('Login error - full error object:', error);
        console.log('Error type:', typeof error);
        console.log('Error error prop:', error?.error);
        
        // Try to get the message from the backend error response
        if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error?.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Usuario o contraseña inválidos';
        }
        
        this.cdr.markForCheck();
        console.log('Final error message:', this.errorMessage);
      }
    });
  }

  cancelLogin(): void {
    this.isLoading = false;
    this.errorMessage = '';
    this.hasError = false;
    this.username = '';
    this.password = '';
    this.showPassword = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.login();
    }
  }

  onInputFocus(): void {
    if (this.hasError && !this.isLoading) {
      this.errorMessage = '';
    }
  }

  clearError(): void {
    this.errorMessage = '';
  }
}

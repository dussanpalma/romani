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

    this.auth.login(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.hasError = false;
        this.router.navigate(['/contacts']);
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Usuario o contraseña inválidos';
        this.cdr.markForCheck();
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

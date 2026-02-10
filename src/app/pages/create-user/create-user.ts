import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-user.html',
  styleUrl: './create-user.scss',
})
export class CreateUserComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  success = false;

  constructor(
    private formBuilder: FormBuilder,
    private studentService: StudentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.formBuilder.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContraseña: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('contraseña')?.value;
    const confirmPassword = group.get('confirmarContraseña')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (!this.userForm.valid) return;

    this.loading = true;
    this.error = null;

    const userData = {
      nombreUsuario: this.userForm.get('nombreUsuario')?.value,
      contraseña: this.userForm.get('contraseña')?.value,
    };

    this.studentService.createUser(userData).subscribe({
      next: (response) => {
        this.success = true;
        this.loading = false;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.router.navigate(['/students']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error al crear el usuario. Intenta nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }

  onCancel() {
    this.router.navigate(['/students']);
  }
}

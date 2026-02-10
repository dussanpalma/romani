import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';

interface User {
  id: number;
  nombreUsuario: string;
  fechaCreacion: string;
  activo: boolean;
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-management.html',
  styleUrl: './users-management.scss',
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;
  selectedUserForDelete: User | null = null;
  showDeleteConfirm = false;
  deleting = false;

  constructor(
    private studentService: StudentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;
    
    this.studentService.getAllUsers().subscribe({
      next: (response) => {
        // Si la respuesta tiene estructura con 'content' (pagination)
        this.users = response.content || response || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error al cargar los usuarios';
        this.cdr.detectChanges();
      },
    });
  }

  openCreateUserModal() {
    this.router.navigate(['/users/new']);
  }

  confirmDelete(user: User) {
    this.selectedUserForDelete = user;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.selectedUserForDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteUser() {
    if (!this.selectedUserForDelete) return;

    this.deleting = true;
    const userId = this.selectedUserForDelete.id;

    this.studentService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userId);
        this.deleting = false;
        this.selectedUserForDelete = null;
        this.showDeleteConfirm = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.deleting = false;
        this.error = error.error?.message || 'Error al eliminar el usuario';
        this.cdr.detectChanges();
      },
    });
  }

  goBack() {
    this.router.navigate(['/students']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

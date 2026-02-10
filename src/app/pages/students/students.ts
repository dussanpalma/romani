import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentSearch } from '../../components/student-search/student-search';
import { StudentFilters } from '../../components/student-filters/student-filters';
import { StudentListComponent } from '../../components/student-list/student-list';
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell';
import { AuthService, User } from '../../services/auth';
import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification';
import { Student, ColorEstado } from '../../models/student.model';

export interface FilterState {
  color: ColorEstado | null;
  tieneCita: boolean | null;
  esNuevo: boolean | null;
  esEstudiante: boolean | null;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, StudentSearch, StudentFilters, StudentListComponent, NotificationBellComponent],
  templateUrl: './students.html',
})
export class StudentsComponent implements OnInit, OnDestroy {
  all: Student[] = [];
  filtered: Student[] | null = null;
  searchTerm = '';
  showActionsMenu = false;
  studentsWithUpcomingCourseEnd: Student[] = [];
  currentUser: User | null = null;
  activeFilters: FilterState = {
    color: null,
    tieneCita: null,
    esNuevo: null,
    esEstudiante: null,
  };
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private auth: AuthService,
    private studentService: StudentService, 
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Validar sesión
    this.currentUser = this.auth.getUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadStudents();
    this.loadUpcomingCourseEndStudents();
    this.notificationService.fetchUpcomingAppointments();
    this.intervalId = setInterval(() => {
      this.notificationService.fetchUpcomingAppointments();
      this.loadUpcomingCourseEndStudents();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  loadStudents(): void {
    this.studentService.getAll().subscribe(students => {
      this.all = students;
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  /**
   * Carga estudiantes con fecha de terminación del curso próxima (próximos 7 días)
   */
  loadUpcomingCourseEndStudents(): void {
    this.studentService.getStudentsWithUpcomingCourseEnd(7).subscribe(
      students => {
        this.studentsWithUpcomingCourseEnd = students;
        this.cdr.detectChanges();
      },
      error => {
        // Si el endpoint no está disponible aún, usar datos locales
        this.studentsWithUpcomingCourseEnd = this.all.filter(s => {
          if (!s.fechaTerminacionCurso) return false;
          const fecha = new Date(s.fechaTerminacionCurso);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          const diffTime = fecha.getTime() - hoy.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        });
      }
    );
  }

  onSearch(term: string) {
    this.searchTerm = term.toLowerCase().trim();
    this.applyFilters();
  }

  onFilterChange(filters: FilterState) {
    this.activeFilters = filters;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.all];

    if (this.searchTerm) {
      result = result.filter(s =>
        s.nombre.toLowerCase().includes(this.searchTerm) ||
        s.telefono.includes(this.searchTerm)
      );
    }

    if (this.activeFilters.color) {
      result = result.filter(s => s.colorEstado === this.activeFilters.color);
    }
    if (this.activeFilters.tieneCita !== null) {
      result = result.filter(s => s.tieneCita === this.activeFilters.tieneCita);
    }
    if (this.activeFilters.esNuevo !== null) {
      result = result.filter(s => s.esNuevo === this.activeFilters.esNuevo);
    }
    if (this.activeFilters.esEstudiante !== null) {
      result = result.filter(s => s.esEstudiante === this.activeFilters.esEstudiante);
    }

    this.filtered = result.length === this.all.length && !this.searchTerm ? null : result;
  }

  openNewForm() {
    this.router.navigate(['/students/new']);
  }

  openCreateUser() {
    // Navegar a la página de crear usuario (si existe) o muestra un modal
    this.router.navigate(['/users/new']);
  }

  openUsersManagement() {
    this.router.navigate(['/users']);
  }

  onEditStudent(student: Student) {
    this.router.navigate(['/students/edit', student.id]);
  }

  onAddComment(data: { student: Student; comment: string }) {
    if (!data.student.id) return;
    const comentario = {
      texto: data.comment,
      fecha: new Date().toISOString()
    };
    this.studentService.addComentario(data.student.id, comentario).subscribe(() => {
      this.loadStudents();
    });
  }
}

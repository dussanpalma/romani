import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './student-profile.html',
})
export class StudentProfileComponent implements OnInit {
  student: Student | null = null;
  showRescheduleModal = false;
  newDate = '';
  newTime = '';
  newComment = '';
  newNotes = '';
  expandedComments: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.studentService.getById(id).subscribe({
      next: (student) => {
        if (!student || student.colorEstado !== 'AMARILLO') {
          this.router.navigate(['/students']);
          return;
        }
        this.student = student;
        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate(['/students']);
      }
    });
  }

  getColorHex(color: string): string {
    switch (color) {
      case 'ROJO': return '#ef4444';
      case 'AMARILLO': return '#f59e0b';
      case 'VERDE': return '#22c55e';
      case 'AZUL': return '#3b82f6';
      default: return '#94a3b8';
    }
  }

  /**
   * Interpreta una fecha en formato local (yyyy-MM-dd'T'HH:mm:ss) sin usar zona horaria
   */
  private parseLocalDateTime(dateString: string): Date {
    if (!dateString) return new Date();
    // Formato esperado: 2026-02-09T14:30:00
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split(':');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'No disponible';
    const d = this.parseLocalDateTime(date);
    return d.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatShortDate(date: string | undefined): string {
    if (!date) return 'No disponible';
    const d = this.parseLocalDateTime(date);
    return d.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(date: string | undefined): string {
    if (!date) return '';
    const d = this.parseLocalDateTime(date);
    return d.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDaysUntilAppointment(): number {
    if (!this.student?.cita?.fechaAgendada) return 0;
    const today = new Date();
    const appointmentDate = this.parseLocalDateTime(this.student.cita.fechaAgendada);
    const diffTime = appointmentDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  openRescheduleModal() {
    this.showRescheduleModal = true;
    if (this.student?.cita?.fechaAgendada) {
      const date = new Date(this.student.cita.fechaAgendada);
      this.newDate = date.toISOString().split('T')[0];
      this.newTime = date.toTimeString().slice(0, 5);
    }
    this.newNotes = this.student?.cita?.notas || '';
  }

  closeRescheduleModal() {
    this.showRescheduleModal = false;
  }

  rescheduleAppointment() {
    if (this.student?.id && this.newDate && this.newTime) {
      // Formato: yyyy-MM-dd'T'HH:mm:ss (sin zona horaria)
      const fechaAgendada = `${this.newDate}T${this.newTime}:00`;
      
      // Mantener la fecha de contacto original o usar la actual
      let fechaContacto = this.student.cita?.fechaContacto;
      if (!fechaContacto) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        fechaContacto = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }
      
      const cita = {
        fechaAgendada: fechaAgendada,
        fechaContacto: fechaContacto,
        notas: this.newNotes || undefined
      };
      this.studentService.createOrUpdateCita(this.student.id, cita).subscribe(() => {
        if (this.student) {
          this.student.cita = { ...this.student.cita, ...cita };
          this.cdr.detectChanges();
        }
        this.showRescheduleModal = false;
        this.newNotes = '';
      });
    }
  }

  addComment() {
    if (this.student?.id && this.newComment.trim()) {
      // Formato: yyyy-MM-dd'T'HH:mm:ss (sin zona horaria)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const fecha = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      
      const comentario = {
        texto: this.newComment.trim(),
        fecha: fecha
      };
      this.studentService.addComentario(this.student.id, comentario).subscribe((newComentario) => {
        if (this.student) {
          this.student.comentarios = [...this.student.comentarios, newComentario];
          this.cdr.detectChanges();
        }
        this.newComment = '';
      });
    }
  }

  goBack() {
    this.router.navigate(['/students']);
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './student-list.html',
})
export class StudentListComponent {
  private _students: Student[] = [];
  
  @Input()
  set students(value: Student[]) {
    this._students = value || [];
  }
  get students(): Student[] {
    return this._students;
  }
  
  @Output() edit = new EventEmitter<Student>();
  @Output() addComment = new EventEmitter<{ student: Student; comment: string }>();
  
  expandedComments: Set<number> = new Set();
  openMenus: Set<number> = new Set();
  newCommentText: { [key: number]: string } = {};

  constructor(private router: Router) {}

  getColorHex(color: string): string {
    switch (color) {
      case 'ROJO': return '#ef4444';
      case 'AMARILLO': return '#FFD700';
      case 'VERDE': return '#22c55e';
      case 'AZUL': return '#3b82f6';
      case 'PURPURA': return '#a855f7';
      case 'NARANJA': return '#ff8c42';
      default: return '#94a3b8';
    }
  }

  getStatusLabel(color: string): string {
    switch (color) {
      case 'ROJO': return 'No llamar';
      case 'AMARILLO': return 'Tiene cita';
      case 'VERDE': return 'Nuevo contacto';
      case 'AZUL': return 'Estudiante';
      case 'PURPURA': return 'Estudiante antiguo';
      case 'NARANJA': return 'Pendiente';
      default: return 'Sin estado';
    }
  }

  toggleComments(studentId: number | undefined) {
    if (!studentId) return;
    if (this.expandedComments.has(studentId)) {
      this.expandedComments.delete(studentId);
    } else {
      this.expandedComments.add(studentId);
    }
  }

  isCommentsExpanded(studentId: number | undefined): boolean {
    if (!studentId) return false;
    return this.expandedComments.has(studentId);
  }

  toggleMenuActions(studentId: number | undefined) {
    if (!studentId) return;
    if (this.openMenus.has(studentId)) {
      this.openMenus.delete(studentId);
    } else {
      this.openMenus.clear();
      this.openMenus.add(studentId);
    }
  }

  isMenuOpen(studentId: number | undefined): boolean {
    if (!studentId) return false;
    return this.openMenus.has(studentId);
  }

  onEdit(student: Student) {
    this.openMenus.clear();
    this.edit.emit(student);
  }

  onViewProfile(student: Student) {
    this.openMenus.clear();
    this.router.navigate(['/student', student.id]);
  }

  submitComment(student: Student) {
    if (!student.id) return;
    const comment = this.newCommentText[student.id]?.trim();
    if (comment) {
      this.addComment.emit({ student, comment });
      this.newCommentText[student.id] = '';
    }
  }

  /**
   * Calcula la diferencia de días entre hoy y la fecha dada
   */
  getDaysDifference(dateString: string | undefined): number | null {
    if (!dateString) return null;
    const fecha = new Date(dateString);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);
    const diffTime = fecha.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene el estado visual de la fecha de terminación
   */
  getDateTerminationStatus(dateString: string | undefined): { 
    status: string; 
    color: string; 
    bgColor: string;
    icon: string;
    message: string;
  } {
    if (!dateString) {
      return { 
        status: 'sin-fecha', 
        color: '#94a3b8', 
        bgColor: 'rgba(0,0,0,0.05)',
        icon: '—',
        message: ''
      };
    }

    const days = this.getDaysDifference(dateString);
    if (days === null) {
      return { 
        status: 'error', 
        color: '#ef4444', 
        bgColor: 'rgba(239,68,68,0.1)',
        icon: '❌',
        message: 'Fecha inválida'
      };
    }

    if (days < 0) {
      return { 
        status: 'vencida', 
        color: '#ef4444', 
        bgColor: 'rgba(239,68,68,0.1)',
        icon: '❌',
        message: `Vencida hace ${Math.abs(days)} días`
      };
    } else if (days === 0) {
      return { 
        status: 'hoy', 
        color: '#f59e0b', 
        bgColor: 'rgba(245,158,11,0.15)',
        icon: '🔔',
        message: 'Termina hoy'
      };
    } else if (days <= 7) {
      return { 
        status: 'proxima', 
        color: '#f59e0b', 
        bgColor: 'rgba(245,158,11,0.15)',
        icon: '⏰',
        message: `En ${days} día${days !== 1 ? 's' : ''}`
      };
    } else if (days <= 30) {
      return { 
        status: 'proxima-mes', 
        color: '#3b82f6', 
        bgColor: 'rgba(59,130,246,0.1)',
        icon: '📅',
        message: `En ${days} días`
      };
    } else {
      return { 
        status: 'lejana', 
        color: '#22c55e', 
        bgColor: 'rgba(34,197,94,0.1)',
        icon: '✅',
        message: `En ${days} días`
      };
    }
  }

  /**
   * Verifica si la fecha está próxima a vencer (próximos 7 días)
   */
  isDateExpiredOrNear(dateString: string | undefined): boolean {
    const days = this.getDaysDifference(dateString);
    return days !== null && days <= 7;
  }
}

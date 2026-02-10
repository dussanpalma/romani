import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Student, ColorEstado, Comentario } from '../../models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './student-form.html',
})
export class StudentForm implements OnChanges {
  @Input() student: Student | null = null;
  @Input() isOpen = false;

  @Output() save = new EventEmitter<Student>();
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<Student>();

  formData: Partial<Student> = this.getEmptyForm();
  newComment = '';

  colors: { value: ColorEstado; label: string; description: string }[] = [
    { value: 'ROJO', label: 'No llamar', description: 'No desea ser contactado' },
    { value: 'AMARILLO', label: 'Tiene cita', description: 'Cita programada' },
    { value: 'VERDE', label: 'Nuevo contacto', description: 'Recién registrado' },
    { value: 'AZUL', label: 'Estudiante', description: 'Ya está inscrito' },
    { value: 'PURPURA', label: 'Estudiante antiguo', description: 'Estudiante previo' },
    { value: 'NARANJA', label: 'Pendiente', description: 'En proceso de validación' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student'] || changes['isOpen']) {
      if (this.student) {
        this.formData = { 
          ...this.student,
          comentarios: [...(this.student.comentarios || [])]
        };
      } else {
        this.formData = this.getEmptyForm();
      }
      this.newComment = '';
    }
  }

  getEmptyForm(): Partial<Student> {
    return {
      nombre: '',
      telefono: '',
      tieneCita: false,
      esNuevo: true,
      esEstudiante: false,
      colorEstado: 'VERDE',
      fechaTerminacionCurso: '',
      comentarios: [],
    };
  }

  getColorHex(color: ColorEstado): string {
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

  addComment() {
    if (this.newComment.trim()) {
      const comment: Comentario = {
        texto: this.newComment.trim(),
        fecha: new Date().toISOString()
      };
      this.formData.comentarios = [...(this.formData.comentarios || []), comment];
      this.newComment = '';
    }
  }

  removeComment(index: number) {
    if (this.formData.comentarios) {
      this.formData.comentarios = this.formData.comentarios.filter((_, i) => i !== index);
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.save.emit(this.formData as Student);
    }
  }

  onClose() {
    this.close.emit();
  }

  onClear() {
    this.formData = this.getEmptyForm();
    this.newComment = '';
  }

  onDelete() {
    if (this.student && confirm('¿Estás seguro de eliminar este estudiante?')) {
      this.delete.emit(this.student);
    }
  }

  isFormValid(): boolean {
    return !!(this.formData.nombre?.trim() && this.formData.telefono?.trim() && this.formData.colorEstado);
  }

  get isEditing(): boolean {
    return !!this.student?.id;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Valida que la fecha de terminación no sea anterior a hoy
   */
  validateFechaTerminacion(): boolean {
    if (!this.formData.fechaTerminacionCurso) {
      return true; // Es opcional, así que valid si está vacía
    }
    const fecha = new Date(this.formData.fechaTerminacionCurso as string);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha >= hoy;
  }

  /**
   * Obtiene estado visual de la fecha (próxima, hoy, vencida, etc)
   */
  getDateStatus(): { status: string; color: string; icon: string } {
    if (!this.formData.fechaTerminacionCurso) {
      return { status: 'sin-fecha', color: '#94a3b8', icon: '—' };
    }

    const fecha = new Date(this.formData.fechaTerminacionCurso as string);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const diffTime = fecha.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'vencida', color: '#ef4444', icon: '❌' };
    } else if (diffDays === 0) {
      return { status: 'hoy', color: '#f59e0b', icon: '⚠️' };
    } else if (diffDays <= 7) {
      return { status: 'proxima', color: '#f59e0b', icon: '⏰' };
    } else if (diffDays <= 30) {
      return { status: 'proxima-mes', color: '#3b82f6', icon: '📅' };
    } else {
      return { status: 'lejana', color: '#22c55e', icon: '✅' };
    }
  }

  /**
   * Formatea la fecha para mostrar en DD/MM/YYYY
   */
  formatDateForDisplay(dateString: string | undefined): string {
    if (!dateString) return '—';
    const fecha = new Date(dateString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Obtiene las opciones de fecha deshabilitada (pasadas)
   */
  getMinDate(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  }
}

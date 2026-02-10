import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Student, ColorEstado, Comentario } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-form-page.html',
  styleUrls: ['./student-form-page.scss'],
})
export class StudentFormPageComponent implements OnInit {
  formData: Partial<Student> = this.getEmptyForm();
  newComment = '';
  isEditing = false;
  studentId: number | null = null;
  showAppointmentModal = false;
  appointmentDate = '';
  appointmentTime = '';
  appointmentNotes = '';
  existingPhones: Set<string> = new Set();
  telefonoError = '';

  colors: { value: ColorEstado; label: string; description: string; icon: string }[] = [
    { value: 'ROJO', label: 'No llamar', description: 'No desea ser contactado', icon: '🚫' },
    { value: 'AMARILLO', label: 'Tiene cita', description: 'Cita programada', icon: '📅' },
    { value: 'VERDE', label: 'Nuevo contacto', description: 'Recién registrado', icon: '✨' },
    { value: 'AZUL', label: 'Estudiante', description: 'Ya está inscrito', icon: '🎓' },
    { value: 'PURPURA', label: 'Estudiante antiguo', description: 'Estudiante previo', icon: '👥' },
    { value: 'NARANJA', label: 'Pendiente', description: 'En proceso de validación', icon: '⏳' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private studentService: StudentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.loadAllStudents();
    if (idParam) {
      this.studentId = parseInt(idParam, 10);
      this.isEditing = true;
      this.loadStudent(this.studentId);
    }
  }

  loadAllStudents(): void {
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.existingPhones.clear();
        students.forEach(student => {
          if (student.telefono) {
            this.existingPhones.add(student.telefono);
          }
        });
      },
      error: () => {
        // Si falla, continuamos sin validación local
      }
    });
  }

  validateTelefono(): void {
    if (!this.formData.telefono) {
      this.telefonoError = '';
      return;
    }

    const currentPhone = this.formData.telefono.trim();
    
    // Si está editando, no contar el teléfono actual como duplicado
    if (this.isEditing && this.existingPhones.has(currentPhone)) {
      this.studentService.getById(this.studentId!).subscribe({
        next: (student) => {
          if (student.telefono !== currentPhone) {
            this.telefonoError = '⚠️ Este número ya está registrado';
          } else {
            this.telefonoError = '';
          }
        }
      });
    } else if (!this.isEditing && this.existingPhones.has(currentPhone)) {
      this.telefonoError = '⚠️ Este número ya está registrado';
    } else {
      this.telefonoError = '';
    }
    this.cdr.detectChanges();
  }

  loadStudent(id: number): void {
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.formData = {
          ...student,
          comentarios: [...(student.comentarios || [])],
        };
        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate(['/students']);
      }
    });
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
      case 'ROJO':
        return '#ef4444';
      case 'AMARILLO':
        return '#FFD700';
      case 'VERDE':
        return '#22c55e';
      case 'AZUL':
        return '#3b82f6';
      case 'PURPURA':
        return '#a855f7';
      case 'NARANJA':
        return '#ff8c42';
      default:
        return '#94a3b8';
    }
  }

  addComment(): void {
    if (this.newComment.trim()) {
      // Formato: yyyy-MM-dd'T'HH:mm:ss (sin zona horaria)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const fecha = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      
      const comment: Comentario = {
        texto: this.newComment.trim(),
        fecha: fecha,
      };
      this.formData.comentarios = [...(this.formData.comentarios || []), comment];
      this.newComment = '';
    }
  }

  removeComment(index: number): void {
    if (this.formData.comentarios) {
      this.formData.comentarios = this.formData.comentarios.filter((_, i) => i !== index);
    }
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      const submitData = async () => {
        if (this.isEditing && this.studentId) {
          return new Promise<void>((resolve, reject) => {
            this.studentService.update(this.studentId!, this.formData).subscribe({
              next: () => resolve(),
              error: (err) => reject(err)
            });
          });
        } else {
          return new Promise<void>((resolve, reject) => {
            this.studentService.create(this.formData as Omit<Student, 'id'>).subscribe({
              next: (student) => {
                if (student.id) {
                  this.studentId = student.id;
                }
                resolve();
              },
              error: (err) => reject(err)
            });
          });
        }
      };

      submitData().then(() => {
        if (this.formData.colorEstado === 'AMARILLO' && this.appointmentDate && this.appointmentTime && this.studentId) {
          this.saveAppointment();
        } else {
          this.router.navigate(['/students']);
        }
      }).catch((error) => {
        // Manejar error de teléfono duplicado
        if (error.error?.message && error.error.message.includes('ya está registrado')) {
          alert('❌ ' + error.error.message);
        } else if (error.error?.message) {
          alert('❌ Error: ' + error.error.message);
        } else {
          alert('❌ Error al guardar el estudiante. Por favor intenta de nuevo.');
        }
      });
    }
  }

  openAppointmentModal(): void {
    this.showAppointmentModal = true;
    this.appointmentDate = '';
    this.appointmentTime = '';
    this.appointmentNotes = '';
  }

  closeAppointmentModal(): void {
    this.showAppointmentModal = false;
  }

  saveAppointment(): void {
    if (this.studentId && this.appointmentDate && this.appointmentTime) {
      // Formato: yyyy-MM-dd'T'HH:mm:ss (sin zona horaria, para que el backend lo interprete localmente)
      const fechaAgendada = `${this.appointmentDate}T${this.appointmentTime}:00`;
      
      // Obtener fecha actual en formato local
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const fechaContacto = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      
      const cita = {
        fechaAgendada: fechaAgendada,
        fechaContacto: fechaContacto,
        notas: this.appointmentNotes || undefined
      };
      this.studentService.createOrUpdateCita(this.studentId, cita).subscribe(() => {
        this.showAppointmentModal = false;
        this.router.navigate(['/students']);
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }

  onClear(): void {
    if (this.isEditing && this.studentId) {
      this.loadStudent(this.studentId);
    } else {
      this.formData = this.getEmptyForm();
    }
    this.newComment = '';
  }

  onDelete(): void {
    if (this.studentId && confirm('¿Estás seguro de eliminar este estudiante? Esta acción no se puede deshacer.')) {
      this.studentService.delete(this.studentId).subscribe(() => {
        this.router.navigate(['/students']);
      });
    }
  }

  isFormValid(): boolean {
    const hasRequiredFields = !!(this.formData.nombre?.trim() && this.formData.telefono?.trim() && this.formData.colorEstado);
    const noPhoneError = !this.telefonoError;
    return hasRequiredFields && noPhoneError;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

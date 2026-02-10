export type ColorEstado = 'ROJO' | 'AMARILLO' | 'VERDE' | 'AZUL' | 'PURPURA' | 'NARANJA';

export interface Cita {
  id?: number;
  fechaAgendada: string;
  fechaContacto: string;
  notas?: string;
}

export interface Comentario {
  id?: number;
  texto: string;
  fecha: string;
}

export interface Student {
  id?: number;
  nombre: string;
  telefono: string;
  tieneCita: boolean;
  esNuevo: boolean;
  esEstudiante: boolean;
  colorEstado: ColorEstado;
  comentarios: Comentario[];
  cita?: Cita;
  fechaTerminacionCurso?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpcomingAppointment {
  student: Student;
  daysUntilAppointment: number;
  type: 'appointment_today' | 'appointment_soon';
}

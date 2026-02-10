import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Student, Comentario, Cita } from '../models/student.model';

export interface SearchFilters {
  q?: string;
  color?: string;
  tiene_cita?: boolean;
  es_nuevo?: boolean;
  es_estudiante?: boolean;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/students`;

  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  create(student: Omit<Student, 'id'>): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  update(id: number, student: Partial<Student>): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(filters: SearchFilters): Observable<Student[]> {
    let params = new HttpParams();
    if (filters.q) params = params.set('q', filters.q);
    if (filters.color) params = params.set('color', filters.color);
    if (filters.tiene_cita !== undefined) params = params.set('tiene_cita', filters.tiene_cita.toString());
    if (filters.es_nuevo !== undefined) params = params.set('es_nuevo', filters.es_nuevo.toString());
    if (filters.es_estudiante !== undefined) params = params.set('es_estudiante', filters.es_estudiante.toString());
    return this.http.get<Student[]>(`${this.apiUrl}/search`, { params });
  }

  getComentarios(studentId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.apiUrl}/${studentId}/comentarios`);
  }

  addComentario(studentId: number, comentario: Omit<Comentario, 'id'>): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.apiUrl}/${studentId}/comentarios`, comentario);
  }

  deleteComentario(studentId: number, comentarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${studentId}/comentarios/${comentarioId}`);
  }

  getCita(studentId: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${studentId}/cita`);
  }

  createOrUpdateCita(studentId: number, cita: Omit<Cita, 'id'>): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}/${studentId}/cita`, cita);
  }

  deleteCita(studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${studentId}/cita`);
  }

  createUser(userData: { nombreUsuario: string; contraseña: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users`, userData);
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/${id}`);
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`);
  }

  /**
   * Obtiene estudiantes cuya fecha de terminación del curso está próxima (próximos N días)
   * @param days Número de días a futuro (default: 7)
   */
  getStudentsWithUpcomingCourseEnd(days: number = 7): Observable<Student[]> {
    let params = new HttpParams().set('days', days.toString());
    return this.http.get<Student[]>(`${this.apiUrl}/upcoming-course-end`, { params });
  }
}

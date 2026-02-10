import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Student, UpcomingAppointment } from '../models/student.model';

export interface Notification {
  id: string;
  student: Student;
  message: string;
  type: 'appointment_soon' | 'appointment_today' | 'pending';
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/students`;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  fetchUpcomingAppointments(days: number = 3): void {
    this.http.get<UpcomingAppointment[]>(`${this.apiUrl}/upcoming-appointments?days=${days}`)
      .subscribe(appointments => {
        const now = new Date();
        const notifications: Notification[] = appointments.map(apt => ({
          id: `${apt.student.id}-${apt.type}-${now.getTime()}`,
          student: apt.student,
          message: apt.type === 'appointment_today' 
            ? `${apt.student.nombre} tiene cita HOY`
            : `${apt.student.nombre} tiene cita en ${apt.daysUntilAppointment} día${apt.daysUntilAppointment > 1 ? 's' : ''}`,
          type: apt.type,
          timestamp: now,
          read: false,
        }));

        const currentNotifs = this.notificationsSubject.getValue();
        const newNotifications = notifications.filter(
          (n) => !currentNotifs.some((c) => c.student.id === n.student.id && c.type === n.type)
        );

        if (newNotifications.length > 0) {
          this.notificationsSubject.next([...currentNotifs, ...newNotifications]);
        }
      });
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  markAsRead(notificationId: string): void {
    const current = this.notificationsSubject.getValue();
    const updated = current.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
  }

  clearNotification(notificationId: string): void {
    const current = this.notificationsSubject.getValue();
    const filtered = current.filter((n) => n.id !== notificationId);
    this.notificationsSubject.next(filtered);
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
  }

  getUnreadCount(): Observable<number> {
    return new Observable((observer) => {
      this.notifications$.subscribe((notifs) => {
        observer.next(notifs.filter((n) => !n.read).length);
      });
    });
  }
}

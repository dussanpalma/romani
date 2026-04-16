import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

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
}

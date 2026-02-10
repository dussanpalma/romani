import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.html',
  styleUrls: ['./notification-bell.scss'],
})
export class NotificationBellComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  showDropdown = false;
  hoveredNotificationId: string | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe((notifs) => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter((n) => !n.read).length;
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  removeNotification(notificationId: string): void {
    this.notificationService.clearNotification(notificationId);
  }

  clearAll(): void {
    this.notificationService.clearAllNotifications();
    this.closeDropdown();
  }

  setHoveredNotification(id: string | null): void {
    this.hoveredNotificationId = id;
  }

  getNotificationStyle(notification: Notification): { [key: string]: string } {
    let style: { [key: string]: string } = {};
    
    if (notification.type === 'appointment_today') {
      style['border-left'] = '4px solid #ef4444';
      style['background'] = this.hoveredNotificationId === notification.id 
        ? 'rgba(99, 102, 241, 0.08)' 
        : 'rgba(239, 68, 68, 0.05)';
    } else if (notification.type === 'appointment_soon') {
      style['border-left'] = '4px solid #f59e0b';
      style['background'] = this.hoveredNotificationId === notification.id 
        ? 'rgba(99, 102, 241, 0.08)' 
        : 'rgba(245, 158, 11, 0.05)';
    } else {
      style['background'] = this.hoveredNotificationId === notification.id 
        ? 'rgba(99, 102, 241, 0.08)' 
        : 'transparent';
    }
    
    return style;
  }

  getNotificationIcon(notification: Notification): string {
    if (notification.type === 'appointment_today') {
      return '🔴';
    } else if (notification.type === 'appointment_soon') {
      return '🟡';
    }
    return '🔵';
  }
}

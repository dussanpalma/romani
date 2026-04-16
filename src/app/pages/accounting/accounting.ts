import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContactService } from '../../services/student.service';
import { Contact, CategoryType, CATEGORIES } from '../../models/student.model';

interface CategoryStats {
  name: CategoryType;
  label: string;
  total: number;
  contacts: number;
  percentage: number;
}

@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounting.html',
  styleUrls: ['./accounting.scss']
})
export class AccountingComponent implements OnInit {
  contacts: Contact[] = [];
  totalVentas: number = 0;
  totalContactosConVentas: number = 0;
  maxVentasContact: Contact | null = null;
  minVentasContact: Contact | null = null;
  categoryStats: CategoryStats[] = [];

  constructor(
    private contactService: ContactService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadVentas();
  }

  loadVentas(): void {
    this.contactService.getAll().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.calculateTotals();
        this.calculateCategoryStats();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando contactos:', error);
      }
    });
  }

  calculateTotals(): void {
    this.totalVentas = 0;
    this.totalContactosConVentas = 0;
    this.maxVentasContact = null;
    this.minVentasContact = null;

    this.contacts.forEach(contact => {
      if (contact.ventas && contact.ventas > 0) {
        this.totalVentas += contact.ventas;
        this.totalContactosConVentas++;

        if (!this.maxVentasContact || contact.ventas > this.maxVentasContact.ventas!) {
          this.maxVentasContact = contact;
        }

        if (!this.minVentasContact || contact.ventas < this.minVentasContact.ventas!) {
          this.minVentasContact = contact;
        }
      }
    });
  }

  calculateCategoryStats(): void {
    this.categoryStats = CATEGORIES.map(cat => {
      const contactsInCategory = this.contacts.filter(c =>
        c.categorias.includes(cat.name)
      );

      const vendedContactsInCategory = contactsInCategory.filter(c =>
        c.ventas && c.ventas > 0
      );

      const totalInCategory = vendedContactsInCategory.reduce((sum, c) => sum + (c.ventas || 0), 0);

      return {
        name: cat.name,
        label: cat.label,
        total: totalInCategory,
        contacts: vendedContactsInCategory.length,
        percentage: this.totalVentas > 0 ? Math.round((totalInCategory / this.totalVentas) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }

  getContactosPercentage(): number {
    return this.contacts.length > 0 
      ? Math.round((this.totalContactosConVentas / this.contacts.length) * 100)
      : 0;
  }

  getPromedioPorContacto(): number {
    return this.totalContactosConVentas > 0 
      ? Math.round(this.totalVentas / this.totalContactosConVentas)
      : 0;
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getBarWidth(percentage: number): string {
    return `${Math.max(percentage, 5)}%`;
  }

  getTopSellers(): Contact[] {
    return this.contacts
      .filter(c => c.ventas && c.ventas > 0)
      .sort((a, b) => (b.ventas || 0) - (a.ventas || 0))
      .slice(0, 5);
  }
}

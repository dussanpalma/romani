import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth';
import { ContactService } from '../../services/student.service';
import { Contact, CategoryType, CATEGORIES } from '../../models/student.model';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './students.html',
  styleUrls: ['./students.scss']
})
export class ContactsComponent implements OnInit {
  all: Contact[] = [];
  filtered: Contact[] | null = null;
  categories = CATEGORIES;
  selectedCategory: CategoryType | null = null;
  searchTerm = '';
  currentUser: User | null = null;

  constructor(
    private auth: AuthService,
    private contactService: ContactService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadContacts();
  }

  loadContacts(): void {
    this.contactService.getAll().subscribe(contacts => {
      this.all = contacts;
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase().trim();
    this.applyFilters();
  }

  selectCategory(category: CategoryType | null): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.all];

    if (this.selectedCategory) {
      result = result.filter(c => c.categorias.includes(this.selectedCategory!));
    }

    if (this.searchTerm) {
      result = result.filter(c =>
        c.nombre.toLowerCase().includes(this.searchTerm) ||
        c.apellido.toLowerCase().includes(this.searchTerm) ||
        (c.email && c.email.toLowerCase().includes(this.searchTerm)) ||
        c.whatsapp.includes(this.searchTerm) ||
        (c.instagram && c.instagram.toLowerCase().includes(this.searchTerm)) ||
        (c.barrio && c.barrio.toLowerCase().includes(this.searchTerm))
      );
    }

    this.filtered = result;
  }

  viewContact(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/contact', id]);
    }
  }

  editContact(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/contacts/edit', id]);
    }
  }

  deleteContact(id: number | undefined): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      this.contactService.delete(id).subscribe(() => {
        this.loadContacts();
      });
    }
  }

  createNewContact(): void {
    this.router.navigate(['/contacts/new']);
  }

  goToAccounting(): void {
    this.router.navigate(['/accounting']);
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getDisplayedContacts(): Contact[] {
    return this.filtered || this.all;
  }

  getContactCountByCategory(categoryName: string): number {
    return this.all.filter(c => c.categorias.includes(categoryName as CategoryType)).length;
  }
}

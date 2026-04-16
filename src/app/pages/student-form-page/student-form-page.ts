import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Contact, CategoryType, CATEGORIES } from '../../models/student.model';
import { ContactService } from '../../services/student.service';

@Component({
  selector: 'app-student-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-form-page.html',
  styleUrls: ['./student-form-page.scss'],
})
export class ContactFormPageComponent implements OnInit {
  formData: Partial<Contact> = this.getEmptyForm();
  isEditing = false;
  contactId: number | null = null;
  categories = CATEGORIES;
  selectedCategories: Set<CategoryType> = new Set();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contactService: ContactService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.contactId = parseInt(idParam, 10);
      this.isEditing = true;
      this.loadContact(this.contactId);
    }
  }

  loadContact(id: number): void {
    this.contactService.getById(id).subscribe({
      next: (contact: Contact | null) => {
        if (contact) {
          this.formData = { ...contact };
          this.selectedCategories = new Set(contact.categorias || []);
          this.cdr.detectChanges();
        } else {
          this.router.navigate(['/contacts']);
        }
      },
      error: () => {
        this.router.navigate(['/contacts']);
      }
    });
  }

  getEmptyForm(): Partial<Contact> {
    return {
      nombre: '',
      apellido: '',
      whatsapp: '',
      email: '',
      instagram: '',
      barrio: '',
      categorias: [],
      ventas: 0
    };
  }

  toggleCategory(category: CategoryType): void {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }
    this.formData.categorias = Array.from(this.selectedCategories);
  }

  isCategorySelected(category: CategoryType): boolean {
    return this.selectedCategories.has(category);
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      const data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = {
        nombre: this.formData.nombre!,
        apellido: this.formData.apellido!,
        whatsapp: this.formData.whatsapp!,
        email: this.formData.email!,
        instagram: this.formData.instagram || '',
        barrio: this.formData.barrio || '',
        categorias: Array.from(this.selectedCategories),
        ventas: this.formData.ventas || 0
      };

      if (this.isEditing && this.contactId) {
        this.contactService.update(this.contactId, data).subscribe({
          next: () => {
            this.router.navigate(['/contacts']);
          },
          error: (err) => {
            alert('Error al actualizar el contacto');
            console.error(err);
          }
        });
      } else {
        this.contactService.create(data).subscribe({
          next: () => {
            this.router.navigate(['/contacts']);
          },
          error: (err) => {
            alert('Error al crear el contacto');
            console.error(err);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/contacts']);
  }

  onClear(): void {
    if (this.isEditing && this.contactId) {
      this.loadContact(this.contactId);
    } else {
      this.formData = this.getEmptyForm();
      this.selectedCategories.clear();
    }
  }

  onDelete(): void {
    if (this.contactId && confirm('¿Estás seguro de eliminar este contacto?')) {
      this.contactService.delete(this.contactId).subscribe({
        next: () => {
          this.router.navigate(['/contacts']);
        },
        error: (err) => {
          alert('Error al eliminar el contacto');
          console.error(err);
        }
      });
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.nombre?.trim() &&
      this.formData.apellido?.trim() &&
      this.formData.whatsapp?.trim() &&
      this.formData.email?.trim() &&
      this.selectedCategories.size > 0
    );
  }
}

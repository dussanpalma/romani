import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/student.service';
import { Contact, Note } from '../../models/student.model';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.scss']
})
export class ContactProfileComponent implements OnInit {
  contact: Contact | null = null;
  newNoteText = '';
  editingNoteId: number | null = null;
  editingNoteText = '';
  showAddNoteForm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadContact(id);
    }
  }

  loadContact(id: number): void {
    this.contactService.getById(id).subscribe(contact => {
      if (contact) {
        this.contact = contact;
      } else {
        this.router.navigate(['/contacts']);
      }
      this.cdr.detectChanges();
    });
  }

  toggleAddNoteForm(): void {
    this.showAddNoteForm = !this.showAddNoteForm;
    if (!this.showAddNoteForm) {
      this.newNoteText = '';
    }
  }

  addNote(): void {
    if (!this.contact || !this.newNoteText.trim()) return;

    this.contactService.addNote(this.contact.id!, this.newNoteText).subscribe(updated => {
      if (updated) {
        this.contact = updated;
        this.newNoteText = '';
        this.showAddNoteForm = false;
        this.cdr.detectChanges();
      }
    });
  }

  startEditNote(note: Note): void {
    this.editingNoteId = note.id;
    this.editingNoteText = note.text;
  }

  saveEditNote(): void {
    if (!this.contact || this.editingNoteId === null || !this.editingNoteText.trim()) return;

    this.contactService.updateNote(this.contact.id!, this.editingNoteId, this.editingNoteText).subscribe(updated => {
      if (updated) {
        this.contact = updated;
        this.editingNoteId = null;
        this.editingNoteText = '';
        this.cdr.detectChanges();
      }
    });
  }

  cancelEditNote(): void {
    this.editingNoteId = null;
    this.editingNoteText = '';
  }

  deleteNote(noteId: number): void {
    if (!this.contact || !confirm('¿Estás seguro de que deseas eliminar esta nota?')) return;

    this.contactService.deleteNote(this.contact.id!, noteId).subscribe(updated => {
      if (updated) {
        this.contact = updated;
        this.cdr.detectChanges();
      }
    });
  }

  sendWhatsApp(): void {
    if (!this.contact) return;
    const message = `Hola ${this.contact.nombre}!`;
    const whatsappUrl = `https://wa.me/${this.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  openGoogleCalendar(): void {
    if (!this.contact || !this.contact.email) {
      alert('Este contacto no tiene email registrado');
      return;
    }
    const title = `Reunión con ${this.contact.nombre} ${this.contact.apellido}`;
    const description = `Llamada programada con ${this.contact.nombre}. Email: ${this.contact.email}`;
    const googleCalendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&location%20&add=${encodeURIComponent(this.contact.email)}`;
    window.open(googleCalendarUrl, '_blank');
  }

  openCalendly(): void {
    if (!this.contact || !this.contact.email) {
      alert('Este contacto no tiene email registrado');
      return;
    }
    // Abre Calendly con el email del contacto pre-llenado
    const calendlyUrl = `https://calendly.com/?email=${encodeURIComponent(this.contact.email)}&name=${encodeURIComponent(this.contact.nombre + ' ' + this.contact.apellido)}`;
    window.open(calendlyUrl, '_blank');
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }

  getInstagramUrl(instagram: string): string {
    const cleanHandle = instagram.replace(/[@\s]/g, '');
    return `https://instagram.com/${cleanHandle}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

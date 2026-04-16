import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Contact, CategoryType } from '../models/student.model';
import { MOCK_STUDENTS } from '../mocks/student.mocks';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private contacts: Contact[] = this.initializeContacts();

  private initializeContacts(): Contact[] {
    const stored = localStorage.getItem('contacts');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return this.getMockContacts();
      }
    }
    const mocks = this.getMockContacts();
    this.saveToStorage(mocks);
    return mocks;
  }

  private getMockContacts(): Contact[] {
    return MOCK_STUDENTS;
  }

  private saveToStorage(contacts: Contact[]): void {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }

  getAll(): Observable<Contact[]> {
    return of(JSON.parse(JSON.stringify(this.contacts)));
  }

  getById(id: number): Observable<Contact | null> {
    const contact = this.contacts.find(c => c.id === id);
    return of(contact ? JSON.parse(JSON.stringify(contact)) : null);
  }

  create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Observable<Contact> {
    const newId = Math.max(...this.contacts.map(c => c.id || 0), 0) + 1;
    const now = new Date().toISOString();
    const newContact: Contact = {
      ...contact,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    this.contacts.push(newContact);
    this.saveToStorage(this.contacts);
    return of(JSON.parse(JSON.stringify(newContact)));
  }

  update(id: number, contact: Partial<Contact>): Observable<Contact | null> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      const now = new Date().toISOString();
      this.contacts[index] = {
        ...this.contacts[index],
        ...contact,
        updatedAt: now
      };
      this.saveToStorage(this.contacts);
      return of(JSON.parse(JSON.stringify(this.contacts[index])));
    }
    return of(null);
  }

  delete(id: number): Observable<boolean> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contacts.splice(index, 1);
      this.saveToStorage(this.contacts);
      return of(true);
    }
    return of(false);
  }

  getByCategory(category: CategoryType): Observable<Contact[]> {
    const filtered = this.contacts.filter(c => c.categorias.includes(category));
    return of(JSON.parse(JSON.stringify(filtered)));
  }

  getAllCategories(): Observable<CategoryType[]> {
    const categories = new Set<CategoryType>();
    this.contacts.forEach(c => {
      c.categorias.forEach(cat => categories.add(cat));
    });
    return of(Array.from(categories));
  }

  addNote(contactId: number, noteText: string): Observable<Contact | null> {
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact) {
      const now = new Date().toISOString();
      const newNoteId = Math.max(...(contact.notas?.map(n => n.id || 0) || [0]), 0) + 1;
      const newNote = { id: newNoteId, text: noteText, createdAt: now, updatedAt: now };
      if (!contact.notas) contact.notas = [];
      contact.notas.push(newNote);
      contact.updatedAt = now;
      this.saveToStorage(this.contacts);
      return of(JSON.parse(JSON.stringify(contact)));
    }
    return of(null);
  }

  updateNote(contactId: number, noteId: number, newText: string): Observable<Contact | null> {
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact && contact.notas) {
      const note = contact.notas.find(n => n.id === noteId);
      if (note) {
        note.text = newText;
        note.updatedAt = new Date().toISOString();
        contact.updatedAt = new Date().toISOString();
        this.saveToStorage(this.contacts);
        return of(JSON.parse(JSON.stringify(contact)));
      }
    }
    return of(null);
  }

  deleteNote(contactId: number, noteId: number): Observable<Contact | null> {
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact && contact.notas) {
      const index = contact.notas.findIndex(n => n.id === noteId);
      if (index !== -1) {
        contact.notas.splice(index, 1);
        contact.updatedAt = new Date().toISOString();
        this.saveToStorage(this.contacts);
        return of(JSON.parse(JSON.stringify(contact)));
      }
    }
    return of(null);
  }
}

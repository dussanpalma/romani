import { Injectable } from '@angular/core';
import { Observable, of, from, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Contact, CategoryType } from '../models/student.model';
import { MOCK_STUDENTS } from '../mocks/student.mocks';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private contacts$ = new BehaviorSubject<Contact[]>([]);
  private initialized = false;

  constructor(private storageService: StorageService) {
    this.initializeContacts();
  }

  private async initializeContacts(): Promise<void> {
    try {
      let contacts = await this.storageService.getContacts();
      
      if (contacts.length === 0) {
        // Si no hay contactos guardados, usar mocks
        contacts = this.getMockContacts();
        await this.storageService.saveContacts(contacts);
      }
      
      this.contacts$.next(contacts);
      this.initialized = true;
    } catch (error) {
      console.error('Error inicializando contactos:', error);
      // En caso de error, usar mocks
      const mocks = this.getMockContacts();
      this.contacts$.next(mocks);
      this.initialized = true;
    }
  }

  private getMockContacts(): Contact[] {
    return MOCK_STUDENTS;
  }

  private waitForInitialization(): Promise<void> {
    return new Promise(resolve => {
      if (this.initialized) {
        resolve();
      } else {
        const interval = setInterval(() => {
          if (this.initialized) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      }
    });
  }

  getAll(): Observable<Contact[]> {
    return from(this.waitForInitialization()).pipe(
      switchMap(() => this.contacts$.asObservable()),
      map(contacts => JSON.parse(JSON.stringify(contacts)))
    );
  }

  getById(id: number): Observable<Contact | null> {
    return this.contacts$.asObservable().pipe(
      map(contacts => {
        const contact = contacts.find(c => c.id === id);
        return contact ? JSON.parse(JSON.stringify(contact)) : null;
      })
    );
  }

  create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Observable<Contact> {
    return from(this.waitForInitialization()).pipe(
      switchMap(() => {
        const currentContacts = this.contacts$.getValue();
        const newId = Math.max(...currentContacts.map(c => c.id || 0), 0) + 1;
        const now = new Date().toISOString();
        const newContact: Contact = {
          ...contact,
          id: newId,
          createdAt: now,
          updatedAt: now
        };
        
        const updated = [...currentContacts, newContact];
        this.contacts$.next(updated);
        return from(this.storageService.saveContacts(updated)).pipe(
          map(() => JSON.parse(JSON.stringify(newContact)))
        );
      })
    );
  }

  update(id: number, contact: Partial<Contact>): Observable<Contact | null> {
    return from(this.waitForInitialization()).pipe(
      switchMap(() => {
        const currentContacts = this.contacts$.getValue();
        const index = currentContacts.findIndex(c => c.id === id);
        
        if (index === -1) {
          return of(null);
        }

        const now = new Date().toISOString();
        const updated = {
          ...currentContacts[index],
          ...contact,
          updatedAt: now
        };

        const newContacts = [...currentContacts];
        newContacts[index] = updated;
        this.contacts$.next(newContacts);

        return from(this.storageService.saveContacts(newContacts)).pipe(
          map(() => JSON.parse(JSON.stringify(updated)))
        );
      })
    );
  }

  delete(id: number): Observable<boolean> {
    return from(this.waitForInitialization()).pipe(
      switchMap(() => {
        const currentContacts = this.contacts$.getValue();
        const index = currentContacts.findIndex(c => c.id === id);
        
        if (index === -1) {
          return of(false);
        }

        const newContacts = currentContacts.filter(c => c.id !== id);
        this.contacts$.next(newContacts);

        return from(this.storageService.saveContacts(newContacts)).pipe(
          map(() => true)
        );
      })
    );
  }

  getByCategory(category: CategoryType): Observable<Contact[]> {
    return this.contacts$.asObservable().pipe(
      map(contacts => {
        const filtered = contacts.filter(c => c.categorias.includes(category));
        return JSON.parse(JSON.stringify(filtered));
      })
    );
  }

  getAllCategories(): Observable<CategoryType[]> {
    return this.contacts$.asObservable().pipe(
      map(contacts => {
        const categories = new Set<CategoryType>();
        contacts.forEach(c => {
          c.categorias.forEach(cat => categories.add(cat));
        });
        return Array.from(categories);
      })
    );
  }

  addNote(contactId: number, noteText: string): Observable<Contact | null> {
    return from(this.waitForInitialization()).pipe(
      switchMap(() => {
        const currentContacts = this.contacts$.getValue();
        const contact = currentContacts.find(c => c.id === contactId);
        
        if (!contact) {
          return of(null);
        }

        const now = new Date().toISOString();
        const newNoteId = Math.max(...(contact.notas?.map(n => n.id || 0) || [0]), 0) + 1;
        const newNote = { id: newNoteId, text: noteText, createdAt: now, updatedAt: now };
        
        if (!contact.notas) contact.notas = [];
        contact.notas.push(newNote);
        contact.updatedAt = now;

        const newContacts = currentContacts.map(c => c.id === contactId ? contact : c);
        this.contacts$.next(newContacts);

        return from(this.storageService.saveContacts(newContacts)).pipe(
          map(() => JSON.parse(JSON.stringify(contact)))
        );
      })
    );
  }

  updateNote(contactId: number, noteId: number, newText: string): Observable<Contact | null> {
    return from(this.waitForInitialization()).pipe(
      switchMap(() => {
        const currentContacts = this.contacts$.getValue();
        const contact = currentContacts.find(c => c.id === contactId);
        
        if (!contact || !contact.notas) {
          return of(null);
        }

        const note = contact.notas.find(n => n.id === noteId);
        if (!note) {
          return of(null);
        }

        note.text = newText;
        note.updatedAt = new Date().toISOString();
        contact.updatedAt = new Date().toISOString();

        const newContacts = currentContacts.map(c => c.id === contactId ? contact : c);
        this.contacts$.next(newContacts);

        return from(this.storageService.saveContacts(newContacts)).pipe(
          map(() => JSON.parse(JSON.stringify(contact)))
        );
      })
    );
  }

  deleteNote(contactId: number, noteId: number): Observable<Contact | null> {
    return from(this.waitForInitialization()).pipe(
      switchMap(() => {
        const currentContacts = this.contacts$.getValue();
        const contact = currentContacts.find(c => c.id === contactId);
        
        if (!contact || !contact.notas) {
          return of(null);
        }

        contact.notas = contact.notas.filter(n => n.id !== noteId);
        contact.updatedAt = new Date().toISOString();

        const newContacts = currentContacts.map(c => c.id === contactId ? contact : c);
        this.contacts$.next(newContacts);

        return from(this.storageService.saveContacts(newContacts)).pipe(
          map(() => JSON.parse(JSON.stringify(contact)))
        );
      })
    );
  }

  // Métodos para importar/exportar
  exportContacts(): Observable<string> {
    return this.contacts$.asObservable().pipe(
      map(contacts => this.storageService.exportContacts(contacts))
    );
  }

  downloadBackup(): Observable<void> {
    return this.contacts$.asObservable().pipe(
      map(contacts => {
        this.storageService.downloadContactsAsJSON(contacts);
      })
    );
  }

  async importContactsFromJSON(jsonString: string): Promise<Contact[]> {
    return await this.storageService.importContactsFromJSON(jsonString);
  }
}

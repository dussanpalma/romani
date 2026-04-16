import { Injectable } from '@angular/core';
import { Contact } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private dbName = 'romani-db';
  private storeName = 'contacts';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): void {
    if (!indexedDB) {
      console.warn('IndexedDB no está disponible');
      return;
    }

    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onerror = () => {
      console.error('Error al abrir IndexedDB:', request.error);
    };

    request.onsuccess = () => {
      this.db = request.result;
      console.log('IndexedDB inicializada correctamente');
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
        store.createIndex('nombre', 'nombre', { unique: false });
        store.createIndex('apellido', 'apellido', { unique: false });
        store.createIndex('whatsapp', 'whatsapp', { unique: false });
        console.log('Object Store creado');
      }
    };
  }

  // Guardar todos los contactos
  async saveContacts(contacts: Contact[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('IndexedDB no inicializada');
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Limpiar y guardar nuevos datos
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        contacts.forEach(contact => {
          store.add(contact);
        });
      };

      transaction.oncomplete = () => {
        // También guardar en localStorage como cache
        localStorage.setItem('contacts', JSON.stringify(contacts));
        resolve();
      };

      transaction.onerror = () => {
        reject('Error al guardar contactos en IndexedDB');
      };
    });
  }

  // Obtener todos los contactos
  async getContacts(): Promise<Contact[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        // Si IndexedDB no está disponible, intentar localStorage
        const cached = localStorage.getItem('contacts');
        if (cached) {
          try {
            resolve(JSON.parse(cached));
          } catch {
            resolve([]);
          }
        } else {
          resolve([]);
        }
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const contacts = request.result as Contact[];
        if (contacts.length > 0) {
          // Actualizar localStorage cache
          localStorage.setItem('contacts', JSON.stringify(contacts));
          resolve(contacts);
        } else {
          // Si IndexedDB está vacío, intentar recuperar de localStorage
          const cached = localStorage.getItem('contacts');
          if (cached) {
            try {
              const parsedContacts = JSON.parse(cached);
              // Re-guardar en IndexedDB
              this.saveContacts(parsedContacts).then(() => {
                resolve(parsedContacts);
              });
            } catch {
              resolve([]);
            }
          } else {
            resolve([]);
          }
        }
      };

      request.onerror = () => {
        reject('Error al obtener contactos de IndexedDB');
      };
    });
  }

  // Guardar un contacto
  async saveContact(contact: Contact): Promise<Contact> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('IndexedDB no inicializada');
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = contact.id ? store.put(contact) : store.add(contact);

      request.onsuccess = () => {
        resolve(contact);
      };

      request.onerror = () => {
        reject('Error al guardar contacto');
      };
    });
  }

  // Eliminar un contacto
  async deleteContact(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('IndexedDB no inicializada');
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject('Error al eliminar contacto');
      };
    });
  }

  // Exportar contactos como JSON
  exportContacts(contacts: Contact[]): string {
    return JSON.stringify(contacts, null, 2);
  }

  // Descargar JSON como archivo
  downloadContactsAsJSON(contacts: Contact[]): void {
    const json = this.exportContacts(contacts);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contactos-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Importar contactos desde JSON
  async importContactsFromJSON(jsonString: string): Promise<Contact[]> {
    try {
      const contacts = JSON.parse(jsonString) as Contact[];
      if (!Array.isArray(contacts)) {
        throw new Error('El JSON debe contener un array de contactos');
      }
      await this.saveContacts(contacts);
      return contacts;
    } catch (error) {
      throw new Error('Error al importar contactos: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Limpiar todo el almacenamiento
  async clearAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        localStorage.removeItem('contacts');
        resolve();
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        localStorage.removeItem('contacts');
        resolve();
      };

      request.onerror = () => {
        reject('Error al limpiar almacenamiento');
      };
    });
  }

  // Obtener estadísticas de almacenamiento
  async getStorageSize(): Promise<number> {
    return new Promise((resolve) => {
      if (!navigator.storage || !navigator.storage.estimate) {
        resolve(0);
        return;
      }

      navigator.storage.estimate().then(estimate => {
        resolve(estimate.usage || 0);
      });
    });
  }
}

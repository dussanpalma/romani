import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/student.service';
import { StorageService } from '../../services/storage.service';
import { Contact } from '../../models/student.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit {
  contacts: Contact[] = [];
  storageSize: string = '0 MB';

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private contactService: ContactService,
    private storageService: StorageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadContacts();
    this.updateStorageSize();
  }

  loadContacts(): void {
    this.contactService.getAll().subscribe(contacts => {
      this.contacts = contacts;
      this.cdr.detectChanges();
    });
  }

  updateStorageSize(): void {
    this.storageService.getStorageSize().then(size => {
      const mb = (size / (1024 * 1024)).toFixed(2);
      this.storageSize = `${mb} MB`;
      this.cdr.detectChanges();
    });
  }

  exportContacts(): void {
    const dataStr = JSON.stringify(this.contacts, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr));
    element.setAttribute('download', `contactos-backup-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  importContacts(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        const importedContacts = JSON.parse(content);

        if (!Array.isArray(importedContacts)) {
          alert('El archivo no contiene un array válido de contactos');
          return;
        }

        const confirmed = confirm(
          `¿Deseas importar ${importedContacts.length} contactos? Esto reemplazará tus contactos actuales.`
        );

        if (confirmed) {
          this.storageService.saveContacts(importedContacts).then(() => {
            this.loadContacts();
            this.updateStorageSize();
            alert('✅ Contactos importados exitosamente');
          }).catch(error => {
            console.error('Error importing contacts:', error);
            alert('❌ Error al importar contactos');
          });
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('❌ Error al leer el archivo. Asegúrate de que sea un JSON válido');
      }
    };

    reader.readAsText(file);
    input.value = '';
  }

  clearAllData(): void {
    const confirmed = confirm(
      '⚠️ ¿Estás seguro de que deseas eliminar TODOS los contactos? Esta acción no se puede deshacer.'
    );

    if (confirmed) {
      const doubleConfirm = confirm('Esta es tu última oportunidad. ¿Realmente deseas continuar?');
      if (doubleConfirm) {
        this.storageService.clearAll().then(() => {
          this.loadContacts();
          this.updateStorageSize();
          alert('✅ Todos los datos han sido eliminados');
        }).catch(error => {
          console.error('Error clearing data:', error);
          alert('❌ Error al limpiar datos');
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }
}

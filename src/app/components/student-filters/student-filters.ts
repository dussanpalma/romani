import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorEstado } from '../../models/student.model';

export interface FilterState {
  color: ColorEstado | null;
  tieneCita: boolean | null;
  esNuevo: boolean | null;
  esEstudiante: boolean | null;
}

@Component({
  selector: 'app-student-filters',
  standalone: true,
  templateUrl: './student-filters.html',
})
export class StudentFilters {
  @Input() activeFilters: FilterState = {
    color: null,
    tieneCita: null,
    esNuevo: null,
    esEstudiante: null,
  };

  @Output() filterChange = new EventEmitter<FilterState>();

  colors: { value: ColorEstado; label: string }[] = [
    { value: 'ROJO', label: 'No llamar' },
    { value: 'AMARILLO', label: 'Tiene cita' },
    { value: 'VERDE', label: 'Nuevo' },
    { value: 'AZUL', label: 'Estudiante' },
    { value: 'PURPURA', label: 'Estudiante antiguo' },
    { value: 'NARANJA', label: 'Pendiente' },
  ];

  getColorHex(color: ColorEstado): string {
    switch (color) {
      case 'ROJO': return '#ef4444';
      case 'AMARILLO': return '#FFD700';
      case 'VERDE': return '#22c55e';
      case 'AZUL': return '#3b82f6';
      case 'PURPURA': return '#a855f7';
      case 'NARANJA': return '#ff8c42';
      default: return '#94a3b8';
    }
  }

  toggleColorFilter(color: ColorEstado) {
    const newFilters = { ...this.activeFilters };
    newFilters.color = newFilters.color === color ? null : color;
    this.filterChange.emit(newFilters);
  }

  toggleBooleanFilter(field: 'tieneCita' | 'esNuevo' | 'esEstudiante') {
    const newFilters = { ...this.activeFilters };
    if (newFilters[field] === true) {
      newFilters[field] = false;
    } else if (newFilters[field] === false) {
      newFilters[field] = null;
    } else {
      newFilters[field] = true;
    }
    this.filterChange.emit(newFilters);
  }

  clearFilters() {
    this.filterChange.emit({
      color: null,
      tieneCita: null,
      esNuevo: null,
      esEstudiante: null,
    });
  }

  hasActiveFilters(): boolean {
    return (
      this.activeFilters.color !== null ||
      this.activeFilters.tieneCita !== null ||
      this.activeFilters.esNuevo !== null ||
      this.activeFilters.esEstudiante !== null
    );
  }
}

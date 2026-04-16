// Categorías disponibles
export type CategoryType = 'NOVA' | 'Cliente potencial' | 'Plan de alimentación' | 'Plan de ejercicios';

export interface Category {
  name: CategoryType;
  label: string;
  description: string;
}

export interface Note {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id?: number;
  nombre: string;
  apellido: string;
  whatsapp: string;
  email?: string;
  categorias: CategoryType[];
  instagram?: string;
  barrio?: string;
  ventas?: number;
  notas?: Note[];
  createdAt?: string;
  updatedAt?: string;
}

export const CATEGORIES: Category[] = [
  { name: 'NOVA', label: 'NOVA', description: 'Categoría NOVA' },
  { name: 'Cliente potencial', label: 'Cliente potencial', description: 'Potencial cliente' },
  { name: 'Plan de alimentación', label: 'Plan de alimentación', description: 'Con plan nutricional' },
  { name: 'Plan de ejercicios', label: 'Plan de ejercicios', description: 'Con plan de ejercicios' }
];


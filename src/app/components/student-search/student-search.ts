import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './student-search.html',
})
export class StudentSearch {
  term = '';

  @Output() search = new EventEmitter<string>();

  onInput() {
    this.search.emit(this.term);
  }

  clearSearch() {
    this.term = '';
    this.search.emit('');
  }
}

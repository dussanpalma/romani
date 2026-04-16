import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactForm } from './student-form';

describe('StudentForm', () => {
  let component: ContactForm;
  let fixture: ComponentFixture<StudentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

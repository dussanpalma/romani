import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactList } from './student-list';

describe('StudentList', () => {
  let component: ContactList;
  let fixture: ComponentFixture<StudentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

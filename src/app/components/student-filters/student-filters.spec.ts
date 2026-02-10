import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFilters } from './student-filters';

describe('StudentFilters', () => {
  let component: StudentFilters;
  let fixture: ComponentFixture<StudentFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
